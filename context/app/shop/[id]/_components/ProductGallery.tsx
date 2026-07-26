'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

type ProductGalleryProps = {
  images: string[]
  productName: string
  badge?: string
  colorName?: string
  activeIndex?: number
  onSelectImage?: (index: number) => void
}

export default function ProductGallery({
  images,
  productName,
  badge,
  colorName,
  activeIndex: controlledIndex,
  onSelectImage
}: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transformOrigin: 'center',
    transform: 'scale(1)'
  })
  const [isZooming, setIsZooming] = useState(false)
  const [isFading, setIsFading] = useState(false)

  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex
  const displayImages = images.length > 0 ? images : ['/image.png']

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const visibleCount = isMobile ? 4 : 5

  // Auto scroll window if activeIndex moves outside [startIndex, startIndex + visibleCount - 1]
  useEffect(() => {
    setIsFading(true)
    const t = setTimeout(() => setIsFading(false), 180)

    if (activeIndex < startIndex) {
      setStartIndex(activeIndex)
    } else if (activeIndex >= startIndex + visibleCount) {
      setStartIndex(Math.max(0, Math.min(displayImages.length - visibleCount, activeIndex - visibleCount + 1)))
    }

    return () => clearTimeout(t)
  }, [activeIndex, images, displayImages.length, startIndex, visibleCount])

  const handleThumbnailClick = (index: number) => {
    if (index === activeIndex) return
    setIsFading(true)
    if (onSelectImage) {
      onSelectImage(index)
    } else {
      setInternalIndex(index)
    }
  }

  const handlePrev = () => {
    if (startIndex > 0) {
      const nextStart = startIndex - 1
      setStartIndex(nextStart)
      handleThumbnailClick(nextStart)
    }
  }

  const handleNext = () => {
    if (startIndex < displayImages.length - visibleCount) {
      const nextStart = startIndex + 1
      setStartIndex(nextStart)
      handleThumbnailClick(nextStart + visibleCount - 1)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return

    setIsZooming(true)
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    })
  }

  const handleMouseLeave = () => {
    setIsZooming(false)
    setZoomStyle({
      transformOrigin: 'center',
      transform: 'scale(1)'
    })
  }

  const currentImage = displayImages[activeIndex] || displayImages[0] || '/image.png'
  const visibleImages = displayImages.slice(startIndex, startIndex + visibleCount)
  const canScrollPrev = startIndex > 0
  const canScrollNext = startIndex < displayImages.length - visibleCount

  return (
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* Thumbnails Column (Left on desktop with 5 visible, Bottom on mobile with 4 visible) */}
      {displayImages.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col items-center gap-2 md:w-[90px] shrink-0">
          
          {/* Top Button (Desktop) / Left Button (Mobile) */}
          {displayImages.length > visibleCount && (
            <>
              {/* Desktop Top Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canScrollPrev}
                aria-label="Previous thumbnails"
                className="hidden md:flex w-full h-8 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald hover:border-emerald/40 items-center justify-center shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Mobile Left Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canScrollPrev}
                aria-label="Previous thumbnails"
                className="flex md:hidden w-7 h-[76px] shrink-0 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-emerald items-center justify-center shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed self-center"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Visible Thumbnails Container */}
          <div className="flex md:flex-col gap-2.5 overflow-hidden">
            {visibleImages.map((img, idx) => {
              const actualIndex = startIndex + idx
              const isSelected = activeIndex === actualIndex

              return (
                <button
                  key={`${img}-${actualIndex}`}
                  type="button"
                  onClick={() => handleThumbnailClick(actualIndex)}
                  className={`relative w-[60px] h-[76px] md:w-[90px] md:h-[110px] shrink-0 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-emerald shadow-md scale-[1.02] ring-2 ring-emerald/20 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${productName} thumbnail ${actualIndex + 1}`}
                    fill
                    sizes="90px"
                    className="object-cover"
                  />
                </button>
              )
            })}
          </div>

          {/* Bottom Button (Desktop) / Right Button (Mobile) */}
          {displayImages.length > visibleCount && (
            <>
              {/* Desktop Bottom Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canScrollNext}
                aria-label="Next thumbnails"
                className="hidden md:flex w-full h-8 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald hover:border-emerald/40 items-center justify-center shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Mobile Right Button */}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canScrollNext}
                aria-label="Next thumbnails"
                className="flex md:hidden w-7 h-[76px] shrink-0 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-emerald items-center justify-center shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed self-center"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

        </div>
      )}

      {/* Main Featured Image */}
      <div 
        className="order-1 md:order-2 relative w-full aspect-[16/19] rounded-[32px] overflow-hidden shadow-soft border border-gold/15 bg-cream-deep cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          key={currentImage}
          src={currentImage}
          alt={`${productName} - ${colorName ? colorName + ' - ' : ''}Image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          style={zoomStyle}
          className={`object-cover transition-all ease-out duration-300 ${isFading ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'} ${isZooming ? 'duration-100' : 'duration-300'}`}
          priority
        />
        {badge && (
          <span className="absolute top-4 left-4 bg-emerald text-cream text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full shadow-sm pointer-events-none z-10">
            {badge}
          </span>
        )}
        {colorName && (
          <span className="absolute bottom-4 left-4 bg-ink/80 backdrop-blur-md text-cream text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm pointer-events-none z-10">
            {colorName}
          </span>
        )}
      </div>

    </div>
  )
}
