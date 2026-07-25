'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = {
  error?: string
  success?: boolean
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}



export async function createProduct(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const size = formData.get('size') as string

  const price = parseFloat(formData.get('price') as string) || 0
  const oldPriceStr = formData.get('oldPrice') as string
  const oldPrice = oldPriceStr ? parseFloat(oldPriceStr) : null

  const seoTitle = formData.get('seo_title') as string
  const seoDescription = formData.get('seo_description') as string
  const badge = formData.get('badge') as string
  const isActive = formData.get('is_active') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'

  if (!name) {
    return { error: 'Product name is required' }
  }

  const slug = slugify(name)
  const id = crypto.randomUUID()

  const baseProductData: any = {
    id,
    name,
    slug,
    category_id: categoryId || null,
    short_description: shortDescription || null,
    description: description || null,
    price,
    oldPrice,

    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    badge: badge || null,
    is_active: isActive,
    is_featured: isFeatured,
  }

  let product: any = null
  let error: any = null

  // Try insert with size column first
  const res = await supabase.from('products').insert({
    ...baseProductData,
    size: size || null,
  }).select('id').single()

  if (res.error && (res.error.message?.includes('size') || res.error.code === 'PGRST204')) {
    // Retry without size column if column not present in schema cache yet
    const fallbackRes = await supabase.from('products').insert(baseProductData).select('id').single()
    product = fallbackRes.data
    error = fallbackRes.error
  } else {
    product = res.data
    error = res.error
  }

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  // Sync size to lib/db.json fallback
  if (product && product.id) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf8')
        const json = JSON.parse(fileData)
        if (Array.isArray(json.products)) {
          json.products.push({
            id: product.id,
            name,
            slug,
            price,
            oldPrice,
            size: size || null,
            badge: badge || null,
            is_active: isActive
          })
          fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
        }
      }
    } catch (e) {}
  }

  revalidatePath('/admin/products')
  revalidatePath('/shop')
  redirect(`/admin/products/${product.id}/edit`)
}

