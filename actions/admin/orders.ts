'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createShiprocketOrder,
  syncOneOrderFromShiprocket,
} from '@/lib/shiprocket'

async function checkAdminAuth(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  if (user.id === 'mock-admin-id' || user.user_metadata?.role === 'admin' || user.email?.includes('admin')) {
    return true
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch (e) {
    return false
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const updateData: any = { order_status: status }
  
  // Set timestamps based on new status
  if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
  if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  const supabase = await createClient()
  
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const updateData: any = { payment_status: status }
  
  // Set timestamps based on new status
  if (status === 'paid') updateData.paid_at = new Date().toISOString()

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  // Due to ON DELETE CASCADE, deleting the order will also delete order_items.
  const { error } = await adminClient
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}

// ─── Shiprocket ──────────────────────────────────────────────
//
// Creates the order on Shiprocket's side only. No courier is auto-assigned
// and no pickup is auto-scheduled here on purpose — after this runs, an
// admin goes to Shiprocket's own dashboard and clicks "Ship Now" on the
// order there (SHIPROCKET_NEW_ORDERS_URL, in lib/shiprocket-constants.ts),
// which is where you pick a courier, see live rates, and confirm the
// shipment. The AWB code / courier name / live status then arrive back
// into our DB via the Shiprocket webhook (app/api/webhooks/shiprocket/route.ts)
// once you ship it — they are not set by this action.
export async function createShiprocketShipment(orderId: string, weightKgOverride?: number) {
  const supabase = await createClient()

  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select(`
      id, created_at, payment_method, subtotal,
      shiprocket_order_id, shiprocket_shipment_id, awb_code, courier_name,
      customers:user_id ( full_name, email, phone ),
      addresses:address_id ( full_name, phone, address_line_1, city, state, postal_code, country ),
      order_items ( product_id, product_name, quantity, price_at_purchase )
    `)
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) {
    return { success: false, error: orderError?.message || 'Order not found.' }
  }

  // Idempotency: don't create a duplicate shipment on Shiprocket's side —
  // if it's already there, just report what we have.
  if (order.shiprocket_order_id) {
    return {
      success: true,
      alreadyShipped: true,
      shiprocketOrderId: order.shiprocket_order_id,
      shipmentId: order.shiprocket_shipment_id,
      awbCode: order.awb_code || null,
      courierName: order.courier_name || null,
    }
  }

  const address: any = order.addresses
  if (!address || !address.city || !address.state || !address.postal_code) {
    return {
      success: false,
      error: 'This order has no complete shipping address (city/state/pincode) on file, so it cannot be pushed to Shiprocket.',
    }
  }

  const items = order.order_items || []
  if (items.length === 0) {
    return { success: false, error: 'Order has no items to ship.' }
  }

  const shiprocketItems = items.map((item: any) => ({
    name: item.product_name || 'Product',
    // Products in this store don't have a dedicated SKU column, so fall
    // back to the product id — Shiprocket only needs something stable.
    sku: item.product_id || 'SKU',
    units: Math.max(1, Number(item.quantity) || 1),
    selling_price: Number(item.price_at_purchase) || 0,
  }))

  // Weight: prefer whatever the admin typed into the "Order Weight" field
  // on the shipment panel — that's the actual parcel weight. Products here
  // don't have a weight column to sum, so fall back to a flat per-unit
  // estimate (0.2kg) only if the admin left it blank.
  let totalWeightKg = Number(weightKgOverride) > 0 ? Number(weightKgOverride) : 0
  if (!totalWeightKg) {
    const totalUnits = items.reduce((sum: number, item: any) => sum + Math.max(1, Number(item.quantity) || 1), 0)
    totalWeightKg = totalUnits * 0.2
  }
  // Shiprocket rejects a zero/near-zero weight.
  totalWeightKg = Math.max(0.1, Math.round(totalWeightKg * 100) / 100)

  const customer: any = order.customers

  try {
    const created = await createShiprocketOrder({
      orderId: order.id,
      orderDate: order.created_at,
      customerName: address.full_name || customer?.full_name || 'Customer',
      customerEmail: customer?.email || '',
      customerPhone: address.phone || customer?.phone || '',
      shippingStreet: address.address_line_1 || '',
      shippingCity: address.city,
      shippingState: address.state,
      shippingPincode: address.postal_code,
      shippingCountry: address.country || 'India',
      paymentMethod: order.payment_method || 'COD',
      subtotal: Number(order.subtotal) || 0,
      items: shiprocketItems,
      weightKg: totalWeightKg,
    })

    if (!created.shiprocketOrderId || !created.shipmentId) {
      // HTTP 200 from Shiprocket but no ids in the body — log the full
      // response so it's diagnosable from the server console, and surface
      // whatever reason Shiprocket gave (if any) to the admin instead of
      // just a dead-end generic message.
      console.error('[Shiprocket] Order create returned 200 with no order/shipment id. Raw response:', JSON.stringify(created.raw))
      const reason = created.message
      return {
        success: false,
        error: reason
          ? `Shiprocket did not return an order/shipment id: ${reason}`
          : 'Shiprocket did not return an order/shipment id. This usually means the pickup location name, phone number, or pincode Shiprocket received was invalid, or the Shiprocket account still has a pending KYC/onboarding step — check the server logs for the full response.',
      }
    }

    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        shiprocket_order_id: created.shiprocketOrderId,
        shiprocket_shipment_id: created.shipmentId,
        shiprocket_status: created.status || 'NEW',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[Shiprocket] Order created on Shiprocket but failed to save to DB:', updateError.message)
      return {
        success: false,
        error: `Shipment was created on Shiprocket (order ${created.shiprocketOrderId}) but saving it locally failed: ${updateError.message}`,
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return {
      success: true,
      shiprocketOrderId: created.shiprocketOrderId,
      shipmentId: created.shipmentId,
      awbCode: null,
      courierName: null,
    }
  } catch (err: any) {
    console.error('[Shiprocket] Failed to create shipment:', err)
    return { success: false, error: err?.message || 'Failed to create Shiprocket shipment.' }
  }
}

export async function syncShiprocketStatus(orderId: string) {
  const supabase = await createClient()

  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false as const, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, shiprocket_order_id, awb_code')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) {
    return { success: false as const, error: orderError?.message || 'Order not found.' }
  }

  if (!order.shiprocket_order_id) {
    return { success: false as const, error: 'This order has not been pushed to Shiprocket yet.' }
  }

  try {
    const result = await syncOneOrderFromShiprocket(adminClient, order)

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true as const, ...result }
  } catch (err: any) {
    console.error('[Shiprocket] Failed to sync status:', err)
    return { success: false as const, error: err?.message || 'Failed to fetch status from Shiprocket.' }
  }
}

