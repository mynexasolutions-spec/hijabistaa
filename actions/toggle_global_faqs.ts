'use server'

import { isAdminUser } from '@/lib/adminAuth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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

export async function toggleUseGlobalFaqs(productId: string, useGlobalFaqs: boolean) {
  const authClient = await createClient()
  if (!(await checkAdminAuth(authClient))) return { success: false, error: 'Unauthorized' }
  // RLS rejects the admin session, so write with the service-role client
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ use_global_faqs: useGlobalFaqs })
    .eq('id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Use the RPC function or just revalidate path
  revalidatePath('/admin/products/[id]/edit', 'page')
  revalidatePath('/product/[slug]', 'page')
  
  return { success: true }
}
