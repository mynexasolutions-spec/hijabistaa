import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapShiprocketStatusToOrderStatus } from '@/lib/shiprocket'

// Shiprocket sends shipment status updates (in transit, out for delivery,
// delivered, RTO, etc.) to this endpoint once you register it under
// Shiprocket -> Settings -> API -> Configure Webhooks, along with a
// "Secret Key" — set that exact same string as SHIPROCKET_WEBHOOK_SECRET
// below. Shiprocket sends that secret back on every webhook call in the
// `x-api-key` header, which is how we verify the request actually came
// from Shiprocket and not a random POST to this public URL.

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET
    const receivedKey = req.headers.get('x-api-key')

    if (webhookSecret) {
      if (!receivedKey || receivedKey !== webhookSecret) {
        console.error('[Shiprocket Webhook Error]: Missing/invalid x-api-key header.')
        return NextResponse.json({ success: false, error: 'Invalid webhook secret' }, { status: 401 })
      }
    } else {
      console.warn('[Shiprocket Webhook]: SHIPROCKET_WEBHOOK_SECRET is not configured — accepting request unverified.')
    }

    const payload = await req.json().catch(() => null)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
    }

    // Shiprocket's webhook payload carries two different identifiers, and
    // they are NOT interchangeable:
    //  - `channel_order_id` is the reference WE gave them when creating the
    //    order (buildOrderPayload sets order_id: input.orderId to our own
    //    orders.id) — this is what matches our `orders.id` primary key.
    //  - `order_id` in the webhook is Shiprocket's OWN internal numeric
    //    order id (the same value returned as `order_id` in the create-order
    //    response and stored in our `shiprocket_order_id` column) — it does
    //    NOT match `orders.id` and must be looked up via that column instead.
    const channelOrderId: string | undefined = payload.channel_order_id ? String(payload.channel_order_id) : undefined
    const shiprocketOrderId: string | undefined = payload.order_id ? String(payload.order_id) : undefined
    const awbCode: string | undefined = payload.awb ? String(payload.awb) : undefined
    const courierName: string | undefined = payload.courier_name ? String(payload.courier_name) : undefined
    const currentStatus: string | undefined = payload.current_status || payload.shipment_status

    console.log('[Shiprocket Webhook]: Received update', { channelOrderId, shiprocketOrderId, awbCode, courierName, currentStatus })

    if (!channelOrderId && !shiprocketOrderId) {
      // Nothing we can match to an order — acknowledge so Shiprocket
      // doesn't keep retrying, but log it for visibility.
      console.warn('[Shiprocket Webhook]: Payload had no order_id/channel_order_id, ignoring.', payload)
      return NextResponse.json({ success: true, ignored: true })
    }

    const supabaseAdmin = createAdminClient()

    const updateData: any = {
      shiprocket_status: currentStatus || null,
    }
    if (awbCode) updateData.awb_code = awbCode
    if (courierName) updateData.courier_name = courierName

    const mappedStatus = mapShiprocketStatusToOrderStatus(currentStatus)
    if (mappedStatus) {
      updateData.order_status = mappedStatus
      if (mappedStatus === 'shipped') updateData.shipped_at = new Date().toISOString()
      if (mappedStatus === 'delivered') updateData.delivered_at = new Date().toISOString()
      if (mappedStatus === 'cancelled') updateData.cancelled_at = new Date().toISOString()
    }

    const query = supabaseAdmin.from('orders').update(updateData)
    const { error } = channelOrderId
      ? await query.eq('id', channelOrderId)
      : await query.eq('shiprocket_order_id', shiprocketOrderId!)

    if (error) {
      console.error('[Shiprocket Webhook Error]: DB update failed:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Shiprocket Webhook Critical Error]:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}
