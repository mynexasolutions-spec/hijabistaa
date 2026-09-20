import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle2, Truck, ExternalLink, PackageCheck, XCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import OrderDetailActions from './_components/OrderDetailActions'
import PrintReceipt from './_components/PrintReceipt'

// Dynamic title — this becomes the suggested filename when the customer uses
// the browser's "Save as PDF" print option, so it needs the order number
// rather than a generic "Order Details" label.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const { data: order } = await createAdminClient()
    .from('orders')
    .select('order_number')
    .eq('id', id)
    .maybeSingle()

  // No "|" or other Windows-reserved filename characters (< > : " / \ | ? *)
  // here — this string becomes the suggested filename when printing to PDF,
  // and a reserved character can make some print-to-PDF drivers leave the
  // filename blank instead of sanitizing it.
  return {
    title: order ? `HIJABISTAA Receipt - ${order.order_number}` : 'HIJABISTAA Order Details',
  }
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-ink/70 bg-ink/5 border-ink/15',
  processing: 'text-gold bg-gold/10 border-gold/30',
  shipped: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
  delivered: 'text-emerald bg-emerald/10 border-emerald/30',
  cancelled: 'text-red-600 bg-red-500/10 border-red-500/30',
}

// Shiprocket's raw shipment status is much more granular than our 4-value
// order_status ("IN TRANSIT", "Out For Delivery", "RTO Initiated", …), so it
// gets its own looser keyword-based color mapping for the tracking card.
function shipmentStatusStyle(rawStatus: string) {
  const s = rawStatus.toLowerCase()
  if (s.includes('deliver')) return 'text-emerald bg-emerald/10 border-emerald/30'
  if (s.includes('cancel') || s.includes('rto')) return 'text-red-600 bg-red-500/10 border-red-500/30'
  if (s.includes('transit') || s.includes('out for') || s.includes('dispatch') || s.includes('pickup') || s.includes('shipped')) {
    return 'text-blue-600 bg-blue-500/10 border-blue-500/30'
  }
  return 'text-gold bg-gold/10 border-gold/30'
}

