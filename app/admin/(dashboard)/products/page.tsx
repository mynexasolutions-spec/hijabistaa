import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import type { Metadata } from 'next'
import ProductsTable from './_components/ProductsTable'

export const metadata: Metadata = {
  title: 'Products',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Searchable / filterable table */}
      {!products || products.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No products yet</p>
            <p className="text-stone-400 text-xs mt-1">
              Create your first product to get started.
            </p>
          </div>
        </div>
      ) : (
        <ProductsTable products={products as any} />
      )}
    </div>
  )
}
