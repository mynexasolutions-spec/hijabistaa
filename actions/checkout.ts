'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { calculateShippingCharge } from '@/lib/shipping'
import { getPayuConfig, buildRequestHash, formatPayuAmount, getSiteUrl } from '@/lib/payu'

export async function createOrder(addressId: string, paymentMethod: string, cartItemsFromFrontend: any[], couponCode?: string) {
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

  // 4. Calculate totals. The browser only tells us WHICH products/sizes/
  // quantities are in the cart — prices, names and the quantity limits are
  // re-checked against the database so they can't be tampered with.
  if (cartItemsFromFrontend.length > 50) {
    return { success: false, error: 'Too many items in cart.' }
  }

  const productIds = Array.from(new Set(cartItemsFromFrontend.map((i: any) => String(i?.id ?? '')).filter(Boolean)))
  const { data: dbProducts } = await admin
    .from('products')
    .select('id, name, price, is_active')
    .in('id', productIds)
  const { data: dbVariants } = await admin
    .from('product_variants')
    .select('product_id, variant_name, price')
    .in('product_id', productIds)

  const productsById = new Map<string, any>((dbProducts || []).map((p: any) => [p.id, p]))
  const variantsByProduct = new Map<string, any[]>()
  for (const v of dbVariants || []) {
    const list = variantsByProduct.get(v.product_id) || []
    list.push(v)
    variantsByProduct.set(v.product_id, list)
  }

  // The product page also falls back to variants stored in lib/db.json when
  // the DB has none for a product — mirror that so prices still agree.
  let localVariants: any[] | null = null
  const getLocalVariants = async (productId: string) => {
    if (localVariants === null) {
      localVariants = []
      try {
        const fs = await import('fs')
        const path = await import('path')
        const dbPath = path.join(process.cwd(), 'lib', 'db.json')
        if (fs.existsSync(dbPath)) {
          const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
          if (Array.isArray(json.product_variants)) localVariants = json.product_variants
        }
      } catch (e) { }
    }
    return (localVariants || []).filter((v: any) => v.product_id === productId)
  }

  let subtotal = 0
  const orderItems = []

  for (const item of cartItemsFromFrontend) {
    const product = productsById.get(String(item?.id ?? ''))
    if (!product || product.is_active === false) {
      return { success: false, error: `"${item?.name || 'An item'}" is no longer available. Please remove it from your cart.` }
    }

    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return { success: false, error: 'Invalid item quantity.' }
    }

    let variants = variantsByProduct.get(product.id) || []
    if (variants.length === 0) variants = await getLocalVariants(product.id)

    const productPrice = Number(product.price) > 0 ? Number(product.price) : 0
    const variantPrices = variants.map((v: any) => Number(v.price)).filter((n: number) => n > 0)
    const allowedPrices = new Set<number>([productPrice, ...variantPrices].filter((n) => n > 0))

    // Same rule the product page uses: the chosen size's variant price if it
    // has one, otherwise the product's base price.
    const sizeName = String(item.variant_name || '').trim().toLowerCase()
    const matchedVariant = sizeName
      ? variants.find((v: any) => String(v.variant_name || '').trim().toLowerCase() === sizeName && Number(v.price) > 0)
      : null

    let price: number
    if (matchedVariant) {
      price = Number(matchedVariant.price)
    } else if (allowedPrices.has(Number(item.price))) {
      // e.g. "Add to cart" from a listing card (no size chosen) — the card
      // shows a real price of this product; accept it only if it is one.
      price = Number(item.price)
    } else {
      price = productPrice || variantPrices[0] || 0
    }

    if (!(price > 0)) {
      return { success: false, error: `"${product.name}" can't be purchased right now.` }
    }

    const lineTotal = price * quantity
    subtotal += lineTotal

    orderItems.push({
      product_id: product.id,
      variant_id: item.variant_id || item.id,
      product_name: product.name,
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
  const online_discount_amount = paymentMethod === 'PAYU'
    ? Math.round((subtotal * onlineDiscountPercent) / 100)
    : 0

  // Coupon: validated here against the DB (never trust a discount amount sent
  // by the browser). Same rules as the checkout page / validateCoupon().
  let coupon_discount = 0
  if (couponCode && String(couponCode).trim()) {
    const { data: coupon } = await admin
      .from('coupons')
      .select('type, value, min_purchase, is_active')
      .eq('code', String(couponCode).toUpperCase().trim())
      .eq('is_active', true)
      .maybeSingle()

    if (!coupon) return { success: false, error: 'This coupon is no longer valid.' }
    if (subtotal < Number(coupon.min_purchase || 0)) {
      return { success: false, error: `Minimum purchase of ₹${coupon.min_purchase} required to use this coupon.` }
    }
    coupon_discount = coupon.type === 'percentage'
      ? Math.round((subtotal * Number(coupon.value)) / 100)
      : Number(coupon.value)
  }

  const total_amount = Math.max(0, subtotal + shipping_cost + cod_cost - online_discount_amount - coupon_discount)
  if (!(total_amount > 0)) {
    return { success: false, error: 'Order total must be greater than zero.' }
  }

  // Generate order number
  const order_number = `AM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  const actualPaymentMethod = 'Online Payment (PayU)'

  // Fail before creating anything if the gateway isn't configured.
  const payuConfig = paymentMethod === 'PAYU' ? getPayuConfig() : null
  if (paymentMethod === 'PAYU' && !payuConfig) {
    return { success: false, error: 'PayU is not configured on the server.' }
  }

  // PayU transaction ids must be unique per attempt, alphanumeric, <= 25 chars.
  const payuTxnId = paymentMethod === 'PAYU'
    ? `HJ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
    : null

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
      payment_method: actualPaymentMethod,
      ...(payuTxnId ? { payu_txnid: payuTxnId } : {}),
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
  if (paymentMethod === 'PAYU' && payuConfig && payuTxnId) {
    try {
      const { data: addr } = await admin
        .from('addresses')
        .select('full_name, phone')
        .eq('id', addressId)
        .maybeSingle()

      let email = user.email || ''
      if (!email) {
        const { data: customer } = await admin.from('customers').select('email').eq('id', user.id).maybeSingle()
        email = customer?.email || ''
      }

      // PayU rejects names with special characters; the hash must use the
      // exact same sanitised value that is posted.
      const firstname = (addr?.full_name || 'Customer').replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, 60) || 'Customer'
      const phone = (addr?.phone || '').replace(/\D/g, '').slice(-10)
      const amount = formatPayuAmount(total_amount)
      const productinfo = `Order ${order.order_number}`

      const base = await getSiteUrl()
      const returnUrl = `${base}/api/payu/callback`

      const fields: Record<string, string> = {
        key: payuConfig.key,
        txnid: payuTxnId,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        surl: returnUrl,
        furl: returnUrl,
        curl: returnUrl,
        // Our internal order id travels with the transaction and comes back
        // (signed) on both the browser return and the webhook.
        udf1: order.id,
      }
      fields.hash = buildRequestHash(payuConfig, {
        txnid: payuTxnId, amount, productinfo, firstname, email, udf1: order.id,
      })

      return {
        success: true,
        isPayu: true,
        payuUrl: payuConfig.paymentUrl,
        payuFields: fields,
        orderId: order.id,
        orderNumber: order.order_number,
      }
    } catch (err: any) {
      console.error('PayU Error:', err)
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

  return { success: true, isPayu: false, order_number: order.order_number, orderId: order.id }
}

export async function processCheckout(
  profile: { fullName: string, email: string, phone: string, alternatePhone?: string, street: string, city: string, state: string, zipCode: string },
  items: any[],
  paymentMethod: 'PAYU' | 'COD' | string,
  couponCode?: string
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
  return await createOrder(addressId, paymentMethod, items, couponCode)
}
