'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type WishlistItem = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image_url: string
  category_id?: string
  badge?: string
  rating?: number
  reviewCount?: number
}

type WishlistContextType = {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('hijabistaa-wishlist')
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist))
        } catch (e) {
          console.error('Failed to load wishlist', e)
        }
      }
    }
  }, [])

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hijabistaa-wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist])

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) return prev
      return [...prev, item]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id))
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  const isInWishlist = (id: string) => {
    return wishlist.some((i) => i.id === id)
  }

  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
