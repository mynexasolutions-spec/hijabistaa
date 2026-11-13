import { NextResponse } from 'next/server'
import { applyPayuResponse } from '@/lib/payuOrders'

// Server-to-server notification from PayU (configure this URL in the PayU
// dashboard -> Webhooks). It carries the same signed fields as the browser
// return, so it settles orders even if the customer closes the tab before
// being redirected back. Authenticity is proven by the response hash, which
// is derived from the merchant salt — no separate webhook secret exists.
export async function POST(req: Request) {
  try {
    const fields: Record<string, string> = {}
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const json = await req.json()
      for (const [k, v] of Object.entries(json || {})) {
        if (typeof v === 'string' || typeof v === 'number') fields[k] = String(v)
      }
    } else {
      const form = await req.formData()
      form.forEach((value, key) => {
        if (typeof value === 'string') fields[key] = value
      })
    }

    const outcome = await applyPayuResponse(fields)

    if (outcome.result === 'invalid') {
      console.error('[PayU Webhook Error]: rejected —', outcome.reason)
      return NextResponse.json({ success: false, error: 'Invalid webhook payload' }, { status: 400 })
    }

    console.log(`[PayU Webhook]: order ${outcome.orderId} -> ${outcome.result}`)
    return NextResponse.json({ success: true, result: outcome.result }, { status: 200 })
  } catch (error) {
    console.error('[PayU Webhook Critical Error]:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
