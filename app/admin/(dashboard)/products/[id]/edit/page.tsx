import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductForm from '../../_components/ProductForm'
import ProductInfoEditor from '../../_components/ProductInfoEditor'
import ProductFaqEditor from '../../_components/ProductFaqEditor'
import { ProductVariantsEditor } from '../../_components/ProductVariantsEditor'
import { ProductImagesEditor } from '../../_components/ProductImagesEditor'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Edit Product',
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [productRes, categoriesRes, otherProductsRes, infoRes, faqRes, variantsRes, imagesRes] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('products')
      .select('id, name, color_group_id, color_name, badge')
      .neq('id', id)
      .order('name'),
    supabase
      .from('product_information')
      .select('*')
      .eq('product_id', id)
      .order('display_order'),
    supabase
      .from('product_faqs')
      .select('*')
      .eq('product_id', id)
      .order('display_order'),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('created_at'),
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order'),
  ])

  if (!productRes.data) {
    notFound()
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <button
          type="submit"
          form="product-form"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          Update Product
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Edit Product</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Update &quot;{productRes.data.name}&quot;
        </p>
      </div>

      <ProductForm
        product={productRes.data}
        categories={categoriesRes.data || []}
        otherProducts={otherProductsRes.data || []}
      />

      {/* Additional Info & FAQs only shown when editing */}
      <ProductInfoEditor
        productId={id}
        initialItems={infoRes.data || []}
      />

      <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <ProductVariantsEditor
          productId={id}
          variants={variantsRes.data || []}
        />
      </div>

      <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <ProductImagesEditor
          product={productRes.data}
          images={imagesRes.data || []}
        />
      </div>

      <ProductFaqEditor
        productId={id}
        initialItems={faqRes.data || []}
        initialUseGlobal={productRes.data.use_global_faqs}
      />

      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <button
          type="submit"
          form="product-form"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          Update Product
        </button>
      </div>
    </div>
  )
}