function trackingEventIcon(text: string) {
  const s = text.toLowerCase()
  if (s.includes('deliver')) return CheckCircle2
  if (s.includes('transit') || s.includes('out for') || s.includes('dispatch') || s.includes('pickup')) return Truck
  return Package
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Service-role read: OTP-based customer logins carry our own
  // "hijabistaa-user-session" cookie, not a real Supabase Auth JWT, so
  // auth.uid() is NULL here and the anon-key client's "auth.uid() = user_id"
  // RLS policy would silently return zero rows. Ownership is enforced below
  // via the explicit .eq('user_id', user.id) filter instead.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: order } = await adminClient
    .from('orders')
    .select(`
      *,
      addresses:address_id (*),
      order_items (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!order) {
    notFound()
  }

  // Enrich order items with product/color images (same pattern used for the
  // profile order list and the guest order-tracking page).
  const productIds = Array.from(
    new Set((order.order_items || []).map((item: any) => item.product_id).filter(Boolean))
  )
  let productsById: Record<string, string | null> = {}
  let colorImagesByProductAndColor: Record<string, string> = {}

  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, featured_image_url, product_images ( image_url )')
      .in('id', productIds)

    productsById = (productsData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p.product_images?.[0]?.image_url || p.featured_image_url || null
      return acc
    }, {})

    const { data: colorsData } = await supabase
      .from('product_colors')
      .select('product_id, color_name, images')
      .in('product_id', productIds)

    if (colorsData) {
      colorsData.forEach((c: any) => {
        if (c.images && c.images.length > 0) {
          colorImagesByProductAndColor[`${c.product_id}-${c.color_name}`] = c.images[0]
        }
      })
    }
  }

  const items = (order.order_items || []).map((item: any) => {
    const colorKey = `${item.product_id}-${item.color_name}`
    return {
      ...item,
      image_url: colorImagesByProductAndColor[colorKey] || productsById[item.product_id] || null,
    }
  })

  const address = order.addresses

  // Auto-sync with Shiprocket on every view — fetches the live status (and
  // discovers/saves the AWB code if Shiprocket has assigned one but our DB
  // doesn't know yet, e.g. the webhook for it never arrived) and writes it
  // straight to the order row, the same way the admin panel's sync does.
  // Best-effort: if Shiprocket is slow/unreachable, the page still renders
  // fine with whatever was already in the DB.
  let currentLocation: string | null = null
  let scans: Array<{ date: string | null; status: string | null; activity: string | null; location: string | null }> = []
  let liveSynced = false
  if (order.shiprocket_order_id) {
    try {
      const { syncOneOrderFromShiprocket } = await import('@/lib/shiprocket')
      const synced = await syncOneOrderFromShiprocket(adminClient, {
        id: order.id,
        shiprocket_order_id: order.shiprocket_order_id,
        awb_code: order.awb_code || null,
      })
      if (synced.awbCode) order.awb_code = synced.awbCode
      if (synced.courierName) order.courier_name = synced.courierName
      if (synced.shiprocketStatus) order.shiprocket_status = synced.shiprocketStatus
      if (synced.orderStatus) order.order_status = synced.orderStatus
      currentLocation = synced.currentLocation
      scans = synced.scans
      liveSynced = true
    } catch (e) {
      console.error('Failed to live-sync order with Shiprocket on customer order page:', e)
    }
  }

  const status = (order.order_status || 'pending').toLowerCase()
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending
  const hasShipment = Boolean(order.shiprocket_order_id || order.awb_code)

  // Tracking progress — reflects order_status live from the DB, which the
  // admin dashboard's Order Status Manager writes to directly, so this stays
  // in sync with admin updates on every page load with no extra wiring.
  // Timestamps: admin's updateOrderStatus() only stamps shipped_at/delivered_at
  // (and created_at is set at checkout) — there's no dedicated "processing_at"
  // column, so that step shows no time until it moves to Shipped.
  const formatStepTime = (iso: string | null | undefined) => {
    if (!iso) return null
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const TRACKING_STEPS = [
    { key: 'pending', title: 'Order Placed', desc: 'Received & logged', icon: Package, time: formatStepTime(order.created_at) },
    { key: 'processing', title: 'Processing', desc: 'Packing your order', icon: PackageCheck, time: null },
    { key: 'shipped', title: 'Shipped', desc: 'In transit with courier', icon: Truck, time: formatStepTime(order.shipped_at) },
    { key: 'delivered', title: 'Delivered', desc: 'Package delivered', icon: CheckCircle2, time: formatStepTime(order.delivered_at) },
  ]
  const isCancelled = status === 'cancelled'
  const currentStep = isCancelled
    ? -1
    : Math.max(1, TRACKING_STEPS.findIndex((s) => s.key === status) + 1)

  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24 print:min-h-0 print:bg-white print:p-0 print:m-0">
        <PrintReceipt order={order} items={items} address={address} />
        <div className="max-w-3xl mx-auto px-5 print:hidden">
          <Link
            href="/profile?tab=orders"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-emerald transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to My Orders
          </Link>

          <div className="border-b border-cream-line pb-6 mb-8 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-ink">
                  Order <span className="text-emerald">#{order.order_number}</span>
                </h1>
                <p className="text-sm text-ink/60 mt-2">
                  Placed on{' '}
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider capitalize ${statusStyle}`}>
                {order.order_status || 'Pending'}
              </span>
            </div>
            <div className="flex justify-end">
              <OrderDetailActions orderNumber={order.order_number} />
            </div>
          </div>

          {/* Live Tracking Progress */}
          <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-br from-gold/50 via-cream-line to-emerald/40 mb-6 shadow-card">
            <div className="bg-white rounded-[calc(1.5rem-1.5px)] p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-gold/[0.06] rounded-full blur-[90px] -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald/[0.06] rounded-full blur-[90px] -ml-20 -mb-20 pointer-events-none" />

              {isCancelled ? (
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-ink">This order has been cancelled</h3>
                    <p className="text-xs text-ink/60 mt-1">
                      For refund or cancellation queries, reach out via WhatsApp support below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink/50 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald/60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
                      </span>
                      Live Tracking Progress
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald bg-emerald/10 px-3 py-1 rounded-full border border-emerald/20">
                      {order.order_status?.replace(/_/g, ' ') || 'Pending'}
                    </span>
                  </div>

                  <div className="relative my-2">
                    {/* Track line */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-cream-line rounded-full" />
                    <div
                      className="absolute top-6 left-0 h-1 bg-gradient-to-r from-emerald to-gold rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100))}%`,
                      }}
                    />

                    <div className="relative flex justify-between">
                      {TRACKING_STEPS.map((step, idx) => {
                        const stepNum = idx + 1
                        const isDone = currentStep >= stepNum
                        const isCurrent = currentStep === stepNum
                        const StepIcon = step.icon

                        return (
                          <div key={step.key} className="flex flex-col items-center group max-w-[90px] md:max-w-[110px]">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 shadow-sm ${
                                isDone
                                  ? 'bg-gradient-to-br from-emerald to-emerald-deep text-cream shadow-[0_4px_14px_rgba(30,59,46,0.35)] scale-105'
                                  : 'bg-cream border-2 border-cream-line text-ink/25'
                              } ${isCurrent ? 'ring-4 ring-gold/25' : ''}`}
                            >
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <div className="text-center mt-3 px-1">
                              <p className={`text-[11px] md:text-xs font-bold ${isDone ? 'text-ink' : 'text-ink/35'}`}>
                                {step.title}
                              </p>
                              <p className="text-[10px] text-ink/40 hidden md:block mt-0.5 leading-tight">
                                {step.desc}
                              </p>
                              {step.time ? (
                                <p className="text-[10px] font-bold text-emerald mt-1 leading-tight">
                                  {step.time}
                                </p>
                              ) : isDone ? null : (
                                <p className="text-[10px] text-ink/25 mt-1 leading-tight italic hidden md:block">
                                  Pending
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Shipment Tracking */}
            {hasShipment && (() => {
              // Never trust Shiprocket's own array order for "what's latest" —
              // sort by timestamp ourselves so the highlighted event is
              // always actually the most recent one, not just index 0.
              const sortedScans = [...scans].sort((a, b) => {
                const ta = a.date ? new Date(a.date).getTime() : 0
                const tb = b.date ? new Date(b.date).getTime() : 0
                return tb - ta
              })
              const isDelivered = (order.shiprocket_status || '').toLowerCase().includes('deliver')

              return (
                <div className="relative rounded-[1.5rem] sm:rounded-[2rem] p-[2px] bg-gradient-to-br from-emerald via-gold/60 to-emerald shadow-[0_8px_40px_-12px_rgba(30,59,46,0.35)]">
                  <div className="bg-white rounded-[calc(1.5rem-2px)] sm:rounded-[calc(2rem-2px)] p-4 sm:p-6 md:p-9 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald/[0.06] rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/[0.08] rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none" />

                    <div className="relative flex items-center justify-between gap-2 sm:gap-3 mb-5 sm:mb-6">
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald to-emerald-deep text-cream flex items-center justify-center shrink-0 shadow-lg rotate-3">
                          <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-heading text-base sm:text-xl font-bold text-ink leading-tight truncate">Shipment Tracking</h2>
                          <p className="text-[10px] sm:text-[11px] text-ink/40 font-semibold uppercase tracking-wider mt-0.5">Powered by Shiprocket</p>
                        </div>
                      </div>
                      {liveSynced && (
                        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald bg-emerald/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald/20">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald/60"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald"></span>
                          </span>
                          Live
                        </span>
                      )}
                    </div>

                    {/* Status hero */}
                    <div className="relative bg-gradient-to-br from-cream/70 to-cream/20 border border-cream-line/60 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3">
                        {order.shiprocket_status && (
                          <span className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider border ${shipmentStatusStyle(order.shiprocket_status)}`}>
                            {isDelivered && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            {order.shiprocket_status}
                          </span>
                        )}
                      </div>
                      {currentLocation && (
                        <div className="flex items-center gap-2 text-right">
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-ink/40">Current Location</p>
                            <p className="font-bold text-ink text-xs sm:text-sm">{currentLocation}</p>
                          </div>
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
                          </div>
                        </div>
                      )}
                    </div>

                    {order.awb_code && (
                      <div className="relative flex flex-wrap gap-2.5 sm:gap-3 mt-3.5 sm:mt-4">
                        <div className="flex-1 min-w-[140px] bg-cream/40 border border-cream-line/50 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-ink/40">AWB Number</p>
                          <p className="font-mono font-bold text-ink text-xs sm:text-sm mt-0.5 select-all">{order.awb_code}</p>
                        </div>
                      </div>
                    )}

                    {order.awb_code && (
                      <a
                        href={`https://shiprocket.co/tracking/${order.awb_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative mt-3.5 sm:mt-4 w-full sm:w-auto flex sm:inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-emerald to-emerald-deep text-cream text-[11px] sm:text-xs font-bold uppercase tracking-wide shadow-lg shadow-emerald/20 hover:shadow-xl sm:hover:scale-[1.02] active:scale-100 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Track Shipment<span className="hidden sm:inline"> on Shiprocket</span></span>
                      </a>
                    )}

                    {sortedScans.length > 0 && (
                      <div className="relative mt-6 sm:mt-7 pt-5 sm:pt-6 border-t border-cream-line/50">
                        <p className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-4 sm:mb-5">Tracking Timeline</p>
                        <div
                          className="space-y-0 max-h-96 overflow-y-auto px-2 -mx-2"
                          style={{ maskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)' }}
                        >
                          {sortedScans.map((scan, idx) => {
                            const isLatest = idx === 0
                            const EventIcon = trackingEventIcon(scan.activity || scan.status || '')
                            return (
                              <div key={idx} className="flex gap-2.5 sm:gap-3.5">
                                <div className="flex flex-col items-center">
                                  <div className={`rounded-full shrink-0 ${isLatest ? 'p-1 bg-emerald/15' : ''}`}>
                                    <div
                                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                        isLatest
                                          ? 'bg-gradient-to-br from-emerald to-emerald-deep text-cream shadow-lg shadow-emerald/30'
                                          : 'bg-white border-2 border-cream-line text-ink/25'
                                      }`}
                                    >
                                      <EventIcon className="w-4 h-4" />
                                    </div>
                                  </div>
                                  {idx !== sortedScans.length - 1 && (
                                    <div className={`w-px flex-1 my-1 ${isLatest ? 'bg-gradient-to-b from-emerald/40 to-cream-line' : 'bg-cream-line'}`} />
                                  )}
                                </div>
                                <div className={`min-w-0 flex-1 ${isLatest ? 'bg-emerald/5 border border-emerald/10 rounded-xl px-4 py-3 mb-4' : 'pb-5'}`}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`text-sm font-bold ${isLatest ? 'text-ink' : 'text-ink/70'}`}>
                                      {scan.activity || scan.status}
                                    </p>
                                    {isLatest && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald bg-emerald/10 px-2 py-0.5 rounded-full border border-emerald/20">
                                        Latest
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 mt-1 text-xs text-ink/50">
                                    {scan.location && <span>{scan.location}</span>}
                                    {scan.location && scan.date && <span className="text-ink/20">&middot;</span>}
                                    {scan.date && (
                                      <span>
                                        {new Date(scan.date).toLocaleString('en-IN', {
                                          day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Not shipped yet */}
            {!hasShipment && !isCancelled && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-cream-line/75 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0 border border-gold/20">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-ink">Shipment Tracking</h2>
                  <p className="text-sm text-ink/60 mt-1">
                    Your order hasn&apos;t shipped yet. As soon as it ships, detailed courier tracking will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-cream-line/75">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald to-emerald-deep text-cream flex items-center justify-center shrink-0 shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-xl font-bold text-ink">
                  Items ({items.length})
                </h2>
              </div>
              <ul className="divide-y divide-cream-line/50">
                {items.map((item: any, idx: number) => (
                  <li key={item.id || idx} className="flex items-start gap-3 sm:gap-4 py-4">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border border-cream-line bg-cream">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.product_name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink/20">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <div className="min-w-0 flex-1 basis-[60%]">
                        <p className="font-bold text-ink break-words leading-snug text-sm sm:text-base">{item.product_name}</p>
                        <p className="text-xs sm:text-sm text-ink/60 mt-1">
                          {item.variant_name && item.variant_name !== 'Default' && <>Size: {item.variant_name} &middot; </>}
                          {item.color_name && <>Color: {item.color_name} &middot; </>}
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-ink text-sm sm:text-base">
                        ₹{item.line_total || item.price_at_purchase * item.quantity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-cream-line/50 space-y-2 text-sm">
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal</span>
                  <span className="font-bold text-ink">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald">
                    {order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-cream-line text-lg font-bold text-ink">
                  <span>Total</span>
                  <span className="text-emerald">₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {address && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-cream-line/75">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald to-emerald-deep text-cream flex items-center justify-center shrink-0 shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-ink">Shipping Address</h2>
                </div>
                <p className="font-bold text-ink">
                  {address.full_name} &middot; {address.phone}
                </p>
                <p className="text-sm text-ink/70 mt-2">{address.address_line_1}</p>
                <p className="text-sm text-ink/70">
                  {address.city}, {address.state} {address.postal_code}
                </p>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-cream-line/75">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald to-emerald-deep text-cream flex items-center justify-center shrink-0 shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-xl font-bold text-ink">Payment</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-ink/60">Method:</span>
                <span className="font-bold text-ink">{order.payment_method || 'Online Payment'}</span>
                <span className="text-ink/20">|</span>
                <span className="text-ink/60">Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                    order.payment_status === 'paid'
                      ? 'text-emerald bg-emerald/10 border-emerald/30'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}
                >
                  {order.payment_status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {order.payment_status || 'Pending'}
                </span>
              </div>
              {order.razorpay_payment_id && (
                <div className="mt-4 pt-4 border-t border-cream-line/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">Payment ID</p>
                  <p className="font-mono text-sm text-ink/80 select-all bg-cream/40 border border-cream-line/50 rounded-lg px-3 py-2 inline-block">
                    {order.razorpay_payment_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}
