'use client'

import { useMemo, useState } from 'react'
import { Search, X, Package } from 'lucide-react'
import ProductRow from './ProductRow'

type ProductItem = {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number | null
  short_description: string | null
  featured_image_url?: string | null
  image_url?: string | null
  badge?: string | null
  is_active: boolean
  created_at: string
  categories: { name: string } | null
}

type SortKey = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

const UNCATEGORIZED = '__uncategorized__'

const selectClass =
  'w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all'

export default function ProductsTable({ products }: { products: ProductItem[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  const categoryNames = useMemo(() => {
    const names = new Set<string>()
    products.forEach((p) => {
      if (p.categories?.name) names.add(p.categories.name)
    })
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [products])

  const hasUncategorized = useMemo(() => products.some((p) => !p.categories), [products])

  const filtered = useMemo(() => {
    // Every word must match somewhere in name / slug / category / badge (any order)
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)

    const list = products.filter((p) => {
      if (status === 'active' && !p.is_active) return false
      if (status === 'inactive' && p.is_active) return false

      if (category === UNCATEGORIZED) {
        if (p.categories) return false
      } else if (category !== 'all' && p.categories?.name !== category) {
        return false
      }

      if (words.length > 0) {
        const haystack = `${p.name} ${p.slug} ${p.categories?.name || ''} ${p.badge || ''}`.toLowerCase()
        if (!words.every((w) => haystack.includes(w))) return false
      }
      return true
    })

    const byDate = (p: ProductItem) => new Date(p.created_at).getTime() || 0
    list.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return byDate(a) - byDate(b)
        case 'name_asc':
          return a.name.localeCompare(b.name)
        case 'name_desc':
          return b.name.localeCompare(a.name)
        case 'price_asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price_desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        default:
          return byDate(b) - byDate(a)
      }
    })
    return list
  }, [products, query, category, status, sort])

  const filtersActive = query.trim() !== '' || category !== 'all' || status !== 'all'

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    setStatus('all')
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
      {/* Search + filters */}
      <div className="p-4 border-b border-stone-100 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, badge or slug..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
            {hasUncategorized && <option value={UNCATEGORIZED}>Uncategorized</option>}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectClass} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass} aria-label="Sort products">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-800">{filtered.length}</strong> of {products.length} products
          </span>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#9C5247] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No products match your search</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-xs font-semibold text-[#9C5247] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="hidden md:table-header-group">
              <tr className="bg-stone-50/50">
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Product</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Category</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Price / MRP</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Badge</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Created</th>
                <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
