import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductForm, { ProductSubmitButton } from '../../_components/ProductForm'
import ProductInfoEditor from '../../_components/ProductInfoEditor'
import ProductFaqEditor from '../../_components/ProductFaqEditor'
import { ProductImagesEditor } from '../../_components/ProductImagesEditor'
import ProductColorEditor from '../../_components/ProductColorEditor'
import { ProductDesignsEditor } from '../../_components/ProductDesignsEditor'
import { ArrowLeft, Save, Eye, AlertTriangle } from 'lucide-react'
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

  let initialColors: any[] = []
  try {
    const { data: colorData } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true })

    if (colorData && colorData.length > 0) {
      initialColors = colorData
    }
  } catch (e) {
    console.error('Error fetching product_colors from Supabase:', e)
  }

  // Fallback / merge with lib/db.json
  if (initialColors.length === 0) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf8')
        const json = JSON.parse(fileData)
        if (Array.isArray(json.product_colors)) {
          const localCols = json.product_colors.filter((pc: any) => pc.product_id === id)
          if (localCols.length > 0) {
            initialColors = localCols
          }
        }
      }
    } catch (localErr) {}
  }

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

  // Fallback for product size from db.json if missing in Supabase due to cache
  if (!productRes.data.size) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf8')
        const json = JSON.parse(fileData)
        if (Array.isArray(json.products)) {
          const localProd = json.products.find((p: any) => p.id === id)
          if (localProd && localProd.size) {
            productRes.data.size = localProd.size
          }
        }
      }
    } catch (e) {}
  }

  let allInfo = infoRes.data || []
  
  // db.json fallback for product_information
  if (allInfo.length === 0) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf8')
        const json = JSON.parse(fileData)
        if (Array.isArray(json.product_information)) {
          allInfo = json.product_information.filter((pi: any) => pi.product_id === id)
        }
      }
    } catch (e) {}
  }

  const initialDesigns = allInfo
    .filter((info: any) => info.label === 'Design')
    .map((info: any) => info.value)

  const initialInfoItems = allInfo
    .filter((info: any) => info.label !== 'Design')

  const unmappedColors = initialColors.filter((c: any) => !c.images || c.images.length === 0)

  return (
    <div className="max-w-6xl space-y-6">
      {unmappedColors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Missing Color Image Mappings</h3>
            <p className="text-sm text-amber-700 mt-1">
              The following colors do not have any images mapped to them: <strong>{unmappedColors.map((c: any) => c.color_name).join(', ')}</strong>.
              <br/>Customers selecting these colors will see the default product image.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/shop/${id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-stone-700 text-sm font-semibold rounded-xl border border-stone-200 shadow-2xs hover:bg-stone-50 hover:text-stone-900 transition-all duration-200"
          >
            <Eye className="w-4 h-4 text-stone-500" />
            View Product
          </Link>
          <ProductSubmitButton formId="product-form" isEditing={true} />
        </div>
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

      {/* Color Variants Editor */}
      <ProductColorEditor
        productId={id}
        initialColors={initialColors}
      />

      {/* Designs Editor */}
      <ProductDesignsEditor
        productId={id}
        initialDesigns={initialDesigns}
      />

      {/* Additional Info & FAQs only shown when editing */}
      <ProductInfoEditor
        productId={id}
        initialItems={initialInfoItems}
      />

      <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <ProductImagesEditor
          product={productRes.data}
          images={imagesRes.data || []}
          colors={initialColors}
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
