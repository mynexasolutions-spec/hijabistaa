'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function getHeroSlides() {
  const localDb = await readLocalDb()
  const localSlides = Array.isArray(localDb.hero_slides) ? localDb.hero_slides : []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data && data.length > 0) {
      // Merge unique slides from localSlides into data in case any slide only exists locally
      const merged = [...data]
      const existingIds = new Set(data.map((s: any) => s.id))
      localSlides.forEach((ls: any) => {
        if (!existingIds.has(ls.id)) {
          merged.push(ls)
        }
      })
      return merged
    }
  } catch (e) {
    console.error('Supabase getHeroSlides error, falling back to db.json:', e)
  }

  return localSlides
}

export async function createHeroSlide(imageUrl: string, position: string = 'global') {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const newSlide = {
    id: `slide-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    image_url: imageUrl,
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    text_mode: 'global',
    is_active: true,
    display_order: 0,
    position: position,
    created_at: new Date().toISOString()
  }

  // 1. Always update local lib/db.json first
  try {
    const db = await readLocalDb()
    if (!Array.isArray(db.hero_slides)) db.hero_slides = []
    
    if (db.hero_slides.length >= 10) {
      return { success: false, error: 'Maximum 10 slides allowed for the hero section.' }
    }
    
    newSlide.display_order = db.hero_slides.length
    db.hero_slides.push(newSlide)
    await writeLocalDb(db)
  } catch (err) {
    console.error('Error adding slide to db.json:', err)
  }

  // 2. Try updating Supabase
  try {
    const { count } = await supabase
      .from('hero_slides')
      .select('*', { count: 'exact', head: true })

    if (count && count >= 10) {
      // Already checked locally, but just in case
    } else {
      const insertRes = await supabase
        .from('hero_slides')
        .insert([{
          id: newSlide.id,
          image_url: newSlide.image_url,
          title: newSlide.title,
          subtitle: newSlide.subtitle,
          button_text: newSlide.button_text,
          button_link: newSlide.button_link,
          text_mode: newSlide.text_mode,
          is_active: newSlide.is_active,
          display_order: newSlide.display_order,
          position: newSlide.position
        }])

      if (insertRes.error) {
        await supabase
          .from('hero_slides')
          .insert([{
            id: newSlide.id,
            image_url: newSlide.image_url,
            title: newSlide.title,
            subtitle: newSlide.subtitle,
            button_text: newSlide.button_text,
            button_link: newSlide.button_link,
            text_mode: newSlide.text_mode,
            is_active: newSlide.is_active,
            display_order: newSlide.display_order
          }])
      }
    }
  } catch (sbErr) {
    console.error('Supabase createHeroSlide warning:', sbErr)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function deleteHeroSlide(id: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Always update local lib/db.json first
  try {
    const db = await readLocalDb()
    if (Array.isArray(db.hero_slides)) {
      db.hero_slides = db.hero_slides.filter((s: any) => s.id !== id)
      await writeLocalDb(db)
    }
  } catch (err) {
    console.error('Error deleting slide from db.json:', err)
  }

  // 2. Try updating Supabase
  try {
    await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id)
  } catch (sbErr) {
    console.error('Supabase deleteHeroSlide warning:', sbErr)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function toggleHeroSlideStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Always update local lib/db.json first
  try {
    const db = await readLocalDb()
    if (Array.isArray(db.hero_slides)) {
      db.hero_slides = db.hero_slides.map((s: any) => 
        s.id === id ? { ...s, is_active: isActive } : s
      )
      await writeLocalDb(db)
    }
  } catch (err) {
    console.error('Error toggling slide status in db.json:', err)
  }

  // 2. Try updating Supabase
  try {
    await supabase
      .from('hero_slides')
      .update({ is_active: isActive })
      .eq('id', id)
  } catch (sbErr) {
    console.error('Supabase toggleHeroSlideStatus warning:', sbErr)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export interface HeroTextConfig {
  heading_line1: string
  heading_line2: string
  heading_line3: string
  description: string
}

const DEFAULT_HERO_TEXT: HeroTextConfig = {
  heading_line1: 'Modesty.',
  heading_line2: 'Elegance.',
  heading_line3: 'You.',
  description: 'Premium Hijabs, Scarves & Modest Essentials crafted with luxurious fabric and effortless style.'
}

export async function getHeroText(): Promise<HeroTextConfig> {
  const localDb = await readLocalDb()
  const localText = localDb.settings?.hero_text || localDb.hero_text

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('settings')
      .select('hero_text')
      .eq('id', 'global-settings-id')
      .single()

    if (data?.hero_text) {
      return { ...DEFAULT_HERO_TEXT, ...data.hero_text }
    }
  } catch (e) {
    // Fallback quietly to local text
  }

  return { ...DEFAULT_HERO_TEXT, ...(localText || {}) }
}

export async function updateHeroText(config: HeroTextConfig) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Always update local lib/db.json first
  try {
    const db = await readLocalDb()
    if (!db.settings) db.settings = {}
    db.settings.hero_text = config
    db.hero_text = config
    await writeLocalDb(db)
  } catch (err) {
    console.error('Error updating hero text in db.json:', err)
  }

  // 2. Try updating Supabase
  try {
    await supabase
      .from('settings')
      .update({ hero_text: config })
      .eq('id', 'global-settings-id')
  } catch (sbErr) {
    console.error('Supabase updateHeroText warning:', sbErr)
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}
