'use client'

import { useTransition, useState } from 'react'
import { updateShippingSettings } from '@/actions/admin/shipping'
import { Truck, CircleDollarSign, CheckCircle, Plus, Trash2, Layers } from 'lucide-react'

type TierRow = {
  min_qty: string
  max_qty: string
  charge: string
}

function toTierRows(tiers: any): TierRow[] {
  if (!Array.isArray(tiers) || tiers.length === 0) return []
  return tiers.map((t: any) => ({
    min_qty: t?.min_qty != null ? String(t.min_qty) : '',
    max_qty: t?.max_qty != null ? String(t.max_qty) : '',
    charge: t?.charge != null ? String(t.charge) : '',
  }))
}

export default function ShippingForm({ initialShipping }: { initialShipping: any }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [tiers, setTiers] = useState<TierRow[]>(toTierRows(initialShipping?.tiers))

  const addTier = () => {
    setTiers(prev => {
      // Suggest a sensible next min_qty based on the previous row's max_qty.
      const last = prev[prev.length - 1]
      const nextMin = last && last.max_qty ? String(Number(last.max_qty) + 1) : ''
      return [...prev, { min_qty: nextMin, max_qty: '', charge: '' }]
    })
  }

  const removeTier = (index: number) => {
    setTiers(prev => prev.filter((_, i) => i !== index))
  }

  const updateTier = (index: number, field: keyof TierRow, value: string) => {
    setTiers(prev => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const flatRate = parseFloat(formData.get('flatRate') as string)
    const freeThreshold = parseFloat(formData.get('freeThreshold') as string)
    const codCharge = parseFloat(formData.get('codCharge') as string)
    const onlineDiscount = parseFloat(formData.get('onlineDiscount') as string)

    if (isNaN(flatRate) || isNaN(freeThreshold) || isNaN(codCharge) || isNaN(onlineDiscount)) {
      setMessage({ type: 'error', text: 'Please enter valid numbers.' })
      return
    }

    // Validate tier rows: every row needs a min qty and a charge. Max qty is optional
    // (blank = "and above"). Reject partially-filled rows rather than silently dropping them.
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i]
      if (t.min_qty.trim() === '' || t.charge.trim() === '') {
        setMessage({ type: 'error', text: `Range #${i + 1}: please enter both a minimum quantity and a charge (or remove the row).` })
        return
      }
      if (isNaN(Number(t.min_qty)) || Number(t.min_qty) < 1) {
        setMessage({ type: 'error', text: `Range #${i + 1}: minimum quantity must be a number of 1 or more.` })
        return
      }
      if (t.max_qty.trim() !== '' && (isNaN(Number(t.max_qty)) || Number(t.max_qty) < Number(t.min_qty))) {
        setMessage({ type: 'error', text: `Range #${i + 1}: maximum quantity must be a number that is not less than the minimum.` })
        return
      }
      if (isNaN(Number(t.charge)) || Number(t.charge) < 0) {
        setMessage({ type: 'error', text: `Range #${i + 1}: charge must be a valid non-negative number.` })
        return
      }
    }

    const cleanTiers = tiers
      .map(t => ({
        min_qty: Math.floor(Number(t.min_qty)),
        max_qty: t.max_qty.trim() === '' ? null : Math.floor(Number(t.max_qty)),
        charge: Number(t.charge),
      }))
      .sort((a, b) => a.min_qty - b.min_qty)

    startTransition(async () => {
      const res = await updateShippingSettings(flatRate, freeThreshold, codCharge, onlineDiscount, cleanTiers)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Shipping & Payment charges updated successfully!' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-[#B46A5F]/10 border border-[#B46A5F]/30 text-[#B46A5F]'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Default Shipping Rate (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="flatRate"
            defaultValue={initialShipping.flat_rate ?? 99}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Used when a cart's item count doesn't fall inside any range below, or if no ranges are set up.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Free Shipping Threshold (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="freeThreshold"
            defaultValue={initialShipping.free_threshold ?? 1999}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Orders with a subtotal at or above this amount always ship free, regardless of the ranges below. Set to 0 to disable.
        </p>
      </div>

      <div className="border-t border-stone-200 pt-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
            <Layers className="w-4 h-4 text-stone-400" />
            Charges by Number of Items
          </label>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          Charge a different shipping fee depending on how many items are in the cart (total quantity across all products). These only apply when the order doesn't already qualify for free shipping above.
        </p>

        <div className="space-y-2">
          {tiers.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Min Qty</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Max Qty</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Charge (₹)</span>
              <span />
            </div>
          )}

          {tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
              <input
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={tier.min_qty}
                onChange={e => updateTier(index, 'min_qty', e.target.value)}
                className="w-full px-2 sm:px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
              />
              <input
                type="number"
                min="1"
                placeholder="No limit"
                value={tier.max_qty}
                onChange={e => updateTier(index, 'max_qty', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
              />
              <input
                type="number"
                min="0"
                placeholder="e.g. 49"
                value={tier.charge}
                onChange={e => updateTier(index, 'charge', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
              />
              <button
                type="button"
                onClick={() => removeTier(index)}
                aria-label={`Remove range ${index + 1}`}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTier}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Range
        </button>

        {tiers.length > 0 && (
          <p className="mt-3 text-xs text-stone-400">
            Leave Max Qty blank on a row to mean "and above". Ranges are matched by a cart's total item quantity -- e.g. Min 1 / Max 2 / ₹99, Min 3 / Max 5 / ₹49, Min 6 / (blank) / ₹0.
          </p>
        )}
      </div>

      <div className="border-t border-stone-200 pt-5">
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Cash on Delivery (COD) Charge (₹)
        </label>
        <div className="relative">
          <input
            type="number"
            name="codCharge"
            defaultValue={initialShipping.cod_charge ?? 50}
            required
            min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Online Payment Discount (%)
        </label>
        <div className="relative">
          <input
            type="number"
            name="onlineDiscount"
            defaultValue={initialShipping.online_discount ?? 0}
            required
            min="0"
            max="100"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 transition-all"
          />
          <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-700/20 hover:shadow-lg hover:from-teal-800 hover:to-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {pending ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4.5 h-4.5" />
            Save Shipping Charges
          </>
        )}
      </button>
    </form>
  )
}
