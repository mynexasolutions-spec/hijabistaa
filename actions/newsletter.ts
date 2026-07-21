'use server'

import { createClient } from '@/lib/supabase/server'

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

export async function subscribeNewsletter(email: string) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Email address is required.' }
  }

  const cleanEmail = email.trim().toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const newSub = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: cleanEmail,
    status: 'subscribed',
    created_at: new Date().toISOString()
  }

  // 1. Local db.json persistence
  let localDb = await readLocalDb()
  if (!localDb.subscribers) {
    localDb.subscribers = []
  }

  const existingLocal = localDb.subscribers.find(
    (s: any) => s.email?.toLowerCase() === cleanEmail
  )

  if (existingLocal) {
    return { success: true, message: 'You are already subscribed to our newsletter!' }
  }

  localDb.subscribers.unshift(newSub)
  await writeLocalDb(localDb)

  // 2. Supabase persistence (graceful fallback)
  try {
    const supabase = await createClient()
    const { data: existingSupabase } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (!existingSupabase) {
      await supabase.from('subscribers').insert([
        {
          id: newSub.id,
          email: cleanEmail,
          status: 'subscribed',
          created_at: newSub.created_at
        }
      ])
    }
  } catch (err) {
    console.warn('Supabase subscribe warning (fallback to local):', err)
  }

  return { success: true, message: 'Thank you for subscribing to Hijabistaa!' }
}
