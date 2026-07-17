import { createClient } from '@/lib/supabase/server'
import { TestimonialList } from './_components/TestimonialList'
import { TestimonialForm } from './_components/TestimonialForm'
import { PlusCircle } from 'lucide-react'

export const metadata = {
  title: 'Home Reviews | Admin',
}

export default async function HomeReviewsPage() {
  const supabase = await createClient()

  // Auth is handled by the admin layout

  // Fetch all testimonials
  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Home Page Reviews</h1>
          <p className="text-stone-500 text-sm mt-1">Manage testimonials shown on the home page carousel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
              Error loading reviews. Have you created the testimonials table in Supabase?
            </div>
          ) : (
            <TestimonialList initialTestimonials={testimonials || []} />
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-stone-400" />
              Add Review
            </h2>
            <TestimonialForm />
          </div>
        </div>
      </div>
    </div>
  )
}
