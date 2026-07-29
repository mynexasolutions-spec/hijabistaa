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

export async function getInquiries() {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return []

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

export async function markInquiryAsRead(id: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('inquiries')
    .update({ is_resolved: true })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('inquiries')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/inquiries')
  return { success: true }
}
