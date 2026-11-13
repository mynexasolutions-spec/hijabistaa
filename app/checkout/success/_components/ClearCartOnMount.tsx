"use client"

import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

// The cart lives in localStorage; once PayU confirms payment the server has
// already emptied the DB cart, so just clear the browser copy here.
export default function ClearCartOnMount() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
