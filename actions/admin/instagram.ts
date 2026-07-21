'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { InstagramPost } from '../instagram'

const DEFAULT_INSTAGRAM_LINK = 'https://www.instagram.com/__hijabistaa__'

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

export async function getAdminInstagramPosts(): Promise<InstagramPost[]> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return []

  let posts: InstagramPost[] = []

  // Local DB baseline
  const db = await readLocalDb()
  if (Array.isArray(db.instagram_posts)) {
    posts = [...db.instagram_posts]
  }

  // Supabase merge
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('instagram_posts')
      .select('*')
      .order('display_order', { ascending: true })

    if (data && data.length > 0) {
      const map = new Map<string, InstagramPost>()
      posts.forEach(p => map.set(p.id, p))
      data.forEach(p => map.set(p.id, p))
      posts = Array.from(map.values())
    }
  } catch (err) {
    // Fallback quietly
  }

  return posts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
}

export async function addInstagramPost(data: Partial<InstagramPost>) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  if (!data.image_url?.trim()) {
    return { success: false, error: 'Image file or URL is required' }
  }

  const newPost: InstagramPost = {
    id: `insta_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    image_url: data.image_url.trim(),
    link_url: data.link_url?.trim() || DEFAULT_INSTAGRAM_LINK,
    caption: data.caption?.trim() || '',
    display_order: Number(data.display_order) || 1,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString()
  }

  // 1. Local DB
  const db = await readLocalDb()
  if (!db.instagram_posts) db.instagram_posts = []
  db.instagram_posts.push(newPost)
  await writeLocalDb(db)

  // 2. Supabase
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    await adminClient.from('instagram_posts').insert([newPost])
  } catch (err) {}

  revalidatePath('/', 'layout')
  revalidatePath('/admin/instagram')
  return { success: true }
}

export async function updateInstagramPost(id: string, data: Partial<InstagramPost>) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Local DB
  const db = await readLocalDb()
  if (Array.isArray(db.instagram_posts)) {
    const idx = db.instagram_posts.findIndex((p: any) => p.id === id)
    if (idx !== -1) {
      db.instagram_posts[idx] = { ...db.instagram_posts[idx], ...data }
      await writeLocalDb(db)
    }
  }

  // 2. Supabase
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    await adminClient.from('instagram_posts').update(data).eq('id', id)
  } catch (err) {}

  revalidatePath('/', 'layout')
  revalidatePath('/admin/instagram')
  return { success: true }
}

export async function deleteInstagramPost(id: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Local DB
  const db = await readLocalDb()
  if (Array.isArray(db.instagram_posts)) {
    db.instagram_posts = db.instagram_posts.filter((p: any) => p.id !== id)
    await writeLocalDb(db)
  }

  // 2. Supabase
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    await adminClient.from('instagram_posts').delete().eq('id', id)
  } catch (err) {}

  revalidatePath('/', 'layout')
  revalidatePath('/admin/instagram')
  return { success: true }
}

export async function toggleInstagramPostActive(id: string, is_active: boolean) {
  return updateInstagramPost(id, { is_active })
}
