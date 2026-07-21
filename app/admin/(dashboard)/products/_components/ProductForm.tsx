'use client'

import { useTransition, useActionState, useState, useMemo } from 'react'
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from '@/actions/products'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import type { Category, Product } from '@/types/database'

type OtherProduct = Pick<Product, 'id' | 'name' | 'color_group_id' | 'color_name' | 'badge'>

interface ProductFormProps {
  product?: Product
  categories: Category[]
  otherProducts?: OtherProduct[]
}

export default function ProductForm({ product, categories, otherProducts = [] }: ProductFormProps) {
  const isEditing = !!product
  const action = isEditing ? updateProduct : createProduct

  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {}
  )
  const [pending, startTransition] = useTransition()

  // If this product already belongs to a color group, preselect a sibling
  // from that same group as the "group with" default.
  const [customBadge, setCustomBadge] = useState(product?.badge || '')

  // Compute unique badges from all products plus defaults
  const existingBadges = useMemo(() => {
    const allBadges = otherProducts.map(p => p.badge).filter(Boolean) as string[];
    const unique = Array.from(new Set(allBadges));
    
    // Merge defaults
    const defaults = ["New", "Hot", "Bestseller", "Premium", "Popular", "Luxe", "Handcrafted"];
    defaults.forEach(d => {
      if (!unique.includes(d)) unique.push(d);
    });
    
    return unique;
  }, [otherProducts]);

  return (
    <form
      id="product-form"
      action={(formData) => startTransition(() => formAction(formData))}
      className="space-y-6"
    >
      {isEditing && <input type="hidden" name="id" value={product.id} />}

      {/* Error */}
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  required
                  maxLength={255}
                  defaultValue={product?.name || ''}
                  placeholder="e.g. Premium Front Open Abaya"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
                <p className="text-xs text-stone-400 mt-1.5">
                  Slug will be auto-generated from the name.
                </p>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="product-category"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="product-category"
                  name="category_id"
                  required
                  defaultValue={product?.category_id || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Old Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="product-price"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={product?.price || ''}
                  placeholder="e.g. 1499"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="product-old-price"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  MRP / Old Price (₹)
                </label>
                <input
                  id="product-old-price"
                  name="oldPrice"
                  type="number"
                  step="0.01"
                  defaultValue={product?.oldPrice || ''}
                  placeholder="e.g. 1999"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label
                htmlFor="product-short-desc"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Short Description
              </label>
              <textarea
                id="product-short-desc"
                name="short_description"
                rows={3}
                maxLength={500}
                defaultValue={product?.short_description || ''}
                placeholder="Brief one-liner about the product"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-none"
              />
            </div>



            {/* Description */}
            <div>
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Full Description
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={8}
                maxLength={5000}
                defaultValue={product?.description || ''}
                placeholder="Detailed product description..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-y"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">SEO</h2>

            <div>
              <label
                htmlFor="seo-title"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                SEO Title
              </label>
              <input
                id="seo-title"
                name="seo_title"
                type="text"
                maxLength={60}
                defaultValue={product?.seo_title || ''}
                placeholder="Custom title for search engines"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="seo-description"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                SEO Description
              </label>
              <textarea
                id="seo-description"
                name="seo_description"
                rows={5}
                maxLength={160}
                defaultValue={product?.seo_description || ''}
                placeholder="Meta description for search results"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-stone-200/80 p-6 space-y-5">
            <h2 className="text-base font-semibold text-stone-900">Status</h2>

            {/* Badge / Tag */}
            <div>
              <label
                htmlFor="product-badge"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Badge / Tag
              </label>
              <div className="flex gap-2">
                <input type="hidden" name="badge" value={customBadge} />
                <input
                  id="product-badge"
                  type="text"
                  value={customBadge}
                  onChange={(e) => setCustomBadge(e.target.value)}
                  placeholder="e.g. New, Bestseller, Luxe"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const btn = e.currentTarget;
                    const originalText = btn.innerText;
                    btn.innerText = 'Set ✓';
                    btn.classList.add('bg-emerald/10', 'text-emerald');
                    setTimeout(() => {
                      btn.innerText = originalText;
                      btn.classList.remove('bg-emerald/10', 'text-emerald');
                    }, 1500);
                  }}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-200 transition-all whitespace-nowrap shrink-0 border border-stone-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {existingBadges.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setCustomBadge(b)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      customBadge === b 
                        ? 'bg-orange-100 text-orange-800 border-orange-200' 
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
                <button
                   type="button"
                   onClick={() => setCustomBadge('')}
                   className="px-2.5 py-1 text-xs font-medium rounded-md border border-stone-200 bg-white text-stone-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                Shown as a small tag on the product card in the storefront.
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                id="product-active"
                name="is_active"
                type="checkbox"
                defaultChecked={product?.is_active ?? true}
                className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
              />
              <label
                htmlFor="product-active"
                className="text-sm font-medium text-stone-700"
              >
                Active — visible in the store
              </label>
            </div>

            {/* Featured Status */}
            <div className="flex items-center gap-3">
              <input
                id="product-featured"
                name="is_featured"
                type="checkbox"
                defaultChecked={product?.is_featured ?? false}
                className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
              />
              <label
                htmlFor="product-featured"
                className="text-sm font-medium text-stone-700"
              >
                Featured — highlight on homepage
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {pending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
