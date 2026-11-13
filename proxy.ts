import { NextResponse, type NextRequest } from 'next/server'
import {
  getVerifiedSession,
  parseLegacyCustomerSession,
  signSessionValue,
  SESSION_COOKIE,
  SESSION_SIG_COOKIE,
} from '@/lib/session'

// Upgrades a pre-signing customer login to a signed one (so existing
// customers stay logged in). The account is confirmed against the customers
// table first — id AND email must match — before a signature is issued.
async function upgradeLegacySession(request: NextRequest, response: NextResponse) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value
  const sig = request.cookies.get(SESSION_SIG_COOKIE)?.value
  const legacy = parseLegacyCustomerSession(raw, sig)
  if (!legacy) return

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return

  try {
    const res = await fetch(
      `${url}/rest/v1/customers?id=eq.${encodeURIComponent(legacy.id)}&email=eq.${encodeURIComponent(legacy.email)}&select=id&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, cache: 'no-store' }
    )
    if (!res.ok) return
    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) return

    let json = raw as string
    try { json = decodeURIComponent(json) } catch { }
    response.cookies.set(SESSION_SIG_COOKIE, await signSessionValue(json), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    })
  } catch {
    // Best-effort: the legacy grace window still lets them in.
  }
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const mockMode = !supabaseUrl || supabaseUrl.includes('placeholder')
  // Unsigned mock-admin cookie only counts in local no-Supabase dev mode.
  const hasMockCookie = mockMode && request.cookies.get('mock-admin-logged-in')?.value === 'true'
  // Custom login cookie only counts if its signature is valid.
  const hasCustomCookie = !!(await getVerifiedSession(request.cookies))
  
  // Check if any supabase auth cookie exists (standard naming format is sb-<project-id>-auth-token)
  const hasSupabaseCookie = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  const loggedIn = hasMockCookie || hasSupabaseCookie || hasCustomCookie

  // Protected paths
  // Note: /checkout is intentionally not gated here — it collects the
  // address and creates/logs the account inline as part of the form.
  const isProtectedPath = request.nextUrl.pathname.startsWith('/account')
  const isAdminPath =
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin/login'

  if ((isProtectedPath || isAdminPath) && !loggedIn) {
    const url = request.nextUrl.clone()
    if (isAdminPath) {
      url.pathname = '/admin/login'
    } else {
      url.pathname = '/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
    }
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()
  await upgradeLegacySession(request, response)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
