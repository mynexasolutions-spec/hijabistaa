'use client'

import { useState } from 'react'
import { ReviewList } from './ReviewList'
import { TestimonialList, type Testimonial } from '../../home-reviews/_components/TestimonialList'
import { TestimonialForm } from '../../home-reviews/_components/TestimonialForm'
import { Star, MessageSquareQuote, PlusCircle, AlertCircle, X } from 'lucide-react'

const defaultHomeReviews: Testimonial[] = [
  {
    id: 'mock-1',
    name: 'Sumaiya R.',
    city: 'Mumbai',
    quote: "The premium chiffon drapes beautifully and stays in place all day. The quality is exceptional, definitely buying more colors.",
    initials: 'SR',
    product: 'Premium Chiffon Hijab',
    rating: 5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    name: 'Afreen K.',
    city: 'Noida',
    quote: "Hijabista understands modest fashion perfectly. The jersey hijabs are so soft and breathable, even in the summer heat.",
    initials: 'AK',
    product: 'Luxury Jersey Hijab',
    rating: 5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    name: 'Hina M.',
    city: 'Gurugram',
    quote: "I ordered the instant hijabs and they are a lifesaver for busy mornings. Fast shipping and excellent packaging too!",
    initials: 'HM',
    product: 'Instant Wrap Hijab',
    rating: 5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-4',
    name: 'Zoya A.',
    city: 'Faridabad',
    quote: "The colors are exactly as shown on the website. These modal hijabs feel so luxurious. My new go-to store for modest essentials.",
    initials: 'ZA',
    product: 'Premium Modal Hijab',
    rating: 5,
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export function ReviewsTabs({
  productReviews,
  homeReviews,
  homeReviewsError
}: {
  productReviews: any[]
  homeReviews: Testimonial[]
  homeReviewsError: boolean
}) {
  const [activeTab, setActiveTab] = useState<'home' | 'products'>('products')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayHomeReviews = homeReviews && homeReviews.length > 0 ? homeReviews : defaultHomeReviews

  return (
    <div className="space-y-6">
      {/* Tab Navigation & Top Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 pb-3 px-2 font-medium text-sm transition-all relative ${
              activeTab === 'products'
                ? 'text-teal-800 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Product Reviews</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
              {productReviews.length}
            </span>
            {activeTab === 'products' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-800 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 pb-3 px-2 font-medium text-sm transition-all relative ${
              activeTab === 'home'
                ? 'text-teal-800 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Home Page Reviews (Carousel)</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {displayHomeReviews.length}
            </span>
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-800 rounded-t-full" />
            )}
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-xl text-sm transition-all shadow-sm hover:shadow mb-2 sm:mb-1 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Home Review</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'home' ? (
        <div className="space-y-6">
          {homeReviewsError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Database Table Notice</p>
                <p className="mt-0.5 text-amber-700">
                  To add, edit, or delete live Home Page reviews, please run the <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">testimonials.sql</code> script once inside your Supabase SQL Editor. Currently displaying default Home Page reviews below.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <TestimonialList initialTestimonials={displayHomeReviews} />
          </div>
        </div>
      ) : (
        <ReviewList initialReviews={productReviews} />
      )}

      {/* Popup Modal for Add Home Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-700" />
                Add Home Review
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TestimonialForm onSuccess={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
