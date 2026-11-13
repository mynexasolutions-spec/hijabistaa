import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, Package } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { SITE } from '@/lib/data'
import ClearCartOnMount from './_components/ClearCartOnMount'

export const metadata = {
  title: 'Order Confirmation | HIJABISTA',
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!orderId) redirect('/profile?tab=orders')

  // Service-role read with an explicit ownership filter (the custom-cookie
  // login has no Supabase Auth JWT, so RLS can't be relied on here).
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const { data: order } = await createAdminClient()
    .from('orders')
    .select('id, order_number, total_amount, payment_method, payment_status, addresses:address_id (address_line_1, city, state, postal_code), order_items (product_name, quantity)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!order) redirect('/profile?tab=orders')

  const isPaid = order.payment_status === 'paid'
  const address: any = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses
  const addressString = address
    ? `${address.address_line_1}, ${address.city}, ${address.state} - ${address.postal_code}`
    : ''
  const itemsText = (order.order_items || []).map((i: any) => `- ${i.product_name} (x${i.quantity})`).join('\n')
  const message = `Hi HIJABISTA!\n\nI just placed an order:\nOrder Number: *${order.order_number}*\nItems:\n${itemsText}\nTotal Amount: *₹${Number(order.total_amount).toLocaleString('en-IN')}*\nPayment Method: *${order.payment_method}*\n\nShipping Address: ${addressString}\n\nPlease confirm my order. Thank you!`
  const whatsappLink = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">
          {/* Only empty the cart once the payment is confirmed paid */}
          {isPaid && <ClearCartOnMount />}

          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-cream-line shadow-card text-center space-y-6 animate-fade-in mt-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isPaid ? 'bg-emerald/10 text-emerald' : 'bg-gold/10 text-gold'}`}>
              {isPaid ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-ink">
                {isPaid ? 'Order Placed Successfully!' : 'Payment Processing'}
              </h2>
              <p className="text-sm text-ink/60 mt-1">
                {isPaid
                  ? 'Thank you for shopping with HIJABISTA.'
                  : 'Your payment is still being confirmed by the bank. This page will not charge you twice — check My Orders in a few minutes.'}
              </p>
            </div>

            <div className="p-4 bg-cream/40 rounded-2xl border border-cream-line/50 text-left space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-ink/50 uppercase font-semibold">Order Number</span>
                <span className="font-bold text-ink">{order.order_number}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink/50 uppercase font-semibold">Grand Total</span>
                <span className="font-bold text-emerald">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink/50 uppercase font-semibold">Payment Method</span>
                <span className="font-bold text-ink">{order.payment_method}</span>
              </div>
            </div>

            <div className="space-y-2">
              {isPaid && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all"
                >
                  Confirm via WhatsApp
                </a>
              )}
              <Link
                href="/profile?tab=orders"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-ink font-body font-semibold rounded-full border border-cream-line shadow-sm hover:bg-cream transition-all"
              >
                <Package className="w-4 h-4 text-gold" />
                See My Orders
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center py-3 text-sm text-ink/60 hover:text-emerald font-semibold transition-colors"
              >
                Return to Store
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
