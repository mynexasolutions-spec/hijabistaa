import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { getPayuConfig, verifyResponseHash, formatPayuAmount } from '@/lib/payu'

export type PayuOutcome =
  | { result: 'paid'; orderId: string }
  | { result: 'failed'; orderId: string }
  | { result: 'pending'; orderId: string }
  | { result: 'invalid'; reason: string }

/**
 * Applies a PayU payment response (browser return URL *or* server webhook —
 * both post the same fields) to our order.
 *
 * Nothing here relies on a user session: the browser comes back from PayU on
 * a cross-site POST, so cookies aren't sent. Trust comes entirely from the
 * response hash (signed with the merchant salt), then from matching the
 * order id, transaction id and amount against what we stored.
 *
 * Safe to call repeatedly for one transaction — the "paid" transition is an
 * atomic compare-and-set, so stock/cart/email side effects run exactly once.
 */
export async function applyPayuResponse(fields: Record<string, string>): Promise<PayuOutcome> {
  const cfg = getPayuConfig()
  if (!cfg) return { result: 'invalid', reason: 'PayU is not configured' }

  if (!verifyResponseHash(cfg, fields)) {
    return { result: 'invalid', reason: 'Hash mismatch' }
  }

  const orderId = fields.udf1
  const txnid = fields.txnid
  if (!orderId || !txnid) return { result: 'invalid', reason: 'Missing order reference' }

  const admin = createAdminClient()

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('id, user_id, total_amount, payment_status, payu_txnid')
    .eq('id', orderId)
    .maybeSingle()

  if (orderErr || !order) return { result: 'invalid', reason: 'Order not found' }
  if (order.payu_txnid !== txnid) return { result: 'invalid', reason: 'Transaction id mismatch' }

  const status = (fields.status || '').toLowerCase()

  if (status === 'success') {
    if (formatPayuAmount(fields.amount) !== formatPayuAmount(order.total_amount)) {
      console.error(`[PayU] Amount mismatch for order ${orderId}: paid ${fields.amount}, expected ${order.total_amount}`)
      return { result: 'invalid', reason: 'Amount mismatch' }
    }

    // Atomic compare-and-set: only the first response to arrive wins.
    const { data: updated } = await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        payu_payment_id: fields.mihpayid || null,
      })
      .eq('id', orderId)
      .neq('payment_status', 'paid')
      .select('id')
      .maybeSingle()

    if (updated) {
      // A failure callback may have cancelled the order before the customer
      // retried and succeeded — bring it back.
      await admin
        .from('orders')
        .update({ order_status: 'pending', cancelled_at: null })
        .eq('id', orderId)
        .eq('order_status', 'cancelled')

      await runPostPaymentTasks(order.id, order.user_id)
    }
    return { result: 'paid', orderId }
  }

  if (status === 'failure' || status === 'failed') {
    // Never overwrite an order that's already paid.
    await admin
      .from('orders')
      .update({
        payment_status: 'failed',
        order_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .neq('payment_status', 'paid')
    return { result: 'failed', orderId }
  }

  // "pending" / "in progress" etc. — leave it alone; a later webhook settles it.
  return { result: 'pending', orderId }
}

async function runPostPaymentTasks(orderId: string, userId: string) {
  const admin = createAdminClient()

  try {
    const { data: orderItems } = await admin
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)

    for (const item of orderItems || []) {
      if (!item.variant_id) continue
      const { data: variant } = await admin
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variant_id)
        .single()
      if (variant) {
        await admin
          .from('product_variants')
          .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
          .eq('id', item.variant_id)
      }
    }

    await admin.from('cart_items').delete().eq('user_id', userId)
  } catch (e) {
    console.error('[PayU] Post-payment stock/cart update failed:', e)
  }

  // Best-effort — never fails the payment confirmation.
  try {
    const { data: fullOrder } = await admin
      .from('orders')
      .select('*, addresses:address_id (*), order_items (*)')
      .eq('id', orderId)
      .maybeSingle()

    const { data: customer } = await admin
      .from('customers')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    if (fullOrder && customer?.email) {
      await sendOrderConfirmationEmail({
        toEmail: customer.email,
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
    console.error('[PayU] Failed to send order confirmation email:', e)
  }
}
