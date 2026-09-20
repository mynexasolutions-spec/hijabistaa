import { SITE } from '@/lib/data'

type PrintReceiptProps = {
  order: any
  items: any[]
  address: any
}

export default function PrintReceipt({ order, items, address }: PrintReceiptProps) {
  const placedOn = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="hidden print:block text-black p-10">
      {/* Letterhead */}
      <div className="flex items-start justify-between pb-6 border-b-2 border-black">
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hijabistaa-logo.png"
            alt="HIJABISTAA"
            width={64}
            height={64}
            className="w-16 h-16 object-contain shrink-0"
            style={{
              // Some browsers fade/desaturate images in print output unless
              // explicitly told to render them exactly as shown on screen.
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              colorAdjust: 'exact',
            } as any}
          />
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-wide">{SITE.name}</h1>
            <p className="text-xs mt-1">{SITE.tagline}</p>
            <p className="text-[11px] mt-3 leading-relaxed max-w-xs">{SITE.address}</p>
            <p className="text-[11px] mt-1">{SITE.phone} &middot; {SITE.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-widest">Order Receipt</h2>
          <p className="text-[11px] mt-2">Receipt Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Order & Customer Info */}
      <div className="grid grid-cols-2 gap-8 py-6 border-b border-black/20">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Order Details</p>
          <p className="text-sm"><span className="font-semibold">Order #:</span> {order.order_number}</p>
          <p className="text-sm mt-0.5"><span className="font-semibold">Placed On:</span> {placedOn}</p>
          <p className="text-sm mt-0.5"><span className="font-semibold">Payment Method:</span> {order.payment_method || 'Online Payment'}</p>
          <p className="text-sm mt-0.5"><span className="font-semibold">Payment Status:</span> <span className="capitalize">{order.payment_status || 'Pending'}</span></p>
        </div>
        {address && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1.5">Billed &amp; Shipped To</p>
            <p className="text-sm font-semibold">{address.full_name}</p>
            <p className="text-sm mt-0.5">{address.phone}</p>
            <p className="text-sm mt-0.5">{address.address_line_1}</p>
            <p className="text-sm">{address.city}, {address.state} {address.postal_code}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full mt-6 text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left font-bold uppercase text-[10px] tracking-wider py-2">Item</th>
            <th className="text-left font-bold uppercase text-[10px] tracking-wider py-2">Variant</th>
            <th className="text-center font-bold uppercase text-[10px] tracking-wider py-2">Qty</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-wider py-2">Price</th>
            <th className="text-right font-bold uppercase text-[10px] tracking-wider py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={item.id || idx} className="border-b border-black/15">
              <td className="py-2.5 pr-2">{item.product_name}</td>
              <td className="py-2.5 pr-2 text-black/70">
                {[item.variant_name !== 'Default' ? item.variant_name : null, item.color_name].filter(Boolean).join(' / ') || '—'}
              </td>
              <td className="py-2.5 text-center">{item.quantity}</td>
              <td className="py-2.5 text-right">₹{item.price_at_purchase}</td>
              <td className="py-2.5 text-right font-semibold">₹{item.line_total || item.price_at_purchase * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-4">
        <div className="w-64 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}</span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-black text-base font-bold">
            <span>Total Paid</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-black/20 text-center">
        <p className="text-sm font-semibold">Thank you for shopping with {SITE.name}!</p>
        <p className="text-[11px] text-black/60 mt-1">
          For any queries regarding this order, contact us at {SITE.phone} or {SITE.email}
        </p>
        <p className="text-[10px] text-black/40 mt-4">This is a computer-generated receipt and does not require a signature.</p>
      </div>
    </div>
  )
}
