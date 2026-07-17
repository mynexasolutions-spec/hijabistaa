'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
  error?: string
  success?: boolean
}

export async function submitReview(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const productId = formData.get('product_id') as string
    const productName = formData.get('product_name') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string

    if (!productId) {
      return { error: 'Product ID is required.' }
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { error: 'Please select a valid rating between 1 and 5.' }
    }

    const reviewId = crypto.randomUUID()
    const nowStr = new Date().toISOString()
    const customerName = user?.user_metadata?.full_name || 'Verified Customer'

    // 1. Save locally to lib/db.json immediately to guarantee persistence across refreshes
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      let dbData: any = {}
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      } catch (e) {}
      if (!Array.isArray(dbData.reviews)) dbData.reviews = []
      dbData.reviews.unshift({
        id: reviewId,
        product_id: productId,
        user_id: user?.id || 'guest',
        customer_name: customerName,
        rating,
        comment: comment ? comment.trim() : null,
        is_approved: false, // Default to pending for admin moderation
        created_at: nowStr
      })
      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8')
    } catch (fsErr) {
      console.error('Local db.json save error:', fsErr)
    }

    // 2. Try saving to Supabase if available
    try {
      // Ensure the product exists in the Supabase 'products' table to avoid foreign_key_violation
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', productId)
        .single()

      if (!existingProduct) {
        await supabase.from('products').insert({
          id: productId,
          name: productName || `Modest Collection Style`,
          slug: `${productId.toLowerCase()}-${Date.now()}`,
          is_active: true
        })
      }

      let validUserId: string | null = null
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (profile) {
          validUserId = user.id
        } else {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email || 'customer@hijabistaa.com',
            full_name: customerName
          })
          validUserId = profileError ? null : user.id
        }
      }

      await supabase
        .from('reviews')
        .insert({
          id: reviewId,
          product_id: productId,
          user_id: validUserId,
          rating,
          comment: comment ? comment.trim() : null,
          is_approved: false // Default to pending for admin moderation
        })
    } catch (sbErr) {
      console.error('Supabase review insert warning:', sbErr)
    }

    revalidatePath(`/shop/${productId}`)
    revalidatePath(`/admin/reviews`)
    revalidatePath(`/`, 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error submitting review:', err)
    return { error: 'An unexpected error occurred.' }
  }
}


