import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import CategoryForm from '../_components/CategoryForm'
import { FolderPlus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'New Category',
}

export default async function NewCategoryPage() {
  const supabase = await createClient()
  const { data: parentCategories } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name')

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-white to-stone-50/50 rounded-2xl border border-stone-200/60 shadow-sm">
        <div className="p-3 bg-orange-100/50 text-orange-600 rounded-xl shadow-inner">
          <FolderPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600">
            Create New Category
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Add a new product category to organize your inventory. Fill in the details below.
          </p>
        </div>
      </div>

      <CategoryForm parentCategories={parentCategories || []} />
    </div>
  )
}
