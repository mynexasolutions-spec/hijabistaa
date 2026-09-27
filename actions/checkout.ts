'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { calculateShippingCharge } from '@/lib/shipping'
import { sendOrderConfirmationEmail } from '@/lib/email'


// Initialize Razorpay
// We wrap this in a try-catch or check to avoid crashing if keys are missing
let razorpayInstance: any = null
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
} catch (e) {
  console.warn("Razorpay credentials missing or invalid")
}

export async function createOrder(addressId: string, paymentMethod: string, cartItemsFromFrontend: any[]) {
  const supabase = await createClient()

  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // This custom-cookie auth flow never establishes a real Supabase Auth
  // session (auth.uid() is always null for the anon-key client here), so
  // every RLS-protected table below (addresses/orders/order_items/
  // cart_items/product_variants) must be accessed via the service-role
  // client. We've already verified `user` above via the custom cookie.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  // 2. Validate Address
  const { data: address } = await admin
    .from('addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!address) return { success: false, error: 'Invalid shipping address' }

  if (!cartItemsFromFrontend || cartItemsFromFrontend.length === 0) {
    return { success: false, error: 'Your cart is empty in the database.' }
  }

  // 4. Calculate totals securely (Using frontend data for mock compatibility)
  let subtotal = 0
  const orderItems = []

  for (const item of cartItemsFromFrontend) {
    const price = Number(item.price)
    const quantity = Number(item.quantity)
    const lineTotal = price * quantity

    subtotal += lineTotal

    orderItems.push({
      product_id: item.id,
      variant_id: item.variant_id || item.id,
      product_name: item.name,
      variant_name: item.variant_name || 'Default',
      color_name: item.color_name || null,
      size: item.variant_name || null,
      design: item.design || null,
      image_url: item.image_url || null,
      price_at_purchase: price,
      quantity: quantity,
      line_total: lineTotal
    })
  }

  // Fetch shipping settings from DB
  const { data: settingsData } = await supabase
    .from('settings')
    .select('shipping')
    .single()

  const shippingSettings = settingsData?.shipping || {
    flat_rate: 99,
    free_threshold: 1999,
    cod_charge: 50,
    online_discount: 0,
    tiers: []
  }

  const totalQuantity = orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const shipping_cost = calculateShippingCharge(subtotal, totalQuantity, shippingSettings)

  const onlineDiscountPercent = Number(shippingSettings.online_discount ?? 0)

  const cod_cost = 0 // COD is removed
  const online_discount_amount = paymentMethod === 'RAZORPAY'
    ? Math.round((subtotal * onlineDiscountPercent) / 100)
    : 0
  const total_amount = subtotal + shipping_cost + cod_cost - online_discount_amount

  // Generate order number
  const order_number = `AM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  const actualPaymentMethod = 'Online Payment (Razorpay)'

  // 5. Insert Order
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert([{
      id: globalThis.crypto.randomUUID(),
      order_number,
      user_id: user.id,
      address_id: addressId,
      subtotal,
      shipping_cost,
      total_amount,
      payment_status: 'pending',
      order_status: 'pending',
      payment_method: actualPaymentMethod
    }])
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    return { success: false, error: orderError?.message || 'Failed to create order' }
  }

  // 6. Insert Order Items
  const itemsToInsert = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }))

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Failed to insert order items:', itemsError)
    // Never leave an order sitting in the DB with no items — roll it back.
    await admin.from('orders').delete().eq('id', order.id)
    return { success: false, error: 'Failed to create order items' }
  }

  // 7. Handle Payment Method Specific Logic
  if (paymentMethod === 'RAZORPAY') {
    if (!razorpayInstance) {
      return { success: false, error: 'Razorpay is not configured on the server.' }
    }

    try {
      // Create Razorpay Order
      // amount is in paise (multiply by 100)
      const options = {
        amount: Math.round(total_amount * 100),
        currency: 'INR',
        receipt: order.id,
        payment_capture: 1,
        // Razorpay echoes notes back on every payment/order webhook payload.
        // The webhook handler needs this to resolve our internal order id —
        // `payment.receipt` doesn't exist on payment entities (only on
        // orders), so without notes it had no reliable way to match a
        // payment.captured event back to an order.
        notes: {
          internal_order_id: order.id,
        },
      }
      
      const rzpOrder = await razorpayInstance.orders.create(options)

      return { 
        success: true, 
        isRazorpay: true, 
        razorpayOrderId: rzpOrder.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: options.amount
      }
    } catch (err: any) {
      console.error('Razorpay Error:', err)
      return { success: false, error: 'Failed to initialize payment gateway.' }
    }
  }

  // If COD, clear cart, decrement stock, and finish
  await admin
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  for (const item of orderItems) {
    // Wrap in try-catch because mock IDs (e.g. 'p1') will fail UUID cast in Postgres
    try {
      const { data: variant } = await admin.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
      if (variant) {
        await admin.from('product_variants').update({
          stock_quantity: Math.max(0, variant.stock_quantity - item.quantity)
        }).eq('id', item.variant_id)
      }
    } catch (e) {
      console.warn('Skipping stock decrement for mock variant:', item.variant_id)
    }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')
  revalidatePath('/profile')

  return { success: true, isRazorpay: false, order_number: order.order_number, orderId: order.id }
}

export async function verifyRazorpayPayment(
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string,
  internal_order_id: string
) {
  // We MUST use the Admin client here to securely bypass RLS
  // because users should NOT have UPDATE permissions on their orders directly.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()
  const userSupabase = await createClient()

  // 1. Get user securely via regular client to confirm they are logged in
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // 2. Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return { success: false, error: 'Razorpay secret not configured' }

  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex')

  if (generated_signature !== razorpay_signature) {
    return { success: false, error: 'Payment verification failed: Invalid signature' }
  }

  // 3. Update Order Status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      razorpay_order_id,
      razorpay_payment_id
    })
    .eq('id', internal_order_id)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Failed to update order status:', updateError)
    return { success: false, error: 'Failed to update order status' }
  }

  // 4. Get order items to decrement stock
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('variant_id, quantity')
    .eq('order_id', internal_order_id)

  if (orderItems) {
    for (const item of orderItems) {
      if (!item.variant_id) continue
      const { data: variant } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
      if (variant) {
        await supabase.from('product_variants').update({
          stock_quantity: Math.max(0, variant.stock_quantity - item.quantity)
        }).eq('id', item.variant_id)
      }
    }
  }

  // 5. Clear Cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  // 6. Send order confirmation email — best-effort, never blocks checkout
  // success if it fails (missing API key, Brevo error, etc.)
  try {
    const { data: fullOrder } = await supabase
      .from('orders')
      .select(`
        *,
        addresses:address_id (*),
        order_items (*)
      `)
      .eq('id', internal_order_id)
      .maybeSingle()

    if (fullOrder && user.email) {
      await sendOrderConfirmationEmail({
        toEmail: user.email,
        customerName: fullOrder.addresses?.full_name || 'Customer',
        orderNumber: fullOrder.order_number,
        items: fullOrder.order_items || [],
        subtotal: fullOrder.subtotal,
        shippingCost: fullOrder.shipping_cost,
        totalAmount: fullOrder.total_amount,
        address: fullOrder.addresses || null,
      })
    }
  } catch (e) {
    console.error('Failed to send order confirmation email:', e)
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')
  revalidatePath('/profile')

  return { success: true }
}

export async function processCheckout(
  profile: { fullName: string, email: string, phone: string, alternatePhone?: string, street: string, city: string, state: string, zipCode: string },
  items: any[],
  paymentMethod: 'RAZORPAY' | 'COD' | string
) {
  const supabase = await createClient()
  let { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'You must be logged in to checkout.' }

  // Same reasoning as createOrder(): no real Supabase Auth session exists
  // for this custom-cookie user, so addresses/cart_items must go through
  // the service-role client to get past RLS.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  // Ensure customer profile exists in the customers table to satisfy foreign keys
  const { data: customerExists } = await admin
    .from('customers')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!customerExists) {
    const emailToUse = user.email || profile.email
    if (emailToUse) {
      const { data: conflictingCustomer } = await admin
        .from('customers')
        .select('id')
        .eq('email', emailToUse)
        .maybeSingle()

      if (conflictingCustomer && conflictingCustomer.id !== user.id) {
        // Attempt to update the existing record's id, or delete if constrained
        const { error: updateError } = await admin
          .from('customers')
          .update({ id: user.id })
          .eq('id', conflictingCustomer.id)
        
        if (updateError) {
          console.warn('Failed to update existing customer ID, deleting conflicting record:', updateError.message)
          await admin
            .from('customers')
            .delete()
            .eq('id', conflictingCustomer.id)
        }
      }
    }

    const { error: customerError } = await admin
      .from('customers')
      .insert({
        id: user.id,
        email: emailToUse,
        full_name: profile.fullName || 'Customer',
        phone: profile.phone || null
      })
    if (customerError) {
      console.error('Failed to create customer row during checkout:', customerError)
    }
  }

  // 1. Create or get address
  let addressId = ''
  const { data: existingAddress } = await admin
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingAddress) {
    // Update existing address
    await admin.from('addresses').update({
      full_name: profile.fullName,
      phone: profile.phone,
      alternate_phone: profile.alternatePhone || null,
      address_line_1: profile.street,
      city: profile.city,
      state: profile.state,
      postal_code: profile.zipCode,
      country: 'India'
    }).eq('id', existingAddress.id)
    addressId = existingAddress.id
  } else {
    const { data: newAddress, error: addressError } = await admin.from('addresses').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      full_name: profile.fullName,
      phone: profile.phone,
      alternate_phone: profile.alternatePhone || null,
      address_line_1: profile.street,
      city: profile.city,
      state: profile.state,
      postal_code: profile.zipCode,
      country: 'India',
      is_default: true
    }).select('id').single()

    if (addressError || !newAddress) {
      console.error('ADDRESS ERROR:', addressError)
      return { success: false, error: addressError?.message || 'Failed to save address.' }
    }
    addressId = newAddress.id
  }

  // 2. Sync cart items to DB
  // Clear existing cart
  await admin.from('cart_items').delete().eq('user_id', user.id)
  
  // Insert new cart items
  const cartInserts = items.map(item => ({
    user_id: user.id,
    variant_id: item.variant_id || item.id, // Use variant_id directly, fallback to product id if needed
    color_name: item.color_name || null,
    quantity: item.quantity
  }))
  
  const { error: cartError } = await admin.from('cart_items').insert(cartInserts)
  if (cartError) {
    console.error('CART SYNC ERROR:', cartError)
    return { success: false, error: cartError.message || 'Failed to sync cart.' }
  }

  // 3. Call createOrder (pass items from memory to avoid join errors)
  return await createOrder(addressId, paymentMethod, items)
}

export async function cancelPendingOrder(orderId: string, razorpayOrderId?: string) {
  if (!orderId) return
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabaseAdmin = createAdminClient()

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status, razorpay_order_id')
      .eq('id', orderId)
      .maybeSingle()

    // Already resolved (paid, or cancelled by an earlier call) — nothing to do.
    if (!order || order.payment_status !== 'pending') return

    // Razorpay's modal `ondismiss` only means "the modal closed" — for a UPI
    // intent payment it fires the moment the browser switches to the UPI
    // app, well before we know whether the payment actually went through.
    // Don't guess from our own DB timing (that's what raced and lost items
    // before); ask Razorpay directly, since its order status is the source
    // of truth on whether money actually moved. `orders.razorpay_order_id`
    // isn't written to the DB until payment is verified, so at this point
    // it's normally still null — take it from the caller (the browser has
    // it from the moment the Razorpay order was created) and fall back to
    // the DB value in case it's already been backfilled.
    const rzpOrderId = razorpayOrderId || order.razorpay_order_id
    if (rzpOrderId && razorpayInstance) {
      try {
        const rzpOrder = await razorpayInstance.orders.fetch(rzpOrderId)
        if (rzpOrder.status === 'paid') {
          // Payment succeeded after all — leave it alone. The webhook (or
          // verifyRazorpayPayment) will mark it paid, if it hasn't already.
          return
        }
      } catch (e) {
        // Couldn't reach Razorpay to confirm — safer to leave the order as
        // pending than to risk cancelling a payment that actually succeeded.
        console.warn('Failed to confirm Razorpay order status before cancelling:', e)
        return
      }
    }

    // Never delete the order or its items — mark it cancelled instead, so a
    // mistaken or premature cancel can never destroy data. The admin order
    // list already hides non-paid, non-COD orders, so this stays invisible
    // clutter unless someone deliberately looks for it.
    await supabaseAdmin
      .from('orders')
      .update({ order_status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('payment_status', 'pending')

    revalidatePath('/admin/orders')
  } catch (e) {
    console.warn('Failed to cancel pending order:', e)
  }
}

