'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteOrder } from '@/actions/admin/orders'
import { useRouter } from 'next/navigation'

export function DeleteOrderButton({ orderId, redirectAfter = false }: { orderId: string, redirectAfter?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    const res = await deleteOrder(orderId)
    setIsDeleting(false)

    if (res.success) {
      if (redirectAfter) {
        router.push('/admin/orders')
      }
    } else {
      alert(res.error || 'Failed to delete order')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
      title="Delete Order"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
