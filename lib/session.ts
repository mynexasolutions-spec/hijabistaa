// Tamper-proofing for the custom "hijabistaa-user-session" login cookie.
//
// That cookie is plain JSON that client code reads (for the header, etc.), so
// it has to stay JS-readable. On its own anyone could edit it (e.g. set
// role: "admin" or someone else's id). So at login we ALSO set an httpOnly
// "hijabistaa-user-sig" cookie holding an HMAC of the exact session value,
// signed with a server-only secret. Server code only trusts the session
// cookie when the signature matches.
//
// Uses Web Crypto so it works in route handlers, server actions and proxy.ts.

export const SESSION_COOKIE = 'hijabistaa-user-session'
export const SESSION_SIG_COOKIE = 'hijabistaa-user-sig'
const MAX_AGE = 30 * 24 * 60 * 60 // 30 days, same as the session cookie

function getSecret(): string {
  // SESSION_SECRET is preferred; the Supabase service-role key (already a
  // server-only secret) is the fallback so no new setup is required.
  const s = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (s) return s
  // Local mock mode only — never in production.
  return process.env.NODE_ENV === 'production' ? '' : 'dev-only-insecure-session-secret'
}

async function hmacHex(message: string): Promise<string> {
  const secret = getSecret()
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

/** True only if `sig` is a valid signature of the session cookie value. */
export async function isSessionSignatureValid(rawValue?: string, sig?: string): Promise<boolean> {
  if (!rawValue || !sig || !getSecret()) return false
  // Depending on the runtime the cookie value arrives URL-encoded or decoded;
  // we sign the decoded JSON, so accept either form.
  const candidates = Array.from(new Set([safeDecode(rawValue), rawValue]))
  for (const c of candidates) {
    if (safeEqual(await hmacHex(c), sig.toLowerCase())) return true
  }
  return false
}

// Customers who were already logged in BEFORE signing existed have a session
// cookie but no signature cookie. So they aren't all logged out at once, such
// legacy CUSTOMER cookies keep working until this date (old cookies expire
// within 30 days anyway) and proxy.ts upgrades each one to a signed session
// after checking it against the customers table. Admin sessions are never
// grandfathered. Remove this block after the date passes.
const LEGACY_GRACE_UNTIL = Date.parse('2026-12-15T00:00:00Z')
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isLegacyGraceActive() {
  return Date.now() < LEGACY_GRACE_UNTIL
}

/** Parses an unsigned legacy customer session, or null if not eligible. */
export function parseLegacyCustomerSession(raw?: string, sig?: string): any | null {
  if (!isLegacyGraceActive() || !raw || sig) return null
  try {
    const s = JSON.parse(safeDecode(raw))
    if (!s || s.role === 'admin' || typeof s.id !== 'string' || !UUID_RE.test(s.id)) return null
    if (typeof s.email !== 'string' || !s.email) return null
    return s
  } catch {
    return null
  }
}

export async function signSessionValue(json: string) {
  return hmacHex(json)
}

type CookieReader = { get(name: string): { value: string } | undefined }

/** Returns the parsed session ONLY if its signature is valid, else null. */
export async function getVerifiedSession(cookies: CookieReader): Promise<any | null> {
  const raw = cookies.get(SESSION_COOKIE)?.value
  const sig = cookies.get(SESSION_SIG_COOKIE)?.value
  if (!(await isSessionSignatureValid(raw, sig))) {
    return parseLegacyCustomerSession(raw, sig)
  }
  try {
    return JSON.parse(safeDecode(raw as string))
  } catch {
    return null
  }
}

type CookieWriter = {
  set(name: string, value: string, options?: Record<string, any>): any
}

/** Writes the readable session cookie plus its httpOnly signature cookie. */
export async function setUserSession(cookieStore: CookieWriter, session: Record<string, any>) {
  const json = JSON.stringify(session)
  const secure = process.env.NODE_ENV === 'production'

  cookieStore.set(SESSION_COOKIE, json, {
    path: '/',
    httpOnly: false,
    secure,
    maxAge: MAX_AGE,
  })
  cookieStore.set(SESSION_SIG_COOKIE, await hmacHex(json), {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: MAX_AGE,
  })
}

export function clearUserSession(cookieStore: CookieWriter) {
  cookieStore.set(SESSION_COOKIE, '', { path: '/', expires: new Date(0) })
  cookieStore.set(SESSION_SIG_COOKIE, '', { path: '/', expires: new Date(0) })
}
