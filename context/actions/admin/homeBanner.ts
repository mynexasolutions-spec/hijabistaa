'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PromoPopupConfig, DEFAULT_PROMO_POPUP } from '@/lib/promo'

async function checkAdminAuth(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function getHomeBannerEnabled(): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('settings')
    .select('home_banner_enabled')
    .single()

  return !!data?.home_banner_enabled
}

export async function setHomeBannerEnabled(enabled: boolean) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('settings')
    .update({ home_banner_enabled: enabled })
    .eq('id', 'global-settings-id')

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function getHomeBannerImages() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('home_banner_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  return data || []
}

export async function createHomeBannerImage(imageUrl: string, linkUrl: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { count } = await supabase
    .from('home_banner_images')
    .select('*', { count: 'exact', head: true })

  if (count && count >= 8) {
    return { success: false, error: 'Maximum 8 banner images allowed.' }
  }

  const { error } = await supabase
    .from('home_banner_images')
    .insert([{
      id: crypto.randomUUID(),
      image_url: imageUrl,
      link_url: linkUrl ? linkUrl.trim() : null,
      is_active: true,
      display_order: count || 0,
    }])

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function updateHomeBannerImageLink(id: string, linkUrl: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('home_banner_images')
    .update({ link_url: linkUrl ? linkUrl.trim() : null })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function toggleHomeBannerImageStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('home_banner_images')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function deleteHomeBannerImage(id: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('home_banner_images')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export type { PromoPopupConfig } from '@/lib/promo'

export async function getPromoPopupSettings(): Promise<PromoPopupConfig> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('settings')
    .select('promo_popup')
    .single()

  const config = {
    ...DEFAULT_PROMO_POPUP,
    ...(data?.promo_popup || {}),
  }

  // Auto-sync with latest active coupon
  try {
    const { data: coupons } = await supabase
      .from('coupons')
      .select('code')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (coupons && coupons.length > 0) {
      config.code = coupons[0].code
    } else {
      config.code = ""
    }
  } catch (e) {
    // Silent fail
  }

  return config
}

export async function updatePromoPopupSettings(config: Partial<PromoPopupConfig>) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const current = await getPromoPopupSettings()
  const nextConfig = { ...current, ...config }

  const { error } = await supabase
    .from('settings')
    .update({ promo_popup: nextConfig })
    .eq('id', 'global-settings-id')

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

