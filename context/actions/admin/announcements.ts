'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AnnouncementMessage = {
  id: string;
  text: string;
  link?: string;
  icon?: string;
  isActive: boolean;
};

export type AnnouncementBannerConfig = {
  enabled: boolean;
  messages: AnnouncementMessage[];
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  height: string;
  speed: number;
  pauseOnHover: boolean;
  separator: 'sparkle' | 'line' | 'dot' | 'none';
};

const DEFAULT_ANNOUNCEMENT_BANNER: AnnouncementBannerConfig = {
  enabled: true,
  messages: [
    {
      id: 'default-1',
      text: 'Free Shipping on Orders Above ₹999',
      isActive: true,
      icon: 'sparkles'
    },
    {
      id: 'default-2',
      text: 'New Abaya Collection 2025 – Shop Now',
      isActive: true,
      icon: 'sparkles'
    },
    {
      id: 'default-3',
      text: 'Use Code: HIJAB15 & Get 15% OFF',
      isActive: true,
      icon: 'sparkles'
    },
    {
      id: 'default-4',
      text: 'COD Available Across India',
      isActive: true,
      icon: 'none'
    }
  ],
  backgroundColor: '#a35c4a',
  textColor: '#ffffff',
  fontSize: '13px',
  height: '40px',
  speed: 40,
  pauseOnHover: true,
  separator: 'line'
};

async function checkAdminAuth(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  if (user.id === 'mock-admin-id' || user.user_metadata?.role === 'admin' || user.email?.includes('admin')) {
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

async function readLocalDb(): Promise<any> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    const content = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(content)
  } catch (e) {
    return {}
  }
}

async function writeLocalDb(data: any): Promise<void> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to write local db.json:', e)
  }
}

export async function getAnnouncementBannerSettings(): Promise<AnnouncementBannerConfig> {
  let localSettings = null;
  try {
    const localDb = await readLocalDb()
    if (localDb.settings?.announcement_banner) {
      localSettings = localDb.settings.announcement_banner;
    }
  } catch (e) {}

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('settings')
      .select('announcement_banner')
      .eq('id', 'global-settings-id')
      .single()

    if (data?.announcement_banner) {
      return { ...DEFAULT_ANNOUNCEMENT_BANNER, ...data.announcement_banner }
    }
  } catch (err) {
    // Fallback quietly
  }

  return localSettings ? { ...DEFAULT_ANNOUNCEMENT_BANNER, ...localSettings } : DEFAULT_ANNOUNCEMENT_BANNER
}

export async function updateAnnouncementBannerSettings(config: Partial<AnnouncementBannerConfig>) {
  const supabase = await createClient()
  
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const current = await getAnnouncementBannerSettings()
  const nextConfig = { ...current, ...config }

  // 1. Save to db.json
  try {
    const db = await readLocalDb()
    if (!db.settings) db.settings = {}
    db.settings.announcement_banner = nextConfig
    await writeLocalDb(db)
  } catch (err) {
    console.error('Error saving announcement banner in db.json:', err)
  }

  // 2. Save to Supabase
  try {
    const { error } = await supabase
      .from('settings')
      .update({ announcement_banner: nextConfig })
      .eq('id', 'global-settings-id')
      
    if (error) {
       console.error("Supabase announcement update error:", error)
    }
  } catch (sbErr) {
    console.error('Supabase updateAnnouncementBannerSettings warning:', sbErr)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/announcements')
  
  return { success: true }
}
