'use client'

import { useState, useTransition, useActionState } from 'react'
import { createCategory, updateCategory, type ActionResult } from '@/actions/categories'
import Link from 'next/link'
import Image from 'next/image'
import { Save, ArrowLeft, Image as ImageIcon, Loader2, X, Info } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  category?: Category
  parentCategories?: Category[]
}

export default function CategoryForm({ category, parentCategories = [] }: CategoryFormProps) {
  const isEditing = !!category
  const action = isEditing ? updateCategory : createCategory

  const [imageUrl, setImageUrl] = useState<string | null>(category?.image_url || null)
  const [isUploading, setIsUploading] = useState(false)

  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {}
  )
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="space-y-6 animate-in fade-in duration-500"
    >
      {/* Hidden ID for edit */}
      {isEditing && <input type="hidden" name="id" value={category.id} />}

      {/* Error */}
      {state.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <Info className="w-5 h-5 text-red-500" />
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Column: Details */}
            <div className="space-y-8">
              {/* Name */}
              <div className="space-y-2 group">
                <label
                  htmlFor="category-name"
                  className="text-sm font-semibold text-stone-800 flex items-center gap-1.5"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="category-name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  defaultValue={category?.name || ''}
                  placeholder="e.g. Whole Spices"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 shadow-sm hover:border-stone-300"
                />
                <p className="text-xs text-stone-400 flex items-center gap-1 mt-1.5">
                  <Info className="w-3.5 h-3.5" /> A URL-friendly slug will be auto-generated.
                </p>
              </div>

              {/* Parent Category */}
              <div className="space-y-2 group">
                <label
                  htmlFor="category-parent"
                  className="block text-sm font-semibold text-stone-800 flex items-center gap-1.5"
                >
                  Parent Category (Optional)
                </label>
                <select
                  id="category-parent"
                  name="parent_id"
                  defaultValue={category?.parent_id || ''}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 shadow-sm hover:border-stone-300"
                >
                  <option value="">None (Make this a top-level category)</option>
                  {parentCategories.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-400 flex items-center gap-1 mt-1.5">
                  <Info className="w-3.5 h-3.5" /> Select a category to make this a sub-category.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2 group">
                <label
                  htmlFor="category-description"
                  className="block text-sm font-semibold text-stone-800"
                >
                  Description
                </label>
                <textarea
                  id="category-description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  defaultValue={category?.description || ''}
                  placeholder="Optional description for this category..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 shadow-sm hover:border-stone-300 resize-none"
                />
              </div>

              {/* Active Status */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-stone-800">Visibility</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Make this category visible to customers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="category-active"
                    name="is_active"
                    defaultChecked={category?.is_active ?? true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>

            {/* Right Column: Media */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-800">
                Category Image (Optional)
              </label>
              <input type="hidden" name="image_url" value={imageUrl || ''} />
              
              {imageUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-xl border border-stone-200 overflow-hidden bg-stone-100 group shadow-inner">
                  <Image 
                    src={imageUrl} 
                    alt="Category Preview" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-500 text-stone-700 hover:text-white rounded-lg shadow-md backdrop-blur-md transition-all transform opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <CldUploadWidget 
                  signatureEndpoint="/api/cloudinary/sign"
                  options={{
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: ["jpg", "jpeg", "png", "webp"]
                  }}
                  onSuccess={(result: any) => {
                    setImageUrl(result.info.secure_url)
                    setIsUploading(false)
                  }}
                  onOpen={() => setIsUploading(true)}
                  onError={() => setIsUploading(false)}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      disabled={isUploading || pending}
                      className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 text-stone-500 hover:bg-orange-50/30 hover:border-orange-400 hover:text-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="p-4 rounded-full bg-white shadow-sm border border-stone-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        ) : (
                          <ImageIcon className="w-6 h-6 group-hover:text-orange-500 transition-colors" />
                        )}
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold block">Click to upload image</span>
                        <span className="text-xs text-stone-400 mt-1 block">JPG, PNG, WEBP allowed</span>
                      </div>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>

          </div>
        </div>

        {/* Footer actions inside the card */}
        <div className="px-6 sm:px-8 py-5 bg-stone-50/80 border-t border-stone-200/60 flex items-center justify-between">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg shadow-sm hover:bg-stone-50 hover:text-stone-900 transition-all focus:outline-none focus:ring-2 focus:ring-stone-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98]"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </form>
  )
}
