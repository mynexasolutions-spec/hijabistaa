'use client'

import { Printer, PhoneCall } from 'lucide-react'
import { SITE } from '@/lib/data'

export default function OrderDetailActions({ orderNumber }: { orderNumber: string }) {
  const handlePrint = () => {
    // The page's <title> is already correct (set server-side), but the OS
    // "Save print output as" dialog only reads document.title once the user
    // finishes configuring print settings and clicks Print — which can take
    // much longer than a fixed timeout. Restoring the title too early (e.g.
    // via setTimeout) wipes it back to the original before that dialog ever
    // opens, so it must only be reverted once printing has actually finished.
    const originalTitle = document.title
    document.title = `HIJABISTAA Receipt - ${orderNumber}`

    const restoreTitle = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', restoreTitle)
    }
    window.addEventListener('afterprint', restoreTitle)

    // A same-tick title change + print() call can beat the browser's own
    // print pipeline to registering the new <title>, in which case the
    // suggested filename ends up blank. A minimal delay gives it one extra
    // render tick to pick up the change before the dialog opens.
    setTimeout(() => {
      window.print()
    }, 50)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-cream border border-cream-line text-ink text-xs font-bold rounded-full shadow-sm transition-all"
      >
        <Printer className="w-4 h-4 text-emerald" />
        Print Receipt
      </button>
      <a
        href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi, I need assistance with my Order #${orderNumber}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full shadow-sm transition-all"
      >
        <PhoneCall className="w-4 h-4" />
        WhatsApp Support
      </a>
    </div>
  )
}
