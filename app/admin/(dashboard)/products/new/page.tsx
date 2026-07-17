import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ProductForm from '../_components/ProductForm'
import ProductInfoEditor from '../_components/ProductInfoEditor'
import ProductFaqEditor from '../_components/ProductFaqEditor'
import { ProductVariantsEditor } from '../_components/ProductVariantsEditor'
import { ProductImagesEditor } from '../_components/ProductImagesEditor'

export const metadata: Metadata = {
  title: 'New Product',
}

export default async function NewProductPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: otherProducts }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('name'),
    supabase
      .from('products')
      .select('id, name, color_group_id, color_name, badge')
      .order('name'),
  ])

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">New Product</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Add a new product to your catalog
        </p>
      </div>
      <ProductForm categories={categories || []} otherProducts={otherProducts || []} />
      
      <div className="relative mt-8">
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-50/50 backdrop-blur-[2px] rounded-xl border border-stone-200">
            <div className="bg-white px-5 py-3 rounded-lg shadow-sm border border-orange-200 text-orange-700 font-medium text-sm flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               Please save the basic product information above first to unlock these sections.
            </div>
         </div>
         
         <div className="space-y-6 opacity-60 pointer-events-none select-none">
            <ProductInfoEditor productId="" initialItems={[]} />
            <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <ProductVariantsEditor productId="" variants={[]} />
            </div>
            <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
              <ProductImagesEditor product={null as any} images={[]} />
            </div>
            <ProductFaqEditor productId="" initialItems={[]} initialUseGlobal={false} />
         </div>
      </div>
    </div>
  )
}
