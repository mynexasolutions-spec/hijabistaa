'use client'

import React, { useState, useMemo } from 'react'
import ProductGallery from './ProductGallery'
import ProductDetailActions, { ProductVariant, ProductColorVariant } from './ProductDetailActions'

interface ProductDetailSectionProps {
  productData: {
    id: string
    name: string
    category_id: string
    badge?: string
    rating?: number
    short_description?: string
    description?: string
    size?: string
    price?: number
    oldPrice?: number
    original_price?: number
  }
  categoryName: string
  displayRating: string
  starCount: number
  reviewCount: number
  images: string[]
  variants: ProductVariant[]
  colorVariants: ProductColorVariant[]
  information: any[]
  faqs: any[]
  reviews: any[]
}

export default function ProductDetailSection({
  productData,
  categoryName,
  displayRating,
  starCount,
  reviewCount,
  images,
  variants,
  colorVariants,
  information,
  faqs,
  reviews,
}: ProductDetailSectionProps) {
  // Compile ALL product images (general product images + images from all color variants)
  const allImages = useMemo(() => {
    const list: string[] = []

    // 1. Add primary product images first
    if (images && images.length > 0) {
      images.forEach(img => {
        if (img && !list.includes(img)) list.push(img)
      })
    }

    // 2. Add all color variant images so all thumbnails are visible
    if (colorVariants && colorVariants.length > 0) {
      colorVariants.forEach(cv => {
        if (cv.images && Array.isArray(cv.images)) {
          cv.images.forEach(img => {
            if (img && !list.includes(img)) list.push(img)
          })
        }
      })
    }

    if (list.length === 0) {
      list.push('/image.png')
    }

    return list
  }, [images, colorVariants])

  // Active Color state (can select multiple, default to first color if present)
  const [selectedColors, setSelectedColors] = useState<ProductColorVariant[]>(
    colorVariants && colorVariants.length > 0 ? [colorVariants[0]] : []
  )

  // Current active main image index in allImages
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // Handle color button click: toggle selected color & jump main image if adding
  const handleSelectColor = (color: ProductColorVariant) => {
    setSelectedColors(prev => {
      const exists = prev.some(c => c.id === color.id)
      if (exists) {
        return prev.filter(c => c.id !== color.id)
      } else {
        return [...prev, color]
      }
    })
    
    // If not already selected, jump to its image
    if (!selectedColors.some(c => c.id === color.id)) {
      if (color && color.images && color.images.length > 0) {
        const targetImg = color.images[0]
        const foundIdx = allImages.indexOf(targetImg)
        if (foundIdx !== -1) {
          setActiveIndex(foundIdx)
        }
      }
    }
  }

  // Handle thumbnail click on the left: set active image & auto-sync color button if matching
  const handleSelectImageIndex = (index: number) => {
    setActiveIndex(index)
    const clickedImg = allImages[index]
    if (clickedImg && colorVariants && colorVariants.length > 0) {
      const matchingColor = colorVariants.find(c => c.images && c.images.includes(clickedImg))
      if (matchingColor) {
        setSelectedColors(prev => {
          if (!prev.some(c => c.id === matchingColor.id)) {
            return [...prev, matchingColor]
          }
          return prev
        })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Left: Product Image Gallery (Displays ALL thumbnails from all colors, with sync) */}
      <ProductGallery
        images={allImages}
        productName={productData.name}
        badge={productData.badge}
        colorName={selectedColors.length === 1 ? selectedColors[0].color_name : (selectedColors.length > 1 ? 'Multiple Selected' : undefined)}
        activeIndex={activeIndex}
        onSelectImage={handleSelectImageIndex}
      />

      {/* Right: Product Details & Purchase Form */}
      <div className="space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-gold font-bold">
            {categoryName}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink mt-2 leading-tight">
            {productData.name}
          </h1>

          {/* Dynamic Real-Time Rating & Review Count */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink/70">
            <div className="flex text-gold text-base tracking-tight gap-0.5">
              {'★'.repeat(starCount)}
            </div>
            <span className="font-bold text-ink">{displayRating} ★</span>
            <span className="text-ink/30">|</span>
            <a href="#reviews" className="text-emerald font-semibold hover:underline transition-colors">
              {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
            </a>
          </div>
        </div>

        {/* Purchase Actions client component (Handles Price, Size, Color Selector below Size, and Add to Cart) */}
        <ProductDetailActions
          product={{
            id: productData.id,
            name: productData.name,
            image_url: allImages[activeIndex] || allImages[0] || "/image.png",
            category_name: categoryName,
            price: productData.price != null ? Number(productData.price) : undefined,
            oldPrice: productData.oldPrice != null ? Number(productData.oldPrice) : (productData.original_price != null ? Number(productData.original_price) : undefined),
            size: productData.size,
            variants: variants,
            colorVariants: colorVariants
          }}
          selectedColors={selectedColors}
          onSelectColor={handleSelectColor}
        />

        {productData.short_description && (
          <div className="font-body text-ink/80 text-lg leading-relaxed pt-2">
            <p>{productData.short_description}</p>
          </div>
        )}

        {/* Information, Description & FAQs */}
        <div className="space-y-4 pt-6 border-t border-cream-line/50">
          {/* Product Specifications */}
          {information.length > 0 && (
            <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors" open>
              <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                Product Specifications
                <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </summary>
              <div className="px-3 md:px-3 lg:px-5 pb-5 pt-2 border-t border-cream-line/50">
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {information.map((info: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-cream-line shadow-sm">
                      <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">{info.label}</p>
                      <p className="text-sm font-semibold text-emerald mt-1">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors">
            <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
              Product Details
              <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-ink/70 text-sm leading-relaxed border-t border-cream-line/50 mx-5 pt-3 whitespace-pre-wrap">
              {productData.description || "Discover the unmatched drape and supreme softness of our collection. Carefully designed with breathable fabric and superior stitching to ensure a comfortable fit and lasting durability throughout the day."}
            </div>
          </details>

          {faqs.length > 0 && (
            <div className="pt-4">
              <h3 className="font-display font-semibold text-xl text-ink mb-4">Common Questions</h3>
              <div className="space-y-3">
                {faqs.map((faq: any, idx: number) => (
                  <details key={idx} className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors">
                    <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                      {faq.question}
                      <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                        <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-ink/70 text-sm leading-relaxed border-t border-cream-line/50 mx-5 pt-3">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
