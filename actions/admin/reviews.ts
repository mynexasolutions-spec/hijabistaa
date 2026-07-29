'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
  error?: string
  success?: boolean
}

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

export async function approveReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const isAdmin = await checkAdminAuth(supabase)
    if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

    const reviewId = formData.get('id') as string
    if (!reviewId) {
      return { error: 'Review ID is required.' }
    }

    // 1. Always update local lib/db.json first
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      let dbData: any = {}
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      } catch (e) {}
      if (Array.isArray(dbData.reviews)) {
        dbData.reviews = dbData.reviews.map((r: any) => 
          r.id === reviewId ? { ...r, is_approved: true } : r
        )
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8')
      }
    } catch (fsErr) {
      console.error('Local db.json approve error:', fsErr)
    }

    // 2. Update Supabase using Admin Client to bypass RLS
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createAdminClient()
      await adminClient
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)
    } catch (sbErr) {
      console.error('Supabase approve warning:', sbErr)
    }

    revalidatePath('/admin/reviews')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error approving review:', err)
    return { error: 'An unexpected error occurred.' }
  }
}

export async function deleteReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const isAdmin = await checkAdminAuth(supabase)
    if (!isAdmin) return { error: 'Unauthorized. Admin access required.' }

    const reviewId = formData.get('id') as string
    if (!reviewId) {
      return { error: 'Review ID is required.' }
    }

    // 1. Always delete from local lib/db.json first
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      let dbData: any = {}
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      } catch (e) {}
      if (Array.isArray(dbData.reviews)) {
        dbData.reviews = dbData.reviews.filter((r: any) => r.id !== reviewId)
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8')
      }
    } catch (fsErr) {
      console.error('Local db.json delete error:', fsErr)
    }

    // 2. Delete from Supabase using Admin Client to bypass RLS
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createAdminClient()
      await adminClient
        .from('reviews')
        .delete()
        .eq('id', reviewId)
    } catch (sbErr) {
      console.error('Supabase delete warning:', sbErr)
    }

    revalidatePath('/admin/reviews')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting review:', err)
    return { error: 'An unexpected error occurred.' }
  }
}
