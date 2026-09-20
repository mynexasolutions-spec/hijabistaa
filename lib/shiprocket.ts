// Shiprocket API client.
//
// Auth model: Shiprocket does not issue a static API key. You authenticate
// with the email/password of the dedicated "API user" you created in
// Shiprocket -> Settings -> API, exchange it for a bearer token, then use
// that token on every subsequent call. Tokens are valid for ~10 days, so we
// cache the token in-memory (per warm server instance) and refresh it when
// it's missing or close to expiry.
//
// Server-only: this file makes network calls with server secrets and must
// only be imported from 'use server' actions or route handlers, never from
// a client component. (See lib/shiprocket-constants.ts for the one export
// that's safe to use client-side.)

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external'

let cachedToken: string | null = null
let cachedTokenExpiresAt = 0 // epoch ms

async function login(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD are not configured on the server environment.')
  }

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.token) {
    console.error('[Shiprocket] Login failed:', res.status, data)
    throw new Error(data?.message || 'Failed to authenticate with Shiprocket.')
  }

  cachedToken = data.token
  // Tokens last ~10 days; refresh a day early to be safe.
  cachedTokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000
  return cachedToken
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken
  }
  return login()
}

async function shiprocketFetch(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  const token = await getToken()

  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  // If the cached token was rejected, refresh once and retry.
  if (res.status === 401 && retry) {
    cachedToken = null
    return shiprocketFetch(path, options, false)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    console.error(`[Shiprocket] ${path} failed:`, res.status, data)
    const message =
      data?.message ||
      (data?.errors ? JSON.stringify(data.errors) : `Shiprocket request failed (${res.status})`)
    throw new Error(message)
  }

  return data
}

export type ShiprocketOrderItem = {
  name: string
  sku: string
  units: number
  selling_price: number
}

export type BuildOrderPayloadInput = {
  orderId: string
  orderDate: string // ISO string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingPincode: string
  shippingCountry?: string
  paymentMethod: string // 'COD' | 'Cash on Delivery' | 'Razorpay' | etc.
  subtotal: number
  items: ShiprocketOrderItem[]
  weightKg: number
  lengthCm?: number
  breadthCm?: number
  heightCm?: number
}

function toShiprocketDate(iso: string): string {
  const d = iso ? new Date(iso) : new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function buildOrderPayload(input: BuildOrderPayloadInput) {
  const isCod = (input.paymentMethod || '').toUpperCase().includes('COD')

  const defaultLength = Number(process.env.SHIPROCKET_DEFAULT_LENGTH_CM) || 20
  const defaultBreadth = Number(process.env.SHIPROCKET_DEFAULT_BREADTH_CM) || 15
  const defaultHeight = Number(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM) || 8

  return {
    order_id: input.orderId,
    order_date: toShiprocketDate(input.orderDate),
    // .trim() defensively: a stray leading/trailing space in the env var
    // (easy to introduce by hand) makes Shiprocket reject every order with
    // "Wrong Pickup location entered" even though the name looks right.
    pickup_location: (process.env.SHIPROCKET_PICKUP_LOCATION || '').trim(),
    billing_customer_name: input.customerName || 'Customer',
    billing_last_name: '',
    billing_address: input.shippingStreet,
    billing_city: input.shippingCity,
    billing_pincode: input.shippingPincode,
    billing_state: input.shippingState,
    billing_country: input.shippingCountry || 'India',
    billing_email: input.customerEmail,
    billing_phone: (input.customerPhone || '').replace(/\D/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: input.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.units,
      selling_price: item.selling_price,
    })),
    payment_method: isCod ? 'COD' : 'Prepaid',
    sub_total: input.subtotal,
    length: input.lengthCm || defaultLength,
    breadth: input.breadthCm || defaultBreadth,
    height: input.heightCm || defaultHeight,
    weight: input.weightKg,
  }
}

