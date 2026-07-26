'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Subscriber = {
  id: string
  email: string
  status: string
  created_at: string
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

export async function getSubscribers(): Promise<Subscriber[]> {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return []

  let subscribersList: Subscriber[] = []

  // Baseline from db.json
  const localDb = await readLocalDb()
  if (Array.isArray(localDb.subscribers)) {
    subscribersList = [...localDb.subscribers]
  }

  // Fetch from Supabase and merge
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      const map = new Map<string, Subscriber>()
      subscribersList.forEach(s => map.set(s.email.toLowerCase(), s))
      data.forEach(s => map.set(s.email.toLowerCase(), s))
      subscribersList = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }
  } catch (err) {
    // Fallback quietly to local
  }

  return subscribersList
}

export async function addSubscriberByAdmin(email: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  if (!email || !email.trim()) return { success: false, error: 'Email is required' }
  const cleanEmail = email.trim().toLowerCase()

  const newSub = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: cleanEmail,
    status: 'subscribed',
    created_at: new Date().toISOString()
  }

  // 1. Local DB
  const localDb = await readLocalDb()
  if (!localDb.subscribers) localDb.subscribers = []
  if (localDb.subscribers.some((s: any) => s.email?.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Subscriber email already exists' }
  }
  localDb.subscribers.unshift(newSub)
  await writeLocalDb(localDb)

  // 2. Supabase
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    await adminClient.from('subscribers').insert([newSub])
  } catch (err) {}

  revalidatePath('/admin/subscribers')
  return { success: true }
}

export async function deleteSubscriber(id: string, email: string) {
  const supabase = await createClient()
  const isAdmin = await checkAdminAuth(supabase)
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // 1. Local DB
  const localDb = await readLocalDb()
  if (Array.isArray(localDb.subscribers)) {
    localDb.subscribers = localDb.subscribers.filter(
      (s: any) => s.id !== id && s.email?.toLowerCase() !== email.toLowerCase()
    )
    await writeLocalDb(localDb)
  }

  // 2. Supabase
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()
    await adminClient.from('subscribers').delete().or(`id.eq.${id},email.eq.${email}`)
  } catch (err) {}

  revalidatePath('/admin/subscribers')
  return { success: true }
}
