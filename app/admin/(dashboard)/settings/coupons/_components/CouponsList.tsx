'use client'

import React, { useTransition, useState, useEffect } from 'react'
import { Coupon, deleteCoupon } from '@/actions/admin/coupons'
import { Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'

export default function CouponsList({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setCoupons(initialCoupons)
  }, [initialCoupons])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    startTransition(async () => {
      const res = await deleteCoupon(id)
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id))
      } else {
        alert(res.error || 'Failed to delete coupon')
      }
    })
  }

  if (coupons.length === 0) {
    return (
      <div className="p-8 text-center text-stone-400 text-sm">
        No coupons created yet. Create one on the left to get started.
      </div>
    )
  }

  return (
    <>
    {/* Mobile: one card per coupon (a 6-column table does not fit a phone) */}
    <ul className="md:hidden divide-y divide-stone-100">
      {coupons.map((coupon) => (
        <li key={coupon.id} className="px-4 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="font-bold text-stone-900 text-sm break-all">{coupon.code}</p>
            <p className="text-sm text-stone-700">
              <span className="font-semibold">
                {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
              </span>
              <span className="text-stone-500"> · min ₹{coupon.min_purchase}</span>
            </p>
            {coupon.is_active ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5" /> Inactive
              </span>
            )}
          </div>
          <button
            onClick={() => handleDelete(coupon.id)}
            disabled={pending}
            className="p-2 shrink-0 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
            aria-label="Delete coupon"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>

    {/* Tablet / desktop: original table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase border-b border-stone-100">
            <th className="p-4">Code</th>
            <th className="p-4">Type</th>
            <th className="p-4">Value</th>
            <th className="p-4">Min Purchase</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
              <td className="p-4 font-bold text-stone-900">{coupon.code}</td>
              <td className="p-4 capitalize">{coupon.type}</td>
              <td className="p-4 font-semibold">
                {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
              </td>
              <td className="p-4">₹{coupon.min_purchase}</td>
              <td className="p-4">
                {coupon.is_active ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    <ShieldAlert className="w-3.5 h-3.5" /> Inactive
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => handleDelete(coupon.id)}
                  disabled={pending}
                  className="p-1 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
}
