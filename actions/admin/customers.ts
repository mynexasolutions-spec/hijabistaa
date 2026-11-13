'use server'

import { isAdminUser } from '@/lib/adminAuth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type AdminActionResult = {
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

export async function getCustomers() {
  const supabase = await createClient()

  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return []

  // Use admin client to bypass RLS
  const adminClient = createAdminClient()
  const { data: customers } = await adminClient
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return customers || []
}

export async function toggleCustomerStatus(
  id: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const authClient = await createClient()
  const isAdmin = await checkAdminAuth(authClient)
  if (!isAdmin) return { error: 'Unauthorized' }
  // RLS rejects the admin session, so write with the service-role client
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('customers')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/customers')
  return { success: true }
}
