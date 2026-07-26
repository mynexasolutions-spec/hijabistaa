'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShoppingBag, ArrowRight, Heart } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image_url: string
  category_id: string
  badge?: string
  rating: number
  is_active: boolean
  colorCount?: number
  reviewCount?: number
}

type Category = {
  id: string
  name: string
  parent_id?: string | null
}

type ShopGridProps = {
  initialProducts: Product[]
  categories: Category[]
  selectedCategory: string
}

export default function ShopGrid({ initialProducts, categories, selectedCategory }: ShopGridProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedCategory ? [selectedCategory] : []
  )
  const [maxPrice, setMaxPrice] = useState<number>(15000)
  const [sortOption, setSortOption] = useState<string>('featured')
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const router = useRouter()

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory])
    } else {
      setSelectedCategories([])
    }
  }, [selectedCategory])

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // Filter products by category and price
  let filteredProducts = initialProducts.filter(p => {
    if (p.is_active === false) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category_id)) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sortOption) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      case 'featured':
      default:
        return 0;
    }
  });

  const FilterContent = (
    <div className="space-y-8">
      {/* Category Checkboxes */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-cream-line/60 pb-3">
          <h3 className="font-display font-bold text-xl text-ink">Categories</h3>
          <button
            onClick={() => {
              setSelectedCategories([]);
              setMaxPrice(15000);
              const currentSearch = new URLSearchParams(window.location.search).get('search');
              if (currentSearch) {
                 router.push(`/shop?search=${encodeURIComponent(currentSearch)}`);
              } else {
                 router.push('/shop');
              }
            }}
            className="text-[13px] font-body font-medium text-[#C84B31] hover:text-[#A83D26] hover:underline flex items-center gap-1.5 transition-all"
            title="Reset Categories and Filters"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
        <div className="space-y-3.5">
          {categories.filter(c => !c.parent_id).map((mainCat) => {
            const subCategories = categories.filter(c => c.parent_id === mainCat.id);
            return (
              <div key={mainCat.id} className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={selectedCategories.includes(mainCat.id)}
                    onChange={() => toggleCategory(mainCat.id)}
                  />
                  <div 
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${
                      selectedCategories.includes(mainCat.id) 
                        ? 'bg-emerald border-emerald' 
                        : 'bg-white border-cream-line group-hover:border-emerald'
                    }`}
                  >
                    {selectedCategories.includes(mainCat.id) && (
                      <svg className="w-3.5 h-3.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[15px] font-medium transition-colors ${selectedCategories.includes(mainCat.id) ? 'text-emerald' : 'text-ink/90 group-hover:text-emerald'}`}>
                    {mainCat.name}
                  </span>
                </label>
                
                {/* Subcategories (if any) */}
                {subCategories.length > 0 && (
                  <div className="pl-6 space-y-2.5 mt-2 border-l-2 border-cream-line/40 ml-2.5">
                    {subCategories.map(subCat => (
                      <label key={subCat.id} className="flex items-center gap-2.5 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedCategories.includes(subCat.id)}
                          onChange={() => toggleCategory(subCat.id)}
                        />
                        <div 
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shadow-sm ${
                            selectedCategories.includes(subCat.id) 
                              ? 'bg-emerald border-emerald' 
                              : 'bg-white border-cream-line group-hover:border-emerald'
                          }`}
                        >
                          {selectedCategories.includes(subCat.id) && (
                            <svg className="w-3 h-3 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[14px] transition-colors ${selectedCategories.includes(subCat.id) ? 'text-emerald font-medium' : 'text-ink/75 group-hover:text-emerald'}`}>
                          {subCat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-cream-line/60 pb-3">
          <h3 className="font-display font-bold text-xl text-ink">Max Price</h3>
          <span className="font-bold text-emerald">₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
        <input 
          type="range" 
          min="500" 
          max="15000" 
          step="100" 
          value={maxPrice} 
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full cursor-pointer accent-emerald"
        />
        <div className="flex justify-between text-[11px] text-ink/50 mt-3 font-bold uppercase tracking-wider">
          <span>₹500</span>
          <span>₹15,000</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100000] flex lg:hidden">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative mr-auto w-[85%] max-w-sm h-full bg-white p-6 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-cream-line/60 pb-4">
              <h2 className="font-display font-bold text-2xl text-ink">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-cream rounded-full text-ink/70 hover:text-emerald transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filter (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-[28px] border border-emerald/10 shadow-lg h-fit sticky top-[100px]">
          {FilterContent}
        </div>

        {/* Main Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cream-line/50 gap-3">
            <p className="text-[15px] font-bold text-ink/70">
              Showing <span className="text-emerald">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium text-ink/70 hidden sm:block">Sort by:</label>
                <select 
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-cream-line rounded-lg px-3 py-1.5 text-sm font-medium text-ink focus:outline-none focus:ring-1 focus:ring-emerald shadow-sm cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A-Z</option>
                  <option value="name-z-a">Name: Z-A</option>
                </select>
              </div>
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-4 py-1.5 bg-emerald text-cream rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-ink/50 bg-white rounded-[28px] border border-emerald/10 shadow-lg">
              No products match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((p) => {
              const catName = categories.find(c => c.id === p.category_id)?.name || p.category_id
              return (
                <div key={p.id} className="min-w-0 lift group bg-[#FAF7F2] rounded-xl md:rounded-[20px] p-2 md:p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md border border-cream-line/80 flex flex-col h-full transition-all duration-300">
                  <div className="relative aspect-[4/4.3] rounded-xl bg-cream-deep/20 block shrink-0">
                    <Link href={`/shop/${p.id}`} className="absolute inset-0 block z-0 overflow-hidden rounded-xl">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 320px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </Link>
                    {p.badge && (
                      <span className="absolute top-[5px] right-[2%] z-10 bg-[#6E3416] text-white text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2 py-1 md:px-2.5 rounded-xl shadow-sm pointer-events-none">
                        {p.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (isInWishlist(p.id)) {
                          removeFromWishlist(p.id)
                        } else {
                          addToWishlist({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            oldPrice: p.oldPrice,
                            image_url: p.image_url,
                            category_id: p.category_id,
                            badge: p.badge,
                            rating: p.rating || 5,
                            reviewCount: p.reviewCount ?? 0,
                          })
                        }
                      }}
                      className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-ink/60 hover:text-[#C84B31] hover:bg-white transition-all shadow-sm"
                      aria-label={isInWishlist(p.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(p.id) ? "fill-[#C84B31] text-[#C84B31]" : ""}`} />
                    </button>
                  </div>

                  <div className="flex flex-col flex-1 pt-3 px-0.5">
                    <div className="flex-1">
                      <Link href={`/shop/${p.id}`} className="hover:text-emerald transition-colors block">
                        <h3 className="font-display font-medium text-ink text-[13px] md:text-[15.5px] leading-snug line-clamp-2 min-h-[2.25rem]">
                          {p.name}
                        </h3>
                      </Link>
                      {p.colorCount && p.colorCount > 1 && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald">
                          {p.colorCount} colors available
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-baseline gap-1 md:gap-2">
                      <span className="font-display font-bold text-ink text-[14px] md:text-[16px]">
                        ₹{(Number(p.price) || 1499).toLocaleString('en-IN')}
                      </span>
                      {p.oldPrice && (
                        <span className="text-ink/40 text-[11.5px] md:text-[13px] line-through font-normal">
                          ₹{(Number(p.oldPrice) || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1 md:gap-1.5">
                      <div className="flex items-center text-[#B8622A] text-[11px] md:text-[13px] tracking-tight gap-0.5">
                        {"★".repeat(5)}
                      </div>
                      <span className="text-ink/55 text-[11px] md:text-[12px] font-medium">
                        ({p.reviewCount ?? 0})
                      </span>
                    </div>

                    <div className="mt-auto pt-3.5 grid grid-cols-1 gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image_url: p.image_url,
                            category_name: catName
                          });
                        }}
                        className="w-full h-9 md:h-10 text-center rounded-lg border border-[#DECDBE] bg-white text-[#5C3317] text-[12px] md:text-sm font-semibold hover:bg-[#F9F6F0] hover:border-[#D0BCAC] transition-all flex items-center justify-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-1"
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#5C3317]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="truncate">Add to cart</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image_url: p.image_url,
                            category_name: catName
                          });
                          router.push('/checkout');
                        }}
                        className="w-full h-9 md:h-10 text-center rounded-lg bg-[#6E3416] text-white text-[12px] md:text-sm font-semibold hover:bg-[#5A2910] transition-all flex items-center justify-center shadow-sm px-1"
                      >
                        <span className="truncate">Buy now</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
