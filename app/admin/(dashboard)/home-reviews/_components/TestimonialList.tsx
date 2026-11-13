'use client'

import { useState } from 'react'
import { deleteTestimonial } from '@/actions/admin/testimonials'
import { Star, Trash2, CheckCircle, Clock } from 'lucide-react'

export type Testimonial = {
  id: string
  name: string
  city?: string | null
  quote: string
  initials?: string | null
  product?: string | null
  rating: number
  is_active: boolean
  created_at: string
}

export function TestimonialList({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (id.startsWith('mock-')) {
      alert('This is a default sample review and cannot be deleted from the database.')
      return
    }
    if (!confirm('Are you sure you want to delete this home review?')) return

    setIsProcessing(id)
    const formData = new FormData()
    formData.append('id', id)

    const result = await deleteTestimonial({}, formData)
    if (result.error) {
      alert(result.error)
    }
    setIsProcessing(null)
  }

  if (initialTestimonials.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <p className="text-stone-500">No home reviews found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      {/* Mobile: one card per home review */}
      <ul className="md:hidden divide-y divide-stone-100">
        {initialTestimonials.map((item) => (
          <li key={item.id} className="px-4 py-4 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900 break-words">{item.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {item.city || 'Verified'} · {item.product || 'General'}
                </p>
              </div>
              {item.is_active ? (
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  Hidden
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < item.rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'}`}
                />
              ))}
            </div>
            <p className="text-sm text-stone-600 break-words">&quot;{item.quote}&quot;</p>
            <div className="flex justify-end">
              <button
                onClick={() => handleDelete(item.id)}
                disabled={isProcessing === item.id}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Delete review"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet / desktop: original table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-sm">
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Rating</th>
              <th className="p-4 font-semibold">Quote</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {initialTestimonials.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      Hidden
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-medium text-stone-900">{item.name}</div>
                  <div className="text-xs text-stone-500">{item.city || 'Verified'}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-stone-800 font-medium">{item.product || 'General'}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-orange-400 text-orange-400' : 'text-stone-200'}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="p-4 max-w-xs">
                  <p className="text-sm text-stone-600 truncate" title={item.quote}>
                    "{item.quote}"
                  </p>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isProcessing === item.id}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Review"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
