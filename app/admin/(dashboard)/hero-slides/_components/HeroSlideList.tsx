'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createHeroSlide, deleteHeroSlide, toggleHeroSlideStatus } from '@/actions/admin/hero'
import { Trash2, Plus, Image as ImageIcon, Loader2, Link as LinkIcon, X } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

const PRESET_IMAGES = [
  { name: 'Cream Hijab Look', url: '/model-cream-hijab.png' },
  { name: 'Double Layer Abaya', url: '/abaya-double-layer.png' },
  { name: 'Handwork Khimar', url: '/khimar-handwork.png' },
  { name: 'Royal Blue Jilbab', url: '/jilbab-blue.png' },
  { name: 'Khimar Handwork 1', url: '/khimar-handwork-1.png' },
  { name: 'Front Open Abaya', url: '/abaya-front-open.png' },
  { name: 'Luxe Salwar Kameez', url: '/luxe-salwar-kameez.png' },
  { name: 'Black Jilbab Look', url: '/jilbab-black.png' },
]

export function HeroSlideList({ 
  initialSlides, 
  position = 'global',
  title = 'Background Images & Slides'
}: { 
  initialSlides: any[], 
  position?: 'left' | 'right' | 'global' | string,
  title?: string
}) {
  const [slides, setSlides] = useState(initialSlides)
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleAddSlide = (imageUrl: string) => {
    if (!imageUrl || !imageUrl.trim()) return
    setIsModalOpen(false)
    setCustomUrl('')

    const tempId = `temp-${Date.now()}`
    // Optimistic UI update
    setSlides(prev => [...prev, {
      id: tempId,
      image_url: imageUrl,
      is_active: true,
      display_order: prev.length
    }])

    // Show processing for 1 second as requested
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 1000)

    createHeroSlide(imageUrl, position).then(res => {
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Failed to add slide')
        setSlides(prev => prev.filter(s => s.id !== tempId))
      }
    }).catch(() => {
      alert('An error occurred while adding the slide')
      setSlides(prev => prev.filter(s => s.id !== tempId))
    })
  }

  const handleUploadSuccess = (result: any) => {
    const imageUrl = result?.info?.secure_url
    if (imageUrl) {
      handleAddSlide(imageUrl)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this background image?')) return
    
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 1000)

    const previousSlides = [...slides]
    // Optimistic update
    setSlides(slides.filter(s => s.id !== id))
    
    deleteHeroSlide(id).then(res => {
      if (!res.success) {
        setSlides(previousSlides)
        alert(res.error || 'Failed to delete slide')
      }
    }).catch(() => {
      setSlides(previousSlides)
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 1000)

    // Optimistic update
    setSlides(slides.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))
    
    toggleHeroSlideStatus(id, !currentStatus).then(res => {
      if (!res.success) {
        // Revert on failure
        setSlides(slides.map(s => s.id === id ? { ...s, is_active: currentStatus } : s))
        alert(res.error || 'Failed to update status')
      }
    }).catch(() => {
      setSlides(slides.map(s => s.id === id ? { ...s, is_active: currentStatus } : s))
    })
  }

  const activeCount = slides.filter(s => s.is_active).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900">{title}</h2>
        </div>
        
        {slides.length < 10 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 border border-stone-200"
            >
              <LinkIcon className="w-4 h-4 text-stone-600" />
              Pick / URL
            </button>

            <CldUploadWidget 
              signatureEndpoint="/api/cloudinary/sign"
              options={{
                maxFiles: 1,
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"]
              }}
              onSuccess={handleUploadSuccess}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Upload
                </button>
              )}
            </CldUploadWidget>
          </div>
        ) : (
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Maximum 10 slides reached
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        Upload high-quality images or select from library. They will rotate automatically across the homepage archway, showcase grid & mobile carousel. You have {activeCount} active slides.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.length === 0 ? (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
            <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-900">No slides created</p>
            <p className="text-sm text-stone-500 mt-1">Add or select an image to start building your hero section.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-all"
            >
              Choose from Library or URL
            </button>
          </div>
        ) : (
          slides.map((slide, index) => {
            return (
              <div key={slide.id} className={`flex flex-col rounded-xl border transition-all overflow-hidden shadow-sm hover:shadow ${slide.is_active ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'}`}>
                
                {/* Slide Header Row */}
                <div className="flex items-center gap-3 p-3.5">
                  <div className="h-16 w-24 sm:w-28 shrink-0 rounded-lg overflow-hidden relative bg-stone-200 border border-stone-200">
                    <Image
                      src={slide.image_url}
                      alt="Hero Background"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900">Slide {index + 1}</p>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {slide.image_url.split('/').pop()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={slide.is_active}
                        onChange={() => handleToggle(slide.id, slide.is_active)}
                        disabled={isPending || (!slide.is_active && activeCount >= 10)}
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    
                    <button
                      onClick={() => handleDelete(slide.id)}
                      disabled={isPending}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {(isPending || isProcessing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-center text-sm font-medium text-stone-700 gap-3 border border-stone-100">
            <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Modal for Selecting Preset Image or Custom URL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-stone-900">Add Hero Section Slide</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom URL Option */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Paste Image URL (`https://...` or `/...`)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. /khimar-handwork.png or https://example.com/image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
                <button
                  type="button"
                  onClick={() => handleAddSlide(customUrl)}
                  disabled={!customUrl.trim() || isPending}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Preset Library Option */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
                Or Pick from Catalog Library
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => handleAddSlide(preset.url)}
                    disabled={isPending}
                    className="group relative flex flex-col items-center rounded-xl overflow-hidden border border-stone-200 hover:border-teal-600 hover:shadow-md transition-all text-left bg-stone-50"
                  >
                    <div className="w-full h-24 relative bg-stone-200">
                      <Image
                        src={preset.url}
                        alt={preset.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="w-full p-2 text-[11px] font-medium text-stone-800 truncate text-center bg-white border-t border-stone-100">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
