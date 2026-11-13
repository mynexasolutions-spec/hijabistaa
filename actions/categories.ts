'use server'

import { isAdminUser } from '@/lib/adminAuth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_cache, updateTag } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { redirect } from 'next/navigation'

export type ActionResult = {
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

// Header runs this on every page view for every visitor; cache it.
const fetchActiveCategories = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    if (!supabase) return []
    const { data } = await supabase.from('categories').select('*').eq('is_active', true)
    return data || []
  },
  ['active-categories'],
  { revalidate: 3600, tags: ['categories'] }
)

export async function getActiveCategories() {
  try {
    return await fetchActiveCategories()
  } catch (e) {
    return []
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCategory(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('image_url') as string
  const parentId = formData.get('parent_id') as string
  const isActive = formData.get('is_active') === 'on'

  if (!name) {
    return { error: 'Category name is required' }
  }

  const slug = slugify(name)

  const { error } = await adminClient.from('categories').insert({
    id: slug,
    name,
    slug,
    description: description || null,
    image_url: imageUrl || null,
    parent_id: parentId || null,
    is_active: isActive,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  updateTag('categories')
  redirect('/admin/categories')
}

export async function updateCategory(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('image_url') as string
  const parentId = formData.get('parent_id') as string
  const isActive = formData.get('is_active') === 'on'

  if (!id || !name) {
    return { error: 'Category ID and name are required' }
  }

  const slug = slugify(name)

  const { error } = await adminClient
    .from('categories')
    .update({
      name,
      slug,
      description: description || null,
      image_url: imageUrl || null,
      parent_id: parentId || null,
      is_active: isActive,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  updateTag('categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient.from('categories').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  updateTag('categories')
  return { success: true }
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  updateTag('categories')
  return { success: true }
}
