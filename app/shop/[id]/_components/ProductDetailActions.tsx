'use client'

import React, { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'
import { SITE } from '@/lib/data'
import { ShoppingBag, CreditCard, Plus, Minus, Heart } from 'lucide-react'

export type ProductVariant = {
  id: string
  variant_name: string
  price: number
  original_price: number | null
  stock_quantity: number
}

type ProductItem = {
  id: string
  name: string
  image_url: string
  category_name?: string
  price?: number
  oldPrice?: number | null
  original_price?: number | null
  variants: ProductVariant[]
}

export default function ProductDetailActions({ product }: { product: ProductItem }) {
  const { addToCart, updateQuantity, cart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )

  // Find if this exact item+variant is already in cart
  const cartItemId = `${product.id}-${selectedVariant?.id || 'default'}`
  const cartItem = cart.find(item => item.cartItemId === cartItemId)
  const currentQty = cartItem ? cartItem.quantity : 0

  React.useEffect(() => {
    if (currentQty > 0) {
      setQuantity(currentQty)
    } else {
      setQuantity(1)
    }
  }, [currentQty])

  // Precise price and MRP calculation
  const variantPrice = selectedVariant && selectedVariant.price != null && Number(selectedVariant.price) > 0 ? Number(selectedVariant.price) : null
  const variantOldPrice = selectedVariant && selectedVariant.original_price != null && Number(selectedVariant.original_price) > 0 ? Number(selectedVariant.original_price) : null

  const basePrice = product.price != null && Number(product.price) > 0 ? Number(product.price) : 0
  const baseOldPrice = product.oldPrice != null && Number(product.oldPrice) > 0 
    ? Number(product.oldPrice) 
    : (product.original_price != null && Number(product.original_price) > 0 ? Number(product.original_price) : null)

  const currentPrice = variantPrice ?? basePrice
  const currentOldPrice = variantOldPrice ?? baseOldPrice

  const handleAdd = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      showToast("Please select a size/variant first.", "error")
      return
    }

    if (selectedVariant && selectedVariant.stock_quantity < quantity) {
      showToast("Not enough stock available for this variant.", "error")
      return
    }

    if (currentQty > 0) {
      updateQuantity(cartItemId, quantity)
      showToast(`Cart updated to ${quantity} × ${product.name}!`, "success")
    } else {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: currentPrice,
          image_url: product.image_url,
          category_name: product.category_name,
          variant_id: selectedVariant?.id,
          variant_name: selectedVariant?.variant_name
        })
      }
      showToast(`${quantity} × ${product.name} added to cart successfully!`, "success")
    }
  }

  const handleBuyNow = () => {
    if (currentQty === 0) {
      handleAdd()
    }
    router.push('/checkout')
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
      </div>

      {/* Variant Selector */}
      {product.variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[13px] uppercase tracking-wider font-bold text-ink/70">Select Size / Variant</span>
            {selectedVariant && (
              <span className="text-xs font-semibold text-emerald">{selectedVariant.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock_quantity <= 0}
                className={`relative min-w-[3.5rem] h-12 px-4 rounded-xl text-[15px] font-bold flex items-center justify-center transition-all duration-300 border-2 overflow-hidden ${
                  selectedVariant?.id === variant.id
                    ? "border-emerald text-emerald bg-emerald/5 shadow-sm scale-[1.02]"
                    : "border-cream-line text-ink/80 hover:border-emerald/40 hover:bg-emerald/5 hover:text-emerald"
                } ${variant.stock_quantity <= 0 ? "opacity-40 cursor-not-allowed bg-cream-deep text-ink/40 border-cream-line line-through" : ""}`}
              >
                {variant.variant_name}
                {selectedVariant?.id === variant.id && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-emerald rounded-bl-xl" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4 pt-4 border-t border-cream-line/50">
        {/* Info text if in cart */}
        {currentQty > 0 && (
          <div className="flex">
            <span className="text-xs font-semibold text-emerald bg-emerald/5 border border-emerald/10 px-3 py-1.5 rounded-full">
              {currentQty} currently in your cart
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
            disabled={product.variants.length > 0 && !selectedVariant}
            className="w-full py-3.5 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" /> {currentQty > 0 ? 'Update Cart' : 'Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.variants.length > 0 && !selectedVariant}
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
