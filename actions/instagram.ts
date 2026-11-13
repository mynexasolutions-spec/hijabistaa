'use server'

import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

export type InstagramPost = {
  id: string
  image_url: string
  link_url?: string
  caption?: string
  display_order: number
  is_active: boolean
  created_at?: string
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

// Home page + every visitor hits this; cache it instead of querying Supabase
// per view. Purged by the admin mutations via the 'instagram-posts' tag.
const fetchInstagramRows = unstable_cache(
  async (): Promise<InstagramPost[]> => {
    const supabase = createPublicClient()
    if (!supabase) return []
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    return !error && data ? (data as InstagramPost[]) : []
  },
  ['instagram-posts'],
  { revalidate: 3600, tags: ['instagram-posts'] }
)

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  let posts: InstagramPost[] = []

  // Local db.json baseline
  const db = await readLocalDb()
  if (Array.isArray(db.instagram_posts)) {
    posts = db.instagram_posts.filter((p: any) => p.is_active !== false)
  }

  // Try fetching from Supabase
  try {
    const data = await fetchInstagramRows()
    if (data.length > 0) {
      posts = data
    }
  } catch (e) {
    // Fallback quietly
  }

  return posts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
}
