'use client'

import React, { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import { ShoppingBag, CreditCard, Plus, Minus, Heart, Check } from 'lucide-react'

export type ProductVariant = {
  id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
}

export type ProductColorVariant = {
  id: string
  color_name: string
  color_hex?: string | null
  images: string[]
  stock_quantity?: number | null
}

type ProductItem = {
  id: string
  name: string
  image_url: string
  category_name?: string
  price?: number
  oldPrice?: number | null
  original_price?: number | null
  size?: string | null
  variants?: ProductVariant[]
  colorVariants?: ProductColorVariant[]
}

interface ProductDetailActionsProps {
  product: ProductItem
  selectedColors?: ProductColorVariant[]
  onSelectColor?: (color: ProductColorVariant) => void
}

export default function ProductDetailActions({
  product,
  selectedColors = [],
  onSelectColor,
}: ProductDetailActionsProps) {
  const { addToCart, updateQuantity, cart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)

  const colorVariants = product.colorVariants || []

  // Parse multiple sizes from product.size (comma-separated) AND product.variants
  const availableSizes = React.useMemo(() => {
    const list: string[] = []
    if (product.size) {
      const parts = product.size
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== '180 × 2m' && s !== '180 * 2 m')
      parts.forEach(p => {
        if (!list.includes(p)) list.push(p)
      })
    }
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const vName = v.variant_name?.trim()
        if (vName && !list.includes(vName)) {
          list.push(vName)
        }
      })
    }
    return list
  }, [product.size, product.variants])

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || '')

  React.useEffect(() => {
    if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes])

  // If a single item is in cart (when no colors or 1 color), we could sync quantity.
  // For multiple colors, we'll just default to 1 and let them add more.
  const isSingleSelection = selectedColors.length <= 1;
  const singleCartItemId = `${product.id}-${selectedColors[0]?.color_name || 'default'}-${selectedSize || 'default'}`;
  const cartItem = isSingleSelection ? cart.find(item => item.cartItemId === singleCartItemId) : null;
  const currentQty = cartItem ? cartItem.quantity : 0;

  React.useEffect(() => {
    if (currentQty > 0 && isSingleSelection) {
      setQuantity(currentQty)
    } else {
      setQuantity(1)
    }
  }, [currentQty, isSingleSelection])

  // Precise price and MRP calculation (checking selected size variant)
  const selectedVariant = React.useMemo(() => {
    if (!selectedSize || !product.variants || product.variants.length === 0) return null
    return product.variants.find(v => v.variant_name?.toLowerCase() === selectedSize.toLowerCase()) || null
  }, [selectedSize, product.variants])

  const basePrice = product.price != null && Number(product.price) > 0 ? Number(product.price) : 0
  const baseOldPrice = product.oldPrice != null && Number(product.oldPrice) > 0 
    ? Number(product.oldPrice) 
    : (product.original_price != null && Number(product.original_price) > 0 ? Number(product.original_price) : null)

  const currentPrice = selectedVariant?.price != null && Number(selectedVariant.price) > 0
    ? Number(selectedVariant.price)
    : basePrice

  const currentOldPrice = selectedVariant?.original_price != null && Number(selectedVariant.original_price) > 0
    ? Number(selectedVariant.original_price)
    : baseOldPrice

  const handleAdd = () => {
    if (colorVariants.length > 0 && selectedColors.length === 0) {
      showToast("Please select at least one color.", "error")
      return
    }

    if (colorVariants.length > 0) {
      // Loop through each selected color and add to cart
      selectedColors.forEach(color => {
        const specificCartItemId = `${product.id}-${color.color_name}-${selectedSize || 'default'}`
        const specificCartItem = cart.find(item => item.cartItemId === specificCartItemId)
        
        if (specificCartItem && selectedColors.length === 1) {
          updateQuantity(specificCartItemId, quantity)
        } else {
          for (let i = 0; i < quantity; i++) {
            addToCart({
              id: product.id,
              name: product.name,
              price: currentPrice,
              image_url: product.image_url,
              category_name: product.category_name,
              color_name: color.color_name,
              variant_name: selectedSize || product.size || undefined
            })
          }
        }
      })
      const colorNames = selectedColors.map(c => c.color_name).join(', ')
      if (selectedColors.length === 1 && currentQty > 0) {
        showToast(`Cart updated to ${quantity} × ${product.name}!`, "success")
      } else {
        showToast(`${quantity} × ${product.name} (${colorNames}) ${selectedSize ? `[${selectedSize}]` : ''} added to cart!`, "success")
      }
    } else {
      if (currentQty > 0) {
        updateQuantity(singleCartItemId, quantity)
        showToast(`Cart updated to ${quantity} × ${product.name}!`, "success")
      } else {
        for (let i = 0; i < quantity; i++) {
          addToCart({
            id: product.id,
            name: product.name,
            price: currentPrice,
            image_url: product.image_url,
            category_name: product.category_name,
            color_name: undefined,
            variant_name: selectedSize || product.size || undefined
          })
        }
        showToast(`${quantity} × ${product.name} ${selectedSize ? `[${selectedSize}]` : ''} added to cart!`, "success")
      }
    }
  }

  const handleBuyNow = () => {
    if (currentQty === 0 || selectedColors.length > 1) {
      handleAdd()
    }
    router.push('/checkout')
  }

  // Determine Stock Status
  let isStockKnown = false
  let isInStock = true
  
  if (selectedVariant && selectedVariant.stock_quantity != null) {
    isStockKnown = true
    isInStock = selectedVariant.stock_quantity > 0
  } else if (selectedColors.length > 0 && selectedColors[selectedColors.length - 1].stock_quantity != null) {
    isStockKnown = true
    isInStock = selectedColors[selectedColors.length - 1].stock_quantity! > 0
  } else {
    isStockKnown = true
    isInStock = true
  }

  return (
    <div className="space-y-6">
      
      {/* Dynamic Price Display */}
      <div className="flex items-center justify-between pt-3 border-t border-cream-line/50">
        <div className="flex items-baseline gap-3">
          <span className="font-display font-bold text-3xl text-emerald">
            ₹{Number(currentPrice).toLocaleString('en-IN')}
          </span>
          {currentOldPrice != null && Number(currentOldPrice) > currentPrice && (
            <span className="text-ink/40 text-lg line-through">
              ₹{Number(currentOldPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>
        
        {isStockKnown && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isInStock ? 'bg-emerald/10 text-emerald' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>
        )}
      </div>

      {/* 1. Color Selector (Styled matching screenshot: circular swatches with checkmarks & centered labels below) */}
      {colorVariants.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-cream-line/40">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Select Color(s): <span className="font-medium text-ink/80">{selectedColors.map(c => c.color_name).join(', ')}</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-start gap-4 sm:gap-6 pt-1">
            {colorVariants.map((c) => {
              const isSelected = selectedColors.some(sc => sc.id === c.id || sc.color_name === c.color_name)
              const hexVal = (c.color_hex || '#E6DAC4').toLowerCase()
              const isLightColor = hexVal === '#ffffff' || hexVal === '#fff' || hexVal === 'white' || hexVal === '#f7e7ce' || hexVal === '#e6dac4'

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectColor && onSelectColor(c)}
                  title={c.color_name}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`relative w-11 h-11 rounded-full p-[2.5px] transition-all duration-200 flex items-center justify-center ${
                      isSelected
                        ? 'border-2 border-ink shadow-md scale-105'
                        : 'border border-stone-200 bg-white shadow-sm hover:scale-105 hover:border-stone-300'
                    }`}
                  >
                    <span
                      className="w-full h-full rounded-full border border-black/10 flex items-center justify-center shadow-inner transition-transform"
                      style={{ backgroundColor: c.color_hex || '#E6DAC4' }}
                    >
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isLightColor ? 'text-ink' : 'text-white'}`} />
                      )}
                    </span>
                  </div>
                  <span className={`text-[12px] font-medium mt-1.5 text-center transition-colors ${isSelected ? 'text-ink font-semibold' : 'text-ink/70 group-hover:text-ink'}`}>
                    {c.color_name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Size Selector (Supports multiple sizes entered by admin) */}
      {availableSizes.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-cream-line/40">
          <div className="flex justify-between items-center">
            <span className="text-[13px] uppercase tracking-wider font-bold text-ink/70">
              Select Size
              {selectedSize && (
                <span className="ml-2 font-semibold text-emerald normal-case">
                  ({selectedSize})
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {availableSizes.map((sz) => {
              const isSelected = selectedSize === sz
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[3.5rem] h-10 px-4 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-200 border-2 ${
                    isSelected
                      ? 'border-emerald text-emerald bg-emerald/5 shadow-sm scale-[1.02] ring-2 ring-emerald/20'
                      : 'border-cream-line text-ink/80 hover:border-emerald/40 hover:text-emerald bg-white shadow-xs'
                  }`}
                >
                  {sz}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 pt-4 border-t border-cream-line/50">
        {/* Info text if in cart */}
        {currentQty > 0 && selectedColors.length <= 1 && (
          <div className="flex">
            <span className="text-xs font-semibold text-emerald bg-emerald/5 border border-emerald/10 px-3 py-1.5 rounded-full">
              {currentQty} currently in your cart {selectedColors.length === 1 ? `(${selectedColors[0].color_name})` : ''}
            </span>
          </div>
        )}

        {/* Quantity control */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] uppercase tracking-wider font-bold text-ink/70">Quantity</span>
          <div className="flex items-center border border-cream-line bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1.5 hover:text-emerald text-ink/60 transition-colors rounded-full hover:bg-cream"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-semibold text-ink text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-1.5 hover:text-emerald text-ink/60 transition-colors rounded-full hover:bg-cream"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <button
            onClick={handleAdd}
            disabled={colorVariants.length > 0 && selectedColors.length === 0}
            className="w-full py-3.5 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" /> {currentQty > 0 && selectedColors.length <= 1 ? 'Update Cart' : 'Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={colorVariants.length > 0 && selectedColors.length === 0}
            className="w-full py-3.5 px-4 border-2 border-emerald text-emerald font-body font-semibold rounded-full hover:bg-emerald hover:text-cream transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" /> Buy Now
          </button>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault()
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id)
            } else {
              addToWishlist({
                id: product.id,
                name: product.name,
                price: currentPrice,
                oldPrice: currentOldPrice || undefined,
                image_url: product.image_url,
                category_id: product.category_name,
              })
            }
          }}
          className="w-full py-3 px-4 border border-cream-line bg-[#FAF7F2] text-ink/70 font-body font-medium rounded-full hover:bg-white hover:text-[#C84B31] hover:border-[#C84B31]/30 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-[#C84B31] text-[#C84B31]" : ""}`} /> 
          {isInWishlist(product.id) ? "Saved to Wishlist" : "Save to Wishlist"}
        </button>
      </div>
    </div>
  )
}
