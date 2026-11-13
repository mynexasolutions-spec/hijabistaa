import { NextResponse } from 'next/server'
import { applyPayuResponse } from '@/lib/payuOrders'
import { getSiteUrl } from '@/lib/payu'

// PayU sends the customer's browser back here (success, failure and cancel
// URLs all point at this route) as a cross-site form POST. Auth cookies are
// NOT sent on that request, so the order is resolved purely from the signed
// PayU response; the customer is then redirected (303 -> GET) to a normal page
// where their session works again.
export async function POST(req: Request) {
  const base = await getSiteUrl(req)
  const redirect = (path: string) => NextResponse.redirect(new URL(path, base), 303)

  try {
    const form = await req.formData()
    const fields: Record<string, string> = {}
    form.forEach((value, key) => {
      if (typeof value === 'string') fields[key] = value
    })

    const outcome = await applyPayuResponse(fields)

    switch (outcome.result) {
      case 'paid':
        return redirect(`/checkout/success?order=${encodeURIComponent(outcome.orderId)}`)
      case 'pending':
        return redirect(`/checkout/success?order=${encodeURIComponent(outcome.orderId)}`)
      case 'failed':
        return redirect('/checkout?payment=failed')
      default:
        console.error('[PayU Callback]: rejected response —', outcome.reason)
        return redirect('/checkout?payment=failed')
    }
  } catch (error) {
    console.error('[PayU Callback Critical Error]:', error)
    return redirect('/checkout?payment=failed')
  }
}