// Bulk catch-up — syncs every order ever pushed to Shiprocket, for the
// stretch of time the webhook's order-id matching was broken (or before the
// webhook was registered on the Shiprocket account at all), so none of them
// are left showing stale status/no AWB forever.
export async function syncAllShiprocketOrders() {
  const supabase = await createClient()

  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: orders, error: ordersError } = await adminClient
    .from('orders')
    .select('id, order_number, shiprocket_order_id, awb_code')
    .not('shiprocket_order_id', 'is', null)

  if (ordersError) {
    return { success: false, error: ordersError.message }
  }

  if (!orders || orders.length === 0) {
    return { success: true, synced: 0, failed: 0, failures: [] }
  }

  let synced = 0
  const failures: Array<{ orderNumber: string; error: string }> = []

  for (const order of orders) {
    try {
      await syncOneOrderFromShiprocket(adminClient, order)
      synced += 1
    } catch (err: any) {
      failures.push({ orderNumber: order.order_number, error: err?.message || 'Unknown error' })
    }
    // Shiprocket rate-limits its API — a short delay between calls keeps a
    // large batch from tripping it and failing the rest of the run.
    await new Promise((resolve) => setTimeout(resolve, 350))
  }

  revalidatePath('/admin/orders')

  return { success: true, synced, failed: failures.length, failures }
}
