'use server'

import { isAdminUser } from '@/lib/adminAuth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ShippingActionResult = {
  error?: string
  success?: boolean
}

async function checkAdminAuth(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  if (isAdminUser(user)) {
    return true
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch (e) {
    return false
  }
}

export async function getShippingSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('shipping')
    .single()

  if (error || !data?.shipping) {
    console.warn('Shipping settings not found in database, using safe defaults.');
    return {
      flat_rate: 99,
      free_threshold: 1999,
      cod_charge: 50,
      online_discount: 0,
      tiers: []
    }
  }

  const shipping = data.shipping
  if (shipping.online_discount === undefined) {
    shipping.online_discount = 0
  }
  if (!Array.isArray(shipping.tiers)) {
    shipping.tiers = []
  }

  return shipping
}

export async function updateShippingSettings(
  flatRate: number,
  freeThreshold: number,
  codCharge: number,
  onlineDiscount: number,
  tiers: { min_qty: number; max_qty: number | null; charge: number }[] = []
): Promise<ShippingActionResult> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  // Sanitize tiers: keep only well-formed rows, sorted by min_qty.
  const cleanTiers = (Array.isArray(tiers) ? tiers : [])
    .filter(t => t && !isNaN(Number(t.min_qty)) && !isNaN(Number(t.charge)) && Number(t.min_qty) >= 1)
    .map(t => ({
      min_qty: Math.floor(Number(t.min_qty)),
      max_qty: t.max_qty === null || t.max_qty === undefined || (t.max_qty as any) === '' ? null : Math.floor(Number(t.max_qty)),
      charge: Math.max(0, Number(t.charge))
    }))
    .sort((a, b) => a.min_qty - b.min_qty)

  // Update shipping config inside settings table using admin client to bypass RLS
  const { error } = await adminClient
    .from('settings')
    .update({
      shipping: {
        flat_rate: flatRate,
        free_threshold: freeThreshold,
        cod_charge: codCharge,
        online_discount: onlineDiscount,
        tiers: cleanTiers
      }
    })
    .eq('id', 'global-settings-id')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/settings/shipping')
  return { success: true }
}
