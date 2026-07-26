'use client'

import { useState, useTransition } from 'react'
import { addTestimonial } from '@/actions/admin/testimonials'
import { PlusCircle } from 'lucide-react'

export function TestimonialForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await addTestimonial({}, formData)
      if (result.error) {
        setError(result.error)
      } else {
        const form = document.getElementById('testimonial-form') as HTMLFormElement
        if (form) form.reset()
        if (onSuccess) onSuccess()
      }
    })
  }

  return (
    <form id="testimonial-form" action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
          Customer Name *
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Sumaiya R."
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            placeholder="e.g. Mumbai"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
            Initials
          </label>
          <input
            type="text"
            name="initials"
            placeholder="e.g. SR"
            maxLength={3}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent uppercase"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
          Product Name
        </label>
        <input
          type="text"
          name="product"
          placeholder="e.g. Double Layer Premium Abaya"
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
          Rating (1-5)
        </label>
        <select
          name="rating"
          defaultValue="5"
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent bg-white"
        >
          <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
          <option value="4">4 Stars ⭐⭐⭐⭐</option>
          <option value="3">3 Stars ⭐⭐⭐</option>
          <option value="2">2 Stars ⭐⭐</option>
          <option value="1">1 Star ⭐</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
          Quote / Review *
        </label>
        <textarea
          name="quote"
          required
          rows={3}
          placeholder="Enter the customer review text..."
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          defaultChecked
          className="rounded border-stone-300 text-teal-700 focus:ring-teal-700 w-4 h-4"
        />
        <label htmlFor="is_active" className="text-sm text-stone-700 font-medium cursor-pointer">
          Show on Home Page carousel
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm hover:shadow disabled:opacity-50"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{isPending ? 'Adding Review...' : 'Add Home Review'}</span>
      </button>
    </form>
  )
}
