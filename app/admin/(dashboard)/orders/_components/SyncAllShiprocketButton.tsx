'use client'

import { useState, useTransition } from 'react'
import { syncAllShiprocketOrders } from '@/actions/admin/orders'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

export function SyncAllShiprocketButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ synced: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSyncAll = () => {
    setError(null)
    setResult(null)
    startTransition(async () => {
      const res = await syncAllShiprocketOrders()

      if (!res.success) {
        setError(res.error || 'Failed to sync orders.')
        return
      }

      setResult({ synced: res.synced || 0, failed: res.failed || 0 })
      setTimeout(() => setResult(null), 6000)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleSyncAll}
        disabled={isPending}
        title="Fetch the latest status from Shiprocket for every order ever pushed there — useful for catching up orders the webhook missed"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-stone-50 transition-colors disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        {isPending ? 'Syncing all orders…' : 'Sync All with Shiprocket'}
      </button>

      {result && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Synced {result.synced} order{result.synced === 1 ? '' : 's'}
          {result.failed > 0 && `, ${result.failed} failed`}.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}
