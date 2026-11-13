// PayU (India) hosted-checkout helpers. Server-side only — PAYU_MERCHANT_SALT
// must never reach the browser, so nothing in here is imported by client code.
import 'server-only'
import crypto from 'crypto'
import { headers } from 'next/headers'

export type PayuConfig = {
  key: string
  salt: string
  paymentUrl: string
}

// Defaults to PayU's TEST environment — real money only moves when
// PAYU_ENV is explicitly set to "production".
export function getPayuConfig(): PayuConfig | null {
  const key = process.env.PAYU_MERCHANT_KEY
  const salt = process.env.PAYU_MERCHANT_SALT
  if (!key || !salt) return null
  const live = process.env.PAYU_ENV === 'production'
  return {
    key,
    salt,
    paymentUrl: live ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
  }
}

function sha512(input: string) {
  return crypto.createHash('sha512').update(input).digest('hex')
}

// Amounts are hashed as strings, so request and order must use one format.
export function formatPayuAmount(amount: number | string) {
  return Number(amount).toFixed(2)
}

type RequestHashInput = {
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
}

// sha512(key|txnid|amount|productinfo|firstname|email|udf1|...|udf5||||||SALT)
export function buildRequestHash(cfg: PayuConfig, p: RequestHashInput) {
  return sha512(
    [
      cfg.key, p.txnid, p.amount, p.productinfo, p.firstname, p.email,
      p.udf1 || '', p.udf2 || '', p.udf3 || '', p.udf4 || '', p.udf5 || '',
      '', '', '', '', '',
      cfg.salt,
    ].join('|')
  )
}

// sha512([additionalCharges|]SALT|status||||||udf5|...|udf1|email|firstname|productinfo|amount|txnid|key)
export function verifyResponseHash(cfg: PayuConfig, f: Record<string, string>) {
  const received = (f.hash || '').toLowerCase()
  if (!received || f.key !== cfg.key) return false

  const parts = [
    cfg.salt, f.status || '',
    '', '', '', '', '',
    f.udf5 || '', f.udf4 || '', f.udf3 || '', f.udf2 || '', f.udf1 || '',
    f.email || '', f.firstname || '', f.productinfo || '', f.amount || '', f.txnid || '', f.key || '',
  ]
  if (f.additionalCharges) parts.unshift(f.additionalCharges)

  const expected = sha512(parts.join('|'))
  const a = Buffer.from(received, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Absolute base URL used for PayU's return URLs. Prefer an explicit SITE_URL
// (server-only env); fall back to the incoming request's host.
export async function getSiteUrl(req?: Request) {
  const fromEnv = process.env.SITE_URL?.replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  if (req) return new URL(req.url).origin
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || (host?.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