export async function createShiprocketOrder(input: BuildOrderPayloadInput) {
  if (!process.env.SHIPROCKET_PICKUP_LOCATION?.trim()) {
    throw new Error('SHIPROCKET_PICKUP_LOCATION is not configured on the server environment.')
  }

  const payload = buildOrderPayload(input)
  const data = await shiprocketFetch('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // Shiprocket sometimes answers /orders/create/adhoc with HTTP 200 and no
  // order_id/shipment_id at all when something about the payload is wrong
  // (an invalid/misspelled pickup location, a KYC/onboarding step not yet
  // completed on the Shiprocket account, a duplicate order_id, a malformed
  // phone/pincode, etc). It reports the reason in `message` (sometimes
  // `errors`) instead of a non-2xx status, so surface that instead of only
  // the raw payload — the caller can then show the real reason.
  const message =
    typeof data?.message === 'string' && data.message
      ? data.message
      : data?.errors
      ? JSON.stringify(data.errors)
      : null

  return {
    shiprocketOrderId: data?.order_id ? String(data.order_id) : null,
    shipmentId: data?.shipment_id ? String(data.shipment_id) : null,
    status: data?.status || null,
    message,
    raw: data,
  }
}

export async function assignAwb(shipmentId: string) {
  const data = await shiprocketFetch('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: Number(shipmentId) }),
  })

  // Shiprocket returns HTTP 200 even when it couldn't assign a courier — in
  // that case `response.data` is a plain error STRING (e.g. "No couriers
  // serviceable for this pincode/weight") instead of a shipment object, so
  // there's no awb_code to read and nothing throws.
  const shipment = data?.response?.data
  const awbCode = shipment && typeof shipment === 'object' && shipment.awb_code ? String(shipment.awb_code) : null
  const courierName = shipment && typeof shipment === 'object' ? shipment.courier_name || null : null
  const failureReason =
    typeof shipment === 'string'
      ? shipment
      : typeof data?.message === 'string'
      ? data.message
      : null

  if (!awbCode) {
    console.warn('[Shiprocket] AWB assign call returned 200 but no courier was assigned. Raw response:', JSON.stringify(data))
  }

  return { awbCode, courierName, failureReason, raw: data }
}

