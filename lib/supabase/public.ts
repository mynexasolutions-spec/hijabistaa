import { createClient } from '@supabase/supabase-js'

/**
 * Cookie-less, anon-key Supabase client for PUBLIC catalogue reads.
 *
 * It is safe to use inside `unstable_cache` (which cannot call `cookies()`),
 * and it never carries a user session, so cached results can never leak
 * per-user data. RLS still applies (anon role). Do not use for anything
 * user-specific.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder')) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
