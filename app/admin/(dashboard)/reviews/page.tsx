import { createClient } from '@/lib/supabase/server'
import { ReviewsTabs } from './_components/ReviewsTabs'

export const metadata = {
  title: 'Reviews Management | Admin',
}

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  // Fetch product reviews and home page testimonials safely from both Supabase & local fallback
  let reviews: any[] = []
  let testimonials: any[] = []
  let testimonialsError = false

  try {
    const [revRes, testRes] = await Promise.all([
      supabase
        .from('reviews')
        .select(`
          *,
          products ( name ),
          customers ( full_name, email )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
    ])

    if (!revRes.error && revRes.data) {
      reviews = revRes.data
    } else {
      const { data: simpleRev } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      if (simpleRev) reviews = simpleRev
    }

    if (!testRes.error && testRes.data) {
      testimonials = testRes.data
    } else {
      testimonialsError = true
    }
  } catch (e) {
    console.error("Error loading admin reviews:", e)
  }

  // Combine with local reviews from lib/db.json
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    if (Array.isArray(dbData.reviews)) {
      const localRev = dbData.reviews.map((r: any) => ({
        ...r,
        products: { name: r.product_name || r.product_id },
        customers: { full_name: r.customer_name || 'Verified Customer', email: 'customer@hijabistaa.com' }
      }))
      const allMap = new Map()
      ;[...reviews, ...localRev].forEach(r => {
        if (r && r.id && !allMap.has(r.id)) allMap.set(r.id, r)
      })
      reviews = Array.from(allMap.values()).sort((a: any, b: any) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
    }
  } catch (localErr) {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Reviews & Testimonials</h1>
          <p className="text-stone-500 text-sm mt-1">Manage both Home Page carousel reviews and customer product reviews.</p>
        </div>
      </div>

      <ReviewsTabs
        productReviews={reviews || []}
        homeReviews={testimonials || []}
        homeReviewsError={!!testimonialsError}
      />
    </div>
  )
}
