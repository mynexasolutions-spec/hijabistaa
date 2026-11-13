import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

/**
 * Cached, cookie-less reads of the PUBLIC catalogue for the home and shop pages.
 * These pages are hit by every visitor and crawler, so they must not query
 * Supabase on each request (that is what exhausted the free-tier egress).
 *
 * Staleness window is 60s. Product edits made in the admin show up within a
 * minute; call `updateTag('products')` from a server action for instant purge.
 */

const SHOP_SELECT = `
  id, name, slug, category_id, is_active, badge, rating, price, oldPrice, featured_image_url, color_group_id, created_at,
  product_images ( image_url ),
  product_variants ( price, original_price )
`

const getAllShopProducts = unstable_cache(
  async (featuredOnly: boolean) => {
    const supabase = createPublicClient()
    if (!supabase) return []
    let q = supabase
      .from('products')
      .select(SHOP_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (featuredOnly) q = q.eq('is_featured', true)
    const { data } = await q
    return data || []
  },
  ['shop-products'],
  { revalidate: 60, tags: ['products'] }
)

/** Search is matched in memory (never interpolated into a PostgREST filter). */
function sanitizeSearch(term: string) {
  return term.trim().slice(0, 60)
}

export async function getShopProducts(search: string, featuredOnly: boolean): Promise<any[]> {
  const term = sanitizeSearch(search)
  if (!term) return (await getAllShopProducts(featuredOnly)) as any[]

  // Free-text searches are unbounded, so filter the cached full list in memory
  // instead of creating one cache entry (and one Supabase query) per query string.
  const all = (await getAllShopProducts(featuredOnly)) as any[]
  const needle = term.toLowerCase()
  return all.filter(
    (p) =>
      String(p.name || '').toLowerCase().includes(needle) ||
      String(p.category_id || '').toLowerCase().includes(needle)
  )
}

export const getHomeProducts = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    if (!supabase) return { all: [], featured: [], salwar: [] }

    const [all, featured, salwar] = await Promise.all([
      supabase.from('products').select('category_id, color_group_id').eq('is_active', true),
      supabase
        .from('products')
        .select(`
          id, name, slug, category_id, is_featured, is_active, color_group_id, badge, price, oldPrice, featured_image_url,
          product_images ( image_url ),
          product_variants ( price, original_price )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('products')
        .select(`
          id, name, slug, price, oldPrice, badge, rating, featured_image_url, color_group_id,
          product_images ( image_url ),
          product_variants ( price, original_price )
        `)
        .or('category_id.eq.salwar_kameez,category_id.eq.salwar-kameez')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4),
    ])

    return {
      all: all.data || [],
      featured: featured.data || [],
      salwar: salwar.data || [],
    }
  },
  ['home-products'],
  { revalidate: 60, tags: ['products'] }
)