export async function generatePickup(shipmentId: string) {
  const data = await shiprocketFetch('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  })

  return {
    pickupScheduledDate: data?.response?.pickup_scheduled_date || null,
    raw: data,
  }
}

export function trackingUrlForAwb(awbCode: string) {
  return `https://shiprocket.co/tracking/${awbCode}`
}

// Shared by the webhook (push) and the manual "Refresh Status" action
// (pull) so both ways of getting a status update collapse it to the same
// 4 order_status values the rest of the app understands.
export function mapShiprocketStatusToOrderStatus(currentStatus: string | undefined | null): string | null {
  if (!currentStatus) return null
  const s = currentStatus.toLowerCase()

  if (s.includes('delivered')) return 'delivered'
  if (s.includes('cancel')) return 'cancelled'
  if (s.includes('rto')) return 'cancelled'
  if (s.includes('out for delivery') || s.includes('in transit') || s.includes('shipped') || s.includes('picked up')) {
    return 'shipped'
  }
  // Pickup generated/scheduled, label generated, AWB assigned, etc. — order
  // stays wherever it is (usually 'processing') until it actually moves.
  return null
}

export type ShiprocketScanEvent = {
  date: string | null
  status: string | null
  activity: string | null
  location: string | null
}

// Pull-based status check for a shipment that already has an AWB — used to
// retroactively sync orders whose webhook update never arrived (e.g. it was
// placed before the webhook route existed, or the webhook wasn't registered
// yet on the Shiprocket account at the time). Also surfaces the full scan
// history (each checkpoint's location + timestamp) so the admin panel can
// show *where* the shipment actually is, not just its current status.
export async function trackShipmentByAwb(awbCode: string) {
  const data = await shiprocketFetch(`/courier/track/awb/${encodeURIComponent(awbCode)}`)
  const shipmentData = data?.tracking_data?.shipment_track?.[0]
  const activities: any[] = data?.tracking_data?.shipment_track_activities || []

  const scans: ShiprocketScanEvent[] = activities.map((a) => ({
    date: a?.date ? String(a.date) : null,
    status: a?.status ? String(a.status) : null,
    activity: a?.activity ? String(a.activity) : null,
    location: a?.location ? String(a.location) : null,
  }))

  return {
    currentStatus: shipmentData?.current_status ? String(shipmentData.current_status) : null,
    courierName: shipmentData?.courier_name ? String(shipmentData.courier_name) : null,
    currentLocation: scans[0]?.location || null,
    scans,
    raw: data,
  }
}

// For a shipment with no AWB yet (still "NEW" / not shipped from
// Shiprocket's dashboard) — checks the order-level status directly so a
// stale "No courier assigned" panel can at least reflect the current
// Shiprocket-side status, and picks up an AWB here too if one exists but our
// DB never got the webhook for it.
export async function getShiprocketOrderStatus(shiprocketOrderId: string) {
  const data = await shiprocketFetch(`/orders/show/${encodeURIComponent(shiprocketOrderId)}`)
  const order = data?.data
  // `shipments` is a single object for a one-shipment order, but an array
  // when Shiprocket splits an order into multiple shipments — handle both.
  const shipment = Array.isArray(order?.shipments) ? order.shipments[0] : order?.shipments

  const awbCode =
    shipment?.awb || shipment?.awb_code || order?.last_mile_awb || order?.awb_code || order?.awb || null
  const courierName =
    shipment?.courier || shipment?.courier_name || order?.last_mile_courier_name || order?.courier_name || null

  if (!awbCode) {
    // Field name for the AWB varies across Shiprocket API responses/accounts
    // — log the raw shape so the actual key can be identified from server
    // logs next time this fires with a status that implies a courier really
    // was assigned (e.g. "IN TRANSIT") but we still couldn't find an AWB.
    console.warn(
      `[Shiprocket] No AWB found for order ${shiprocketOrderId} (status: ${order?.status}). Raw shipments:`,
      JSON.stringify(order?.shipments)
    )
  }

  return {
    currentStatus: order?.status ? String(order.status) : null,
    awbCode: awbCode ? String(awbCode) : null,
    courierName: courierName ? String(courierName) : null,
    raw: data,
  }
}

export type ShiprocketSyncResult =
  | {
      success: true
      shiprocketStatus: string | null
      awbCode: string | null
      courierName: string | null
      orderStatus: string | null
      currentLocation: string | null
      scans: ShiprocketScanEvent[]
    }
  | { success: false; error: string }

// Shared by the admin sync actions (single + bulk "Sync All") and the
// customer-facing order detail page — fetches this order's live status from
// Shiprocket and writes it to our DB, discovering and saving the AWB code
// too if Shiprocket has one but our DB doesn't yet (e.g. the webhook for it
// never arrived). Takes an already-authorized Supabase client (service-role
// in practice) rather than checking auth itself — callers each have their
// own authorization story: an admin session for the dashboard, or an
// already-verified order-ownership check for the customer page.
export async function syncOneOrderFromShiprocket(
  adminClient: any,
  order: { id: string; shiprocket_order_id: string; awb_code: string | null }
): Promise<Omit<Extract<ShiprocketSyncResult, { success: true }>, 'success'>> {
  let currentStatus: string | null = null
  let awbCode: string | null = order.awb_code || null
  let courierName: string | null = null
  let currentLocation: string | null = null
  let scans: ShiprocketScanEvent[] = []

  if (order.awb_code) {
    const tracked = await trackShipmentByAwb(order.awb_code)
    currentStatus = tracked.currentStatus
    courierName = tracked.courierName
    currentLocation = tracked.currentLocation
    scans = tracked.scans
  } else {
    // No AWB in our DB yet — check Shiprocket directly in case a courier
    // was assigned there but the webhook for it never reached us.
    const orderStatus = await getShiprocketOrderStatus(order.shiprocket_order_id)
    currentStatus = orderStatus.currentStatus
    if (orderStatus.awbCode) {
      awbCode = orderStatus.awbCode
      courierName = orderStatus.courierName
      // Now that we know the AWB, get the richer tracking status for it —
      // this is where the location/scan history actually comes from.
      const tracked = await trackShipmentByAwb(orderStatus.awbCode)
      if (tracked.currentStatus) currentStatus = tracked.currentStatus
      if (tracked.courierName) courierName = tracked.courierName
      currentLocation = tracked.currentLocation
      scans = tracked.scans
    }
  }

  const updateData: any = { shiprocket_status: currentStatus || null }
  if (awbCode) updateData.awb_code = awbCode
  if (courierName) updateData.courier_name = courierName

  const mappedStatus = mapShiprocketStatusToOrderStatus(currentStatus)
  if (mappedStatus) {
    updateData.order_status = mappedStatus
    if (mappedStatus === 'shipped') updateData.shipped_at = new Date().toISOString()
    if (mappedStatus === 'delivered') updateData.delivered_at = new Date().toISOString()
    if (mappedStatus === 'cancelled') updateData.cancelled_at = new Date().toISOString()
  }

  const { error: updateError } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', order.id)

  if (updateError) throw new Error(updateError.message)

  return {
    shiprocketStatus: currentStatus,
    awbCode,
    courierName,
    orderStatus: mappedStatus,
    currentLocation,
    scans,
  }
}
