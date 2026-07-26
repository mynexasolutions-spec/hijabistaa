import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FolderTree } from 'lucide-react'
import type { Metadata } from 'next'
import CategoryRow from './_components/CategoryRow'
import DiscoverMenuManager from './_components/DiscoverMenuManager'
import { getMegaMenuDiscoverItems } from '@/actions/admin/megaMenuDiscover'

export const metadata: Metadata = {
  title: 'Categories',
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('created_at', { ascending: false })

  const categories = categoriesData?.map((category: any) => ({
    ...category,
    count: category.products?.[0]?.count || 0,
  })) || []

  // Group subcategories under their parents
  const topLevel = categories.filter((c: any) => !c.parent_id).sort((a: any, b: any) => a.name.localeCompare(b.name))
  const sortedCategories: any[] = []
  
  topLevel.forEach((parent: any) => {
    sortedCategories.push(parent)
    const children = categories.filter((c: any) => c.parent_id === parent.id).sort((a: any, b: any) => a.name.localeCompare(b.name))
    children.forEach((child: any) => {
      sortedCategories.push({ ...child, isSubcategory: true, parentName: parent.name })
    })
  })
  
  // Add any categories that might have missing parents (orphans)
  categories.forEach((c: any) => {
    if (!sortedCategories.find(sc => sc.id === c.id)) {
      sortedCategories.push(c)
    }
  })

  const discoverItems = await getMegaMenuDiscoverItems()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage your product categories
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
        {!categories || categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No categories yet</p>
            <p className="text-stone-400 text-xs mt-1">
              Create your first category to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                    Products
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                    Slug
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                    Created
                  </th>
                  <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedCategories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discover Menu Section */}
      <DiscoverMenuManager initialItems={discoverItems} />
    </div>
  )
}
