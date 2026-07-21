'use server'

import { createClient } from '@/lib/supabase/server'

export async function trackOrderAction(orderNumber: string, emailOrPhone: string) {
  if (!orderNumber || !orderNumber.trim()) {
    return { success: false, error: 'Please enter a valid Order Number.' }
  }

  const supabase = await createClient()
  const cleanOrderNum = orderNumber.trim().toUpperCase()
  const cleanContact = emailOrPhone ? emailOrPhone.trim().toLowerCase() : ''

  // 1. Get user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch matching order
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers:user_id (
        full_name,
        email,
        phone
      ),
      addresses:address_id (
        full_name,
        phone,
        alternate_phone,
        address_line_1,
        city,
        state,
        postal_code
      ),
      order_items (*)
    `)
    .ilike('order_number', cleanOrderNum)
    .maybeSingle()

  if (error || !order) {
    return { success: false, error: 'Order not found. Please double-check your Order Number (e.g. AM-123456-789).' }
  }

  // Verification logic:
  // If user is logged in and owns the order, grant access immediately!
  const isOwner = Boolean(user && user.id === order.user_id)

  if (!isOwner) {
    if (!cleanContact) {
      return { success: false, error: 'Please enter the email address or phone number used during checkout.' }
    }

    const custEmail = (order.customers?.email || '').toLowerCase()
    const custPhone = (order.customers?.phone || '').toLowerCase().replace(/\s+/g, '')
    const addrPhone = (order.addresses?.phone || '').toLowerCase().replace(/\s+/g, '')
    const addrAltPhone = (order.addresses?.alternate_phone || '').toLowerCase().replace(/\s+/g, '')
    const inputCleaned = cleanContact.replace(/\s+/g, '')

    const matchesContact = 
      (custEmail && custEmail === cleanContact) ||
      (custPhone && custPhone.includes(inputCleaned)) ||
      (addrPhone && addrPhone.includes(inputCleaned)) ||
      (addrAltPhone && addrAltPhone.includes(inputCleaned))

    if (!matchesContact) {
      return { success: false, error: 'Order number found, but the provided email or phone number does not match checkout details.' }
    }
  }

  // Fetch product thumbnails for items
  const productIds = Array.from(new Set((order.order_items || []).map((item: any) => item.product_id).filter(Boolean)))
  let productsById: Record<string, string> = {}
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, featured_image_url, product_images ( image_url )')
      .in('id', productIds)

    productsById = (productsData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p.product_images?.[0]?.image_url || p.featured_image_url || null
      return acc
    }, {})
  }

  const enrichedItems = (order.order_items || []).map((item: any) => ({
    ...item,
    image_url: productsById[item.product_id] || null
  }))

  return {
    success: true,
    order: {
      ...order,
      order_items: enrichedItems
    }
  }
}

export async function getUserOrdersAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, orders: [], isGuest: true }
  }

  const { data: userOrders, error } = await supabase
    .from('orders')
    .select(`
      *,
      addresses:address_id (*),
      order_items (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !userOrders) {
    return { success: false, error: error?.message || 'Failed to load orders', orders: [], isGuest: false }
  }

  // Collect all product IDs
  const allProductIds = Array.from(new Set(
    userOrders.flatMap(o => (o.order_items || []).map((i: any) => i.product_id)).filter(Boolean)
  ))

  let productsById: Record<string, string> = {}
  if (allProductIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, featured_image_url, product_images ( image_url )')
      .in('id', allProductIds)

    productsById = (productsData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p.product_images?.[0]?.image_url || p.featured_image_url || null
      return acc
    }, {})
  }

  const enrichedOrders = userOrders.map(order => ({
    ...order,
    order_items: (order.order_items || []).map((item: any) => ({
      ...item,
      image_url: productsById[item.product_id] || null
    }))
  }))

  return { success: true, orders: enrichedOrders, isGuest: false }
}