export async function updateProduct(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const size = formData.get('size') as string

  const price = parseFloat(formData.get('price') as string) || 0
  const oldPriceStr = formData.get('oldPrice') as string
  const oldPrice = oldPriceStr ? parseFloat(oldPriceStr) : null

  const seoTitle = formData.get('seo_title') as string
  const seoDescription = formData.get('seo_description') as string
  const badge = formData.get('badge') as string
  const isActive = formData.get('is_active') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'

  if (!id || !name) {
    return { error: 'Product ID and name are required' }
  }

  const slug = slugify(name)

  const updatePayload: any = {
    name,
    slug,
    category_id: categoryId || null,
    short_description: shortDescription || null,
    description: description || null,
    price,
    oldPrice,

    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    badge: badge || null,
    is_active: isActive,
    is_featured: isFeatured,
  }

  // DEBUG LOGGING
  try {
    const fs = await import('fs')
    fs.appendFileSync('action-debug.log', `[${new Date().toISOString()}] updateProduct id=${id} size=${size}\n`)
  } catch (e) {}

  let { error } = await supabase
    .from('products')
    .update({ ...updatePayload, size: size || null })
    .eq('id', id)

  if (error && (error.message?.includes('size') || error.code === 'PGRST204')) {
    try {
      const fs = await import('fs')
      fs.appendFileSync('action-debug.log', `[${new Date().toISOString()}] FALLBACK TRIGGERED for id=${id}\n`)
    } catch (e) {}
    // Retry without size column if size column is missing in Supabase schema cache
    const retryRes = await supabase.from('products').update(updatePayload).eq('id', id)
    error = retryRes.error
  }

  // Sync size to lib/db.json fallback
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8')
      const json = JSON.parse(fileData)
      if (!Array.isArray(json.products)) json.products = []
      
      const prodIdx = json.products.findIndex((p: any) => p.id === id)
      if (prodIdx >= 0) {
        json.products[prodIdx] = {
          ...json.products[prodIdx],
          name,
          size: size || null,
          price,
          oldPrice
        }
      } else {
        json.products.push({
          id,
          name,
          slug,
          price,
          oldPrice,
          size: size || null,
          badge: badge || null,
          is_active: isActive
        })
      }
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {}

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/shop/${id}`)
  revalidatePath('/shop')
  redirect('/admin/products')
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true }
}

// ─── Product Information CRUD ────────────────────────────

export async function saveProductInformation(
  productId: string,
  items: { id?: string; label: string; value: string; display_order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  // Delete existing items and re-insert
  const { error: deleteError } = await supabase
    .from('product_information')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      product_id: productId,
      label: item.label,
      value: item.value,
      display_order: index,
    }))

    const { error: insertError } = await supabase
      .from('product_information')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

// ─── Product Image CRUD ────────────────────────────────────

export async function addProductImage(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get max sort_order
  const { data: maxSort } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextSort = maxSort ? maxSort.sort_order + 1 : 0

  const { error } = await supabase.from('product_images').insert({
    product_id: productId,
    image_url: imageUrl,
    sort_order: nextSort,
  })

  if (error) {
    return { error: error.message }
  }

  // If this is the only image, automatically set it as featured
  if (nextSort === 0) {
    await supabase
      .from('products')
      .update({ featured_image_url: imageUrl })
      .eq('id', productId)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Check if this is the featured image before deleting
  const { data: image } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('id', imageId)
    .single()

  const { error } = await supabase.from('product_images').delete().eq('id', imageId)

  if (error) {
    return { error: error.message }
  }

  // If we just deleted the featured image, clear it or set to next available
  if (image) {
    const { data: product } = await supabase
      .from('products')
      .select('featured_image_url')
      .eq('id', productId)
      .single()
      
    if (product?.featured_image_url === image.image_url) {
      // Find another image to feature
      const { data: nextImage } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single()
        
      await supabase
        .from('products')
        .update({ featured_image_url: nextImage ? nextImage.image_url : null })
        .eq('id', productId)
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function setFeaturedImage(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ featured_image_url: imageUrl })
    .eq('id', productId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient()

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('product_images')
      .update({ sort_order: i })
      .eq('id', orderedIds[i])
      .eq('product_id', productId)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

// ─── Product Variant CRUD ────────────────────────────────

export async function createProductVariant(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const productId = formData.get('product_id') as string
  const variantName = formData.get('variant_name') as string
  const price = formData.get('price') as string
  const originalPrice = formData.get('original_price') as string
  const stockQuantity = formData.get('stock_quantity') as string
  const isActive = formData.get('is_active') === 'on'

  if (!productId || !variantName || !price) {
    return { error: 'Product ID, Variant Name, and Price are required' }
  }

  const variantId = crypto.randomUUID()
  const payload: any = {
    id: variantId,
    product_id: productId,
    variant_name: variantName,
    price: parseFloat(price),
    original_price: originalPrice ? parseFloat(originalPrice) : null,
    stock_quantity: parseInt(stockQuantity || '0', 10),
    is_active: isActive,
  }

  let { error } = await supabase.from('product_variants').insert(payload)

  // Retry without is_active if column doesn't exist in Supabase DB schema cache
  if (error && (error.message?.includes('is_active') || error.code === 'PGRST204')) {
    const { is_active, ...fallbackPayload } = payload
    const res = await supabase.from('product_variants').insert(fallbackPayload)
    error = res.error
  }

  // Local db.json sync fallback
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      if (!Array.isArray(json.product_variants)) json.product_variants = []
      json.product_variants.push(payload)
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {}

  if (error) {
    console.error('Error creating product variant in Supabase:', error)
    // If local sync succeeded, we still revalidate
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}

export async function bulkCreateProductVariants(
  productId: string,
  variants: {
    variant_name: string
    price: number
    original_price: number | null
    stock_quantity: number
    is_active: boolean
  }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  if (!productId || variants.length === 0) {
    return { error: 'Invalid data' }
  }

  const rows = variants.map(v => ({
    id: crypto.randomUUID(),
    product_id: productId,
    ...v
  }))

  let { error } = await supabase.from('product_variants').insert(rows)

  if (error && (error.message?.includes('is_active') || error.code === 'PGRST204')) {
    const fallbackRows = rows.map(({ is_active, ...rest }) => rest)
    const res = await supabase.from('product_variants').insert(fallbackRows)
    error = res.error
  }

  // Sync to local db.json
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      if (!Array.isArray(json.product_variants)) json.product_variants = []
      rows.forEach(r => json.product_variants.push(r))
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {}

  if (error) {
    console.error('Error bulk creating product variants in Supabase:', error)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}

export async function updateProductVariant(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const productId = formData.get('product_id') as string
  const variantName = formData.get('variant_name') as string
  const price = formData.get('price') as string
  const originalPrice = formData.get('original_price') as string
  const stockQuantity = formData.get('stock_quantity') as string
  const isActive = formData.get('is_active') === 'on'

  if (!id || !variantName || !price) {
    return { error: 'Variant ID, Name, and Price are required' }
  }

  const payload: any = {
    variant_name: variantName,
    price: parseFloat(price),
    original_price: originalPrice ? parseFloat(originalPrice) : null,
    stock_quantity: parseInt(stockQuantity || '0', 10),
    is_active: isActive,
  }

  let { error } = await supabase
    .from('product_variants')
    .update(payload)
    .eq('id', id)

  if (error && (error.message?.includes('is_active') || error.code === 'PGRST204')) {
    const { is_active, ...fallbackPayload } = payload
    const res = await supabase.from('product_variants').update(fallbackPayload).eq('id', id)
    error = res.error
  }

  // Local db.json sync
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      if (Array.isArray(json.product_variants)) {
        const idx = json.product_variants.findIndex((v: any) => v.id === id)
        if (idx !== -1) {
          json.product_variants[idx] = { ...json.product_variants[idx], ...payload }
        }
      }
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {}

  if (error) {
    console.error('Error updating product variant in Supabase:', error)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}

export async function deleteProductVariant(
  id: string,
  productId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('product_variants').delete().eq('id', id)

  // Local db.json sync
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      if (Array.isArray(json.product_variants)) {
        json.product_variants = json.product_variants.filter((v: any) => v.id !== id)
      }
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {}

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}


export async function saveProductFaqs(
  productId: string,
  items: { id?: string; question: string; answer: string; display_order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  // Delete existing FAQs and re-insert
  const { error: deleteError } = await supabase
    .from('product_faqs')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      product_id: productId,
      question: item.question,
      answer: item.answer,
      display_order: index,
    }))

    const { error: insertError } = await supabase
      .from('product_faqs')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

// ─── Product Color Variant CRUD ─────────────────────────────

export async function saveProductColors(
  productId: string,
  colors: {
    id?: string
    color_name: string
    color_hex?: string | null
    images: string[]
    stock_quantity?: number
    display_order?: number
  }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. Attempt to delete existing colors in Supabase
  try {
    await supabase.from('product_colors').delete().eq('product_id', productId)
    if (colors.length > 0) {
      const rows = colors.map((c, index) => ({
        product_id: productId,
        color_name: c.color_name,
        color_hex: c.color_hex || null,
        images: c.images || [],
        stock_quantity: c.stock_quantity ?? 0,
        display_order: c.display_order ?? index,
      }))
      await supabase.from('product_colors').insert(rows)
    }
  } catch (e) {
    console.error('Supabase product_colors sync error:', e)
  }

  // 2. Also persist in lib/db.json for offline / local fallback
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8')
      const json = JSON.parse(fileData)

      if (!json.product_colors) {
        json.product_colors = []
      }

      // Filter out previous colors for this product
      const otherColors = json.product_colors.filter(
        (pc: any) => pc.product_id !== productId
      )
      const newColors = colors.map((c, index) => ({
        id: c.id || `col-${productId}-${index}-${Date.now()}`,
        product_id: productId,
        color_name: c.color_name,
        color_hex: c.color_hex || null,
        images: c.images || [],
        stock_quantity: c.stock_quantity ?? 0,
        display_order: c.display_order ?? index,
        created_at: new Date().toISOString(),
      }))

      json.product_colors = [...otherColors, ...newColors]
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {
    console.error('Local db.json product_colors save error:', e)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}

export async function toggleImageColorMapping(
  productId: string,
  colorId: string,
  imageUrl: string,
  isMapped: boolean
): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. Fetch current color data
  const { data: colorData, error: fetchError } = await supabase
    .from('product_colors')
    .select('images')
    .eq('id', colorId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { error: fetchError.message }
  }

  let currentImages = colorData?.images || []
  if (isMapped) {
    if (!currentImages.includes(imageUrl)) {
      currentImages.push(imageUrl)
    }
  } else {
    currentImages = currentImages.filter((img: string) => img !== imageUrl)
  }

  // 2. Update Supabase
  const { error: updateError } = await supabase
    .from('product_colors')
    .update({ images: currentImages })
    .eq('id', colorId)

  if (updateError) {
    return { error: updateError.message }
  }

  // 3. Update local db.json fallback
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8')
      const json = JSON.parse(fileData)
      if (Array.isArray(json.product_colors)) {
        const colorIdx = json.product_colors.findIndex((c: any) => c.id === colorId)
        if (colorIdx >= 0) {
          json.product_colors[colorIdx].images = currentImages
          fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
        }
      }
    }
  } catch (e) {
    console.error('Error updating db.json in toggleImageColorMapping', e)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}

export async function saveProductDesigns(
  productId: string,
  designs: string[]
): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. We will use the product_information table with a specific label 'Design' to store these
  // This avoids schema changes while keeping it in Supabase natively.
  try {
    // Delete existing designs
    await supabase
      .from('product_information')
      .delete()
      .eq('product_id', productId)
      .eq('label', 'Design')

    if (designs.length > 0) {
      const rows = designs.map((d, index) => ({
        product_id: productId,
        label: 'Design',
        value: d,
        display_order: 100 + index // Keep them grouped at the end
      }))
      const { error } = await supabase.from('product_information').insert(rows)
      if (error) {
        return { error: error.message }
      }
    }
  } catch (e: any) {
    return { error: e.message }
  }

  // 2. Also update db.json fallback
  try {
    const fs = await import('fs')
    const path = await import('path')
    const dbPath = path.join(process.cwd(), 'lib', 'db.json')
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, 'utf8')
      const json = JSON.parse(fileData)

      if (!json.product_information) {
        json.product_information = []
      }

      const otherInfo = json.product_information.filter(
        (info: any) => !(info.product_id === productId && info.label === 'Design')
      )
      
      const newInfo = designs.map((d, index) => ({
        id: `design-${productId}-${index}-${Date.now()}`,
        product_id: productId,
        label: 'Design',
        value: d,
        display_order: 100 + index
      }))

      json.product_information = [...otherInfo, ...newInfo]
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), 'utf8')
    }
  } catch (e) {
    console.error('Error updating db.json in saveProductDesigns', e)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath(`/shop/${productId}`)
  return { success: true }
}
