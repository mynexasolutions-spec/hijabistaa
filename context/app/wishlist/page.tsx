'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { Trash2, ShoppingBag, Heart, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      category_name: item.category_id,
    })
    showToast(`"${item.name}" added to cart!`, 'success')
  }

  const handleRemove = (id: string, name: string) => {
    removeFromWishlist(id)
    showToast(`Removed "${name}" from wishlist`, 'info')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-32 pb-20 md:pt-44 lg:pt-48 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">
          
          {/* Header & Title Bar */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 md:mb-10 pb-6 border-b border-cream-line/80">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="eyebrow inline-flex items-center gap-2 mb-2">
                <span className="h-px w-6 md:w-8 bg-gold/70" /> 
                Saved Collection
                <span className="h-px w-6 md:w-8 bg-gold/70" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
                <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight">
                  My Wishlist
                </h1>
                {wishlist.length > 0 && (
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider bg-emerald/10 text-emerald border border-emerald/20 px-3 py-1 rounded-full shadow-sm mt-1 sm:mt-0">
                    {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
                  </span>
                )}
              </div>
              <p className="text-[14px] text-ink/70 mt-2 max-w-md mx-auto md:mx-0 leading-relaxed">
                Save your favorites and add them to your bag anytime.
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire wishlist?')) {
                    clearWishlist()
                    showToast('Wishlist cleared', 'info')
                  }
                }}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-cream-line bg-white/60 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-ink/60 text-[13px] font-bold transition-all shadow-sm md:self-end mt-2 md:mt-0"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Clear Wishlist
              </button>
            )}
          </div>

          {/* EMPTY WISHLIST STATE */}
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-line/80 shadow-card p-10 md:p-16 text-center max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-cream-deep/30 border border-gold/30 flex items-center justify-center mx-auto text-gold">
                <Heart className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-semibold text-2xl text-ink">
                  Your Wishlist is Empty
                </h2>
                <p className="text-sm text-ink/65 max-w-md mx-auto leading-relaxed">
                  You haven't saved any items yet. Explore our latest modest collection and click the heart icon on any product to save it here.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-emerald hover:bg-emerald-deep text-cream font-body font-semibold text-sm tracking-wide shadow-md transition-all group"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            /* WISHLIST GRID */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {wishlist.map((item) => {
                const discountPercent =
                  item.oldPrice && item.oldPrice > item.price
                    ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
                    : null

                return (
                  <div
                    key={item.id}
                    className="min-w-0 lift group bg-[#FAF7F2] rounded-xl md:rounded-[22px] p-2.5 md:p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md border border-cream-line/80 flex flex-col h-full transition-all duration-300 relative"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-xl md:rounded-2xl bg-cream-deep/20 block shrink-0 overflow-hidden">
                      <Link href={`/shop/${item.id}`} className="absolute inset-0 block z-0 overflow-hidden flex items-center justify-center">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 320px"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </Link>

                      {/* Top Badges */}
                      <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
                        {item.badge && (
                          <span className="bg-[#6E3416] text-white text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}
                        {discountPercent && (
                          <span className="bg-emerald text-cream text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemove(item.id, item.name)
                        }}
                        className="absolute top-2 left-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-ink/60 hover:text-red-500 hover:bg-white transition-all shadow-sm group/btn"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col flex-1 pt-3.5 px-0.5">
                      {/* Title */}
                      <div className="flex-1">
                        <Link href={`/shop/${item.id}`} className="hover:text-emerald transition-colors block">
                          <h3 className="font-display font-semibold text-ink text-[13px] md:text-[15.5px] leading-snug line-clamp-2 min-h-[2.25rem]">
                            {item.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Rating Stars */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex items-center text-[#B8622A] text-[11px] md:text-[13px] tracking-tight gap-0.5">
                          {'★'.repeat(Math.round(item.rating || 5))}
                        </div>
                        <span className="text-ink/80 text-[11px] md:text-[12px] font-semibold">
                          {item.rating || 5} ★
                        </span>
                        <span className="text-ink/40 text-[10px] md:text-[11px] font-medium">
                          ({item.reviewCount ?? 0})
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="font-display font-bold text-emerald text-[15px] md:text-[17px]">
                          ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                        </span>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <span className="text-ink/40 text-[11.5px] md:text-[13px] line-through font-normal">
                            ₹{(Number(item.oldPrice) || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* In Stock Badge */}
                      <div className="mt-2 flex items-center gap-1 text-[10px] md:text-[11px] font-semibold text-green-700">
                        <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                        In Stock & Ready to Ship
                      </div>

                      {/* Add to Cart Button */}
                      <div className="mt-4 pt-2 border-t border-cream-line/60">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(item)
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald hover:bg-emerald-deep text-cream font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
