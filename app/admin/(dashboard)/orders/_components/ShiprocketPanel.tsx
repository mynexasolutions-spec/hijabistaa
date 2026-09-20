'use client'

import { useState, useTransition, useEffect } from 'react'
import { createShiprocketShipment, syncShiprocketStatus } from '@/actions/admin/orders'
import { SHIPROCKET_NEW_ORDERS_URL } from '@/lib/shiprocket-constants'
import { Truck, Loader2, ExternalLink, CheckCircle2, RefreshCw, MapPin } from 'lucide-react'

type ScanEvent = {
  date: string | null
  status: string | null
  activity: string | null
  location: string | null
}

export function ShiprocketPanel({
  orderId,
  initialShiprocketOrderId,
  initialAwbCode,
  initialCourierName,
  initialShiprocketStatus,
}: {
  orderId: string
  initialShiprocketOrderId: string | null
  initialAwbCode: string | null
  initialCourierName: string | null
  initialShiprocketStatus: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [isSyncing, startSyncTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [weightKg, setWeightKg] = useState('')
  const [shiprocketOrderId, setShiprocketOrderId] = useState(initialShiprocketOrderId)
  const [awbCode, setAwbCode] = useState(initialAwbCode)
  const [courierName, setCourierName] = useState(initialCourierName)
  const [status, setStatus] = useState(initialShiprocketStatus)
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [scans, setScans] = useState<ScanEvent[]>([])

  const handleCreateShipment = () => {
    setError(null)
    startTransition(async () => {
      const parsedWeight = weightKg.trim() ? parseFloat(weightKg) : undefined
      if (weightKg.trim() && (!parsedWeight || parsedWeight <= 0)) {
        setError('Enter a valid weight in kg (e.g. 0.3), or leave it blank to auto-estimate.')
        return
      }

      const result = await createShiprocketShipment(orderId, parsedWeight)

      if (!result?.success) {
        setError(result?.error || 'Failed to create Shiprocket shipment.')
        return
      }

      if (result.shiprocketOrderId) setShiprocketOrderId(result.shiprocketOrderId)
    })
  }

  // Pull-based sync — for orders whose webhook update never arrived (placed
  // before the webhook fix, or before it was registered on Shiprocket).
  // `silent` is used for the auto-sync-on-open below: it still updates the
  // panel, just without flashing an error banner if Shiprocket happens to
  // be slow/unreachable at that exact moment — a manual click always shows
  // a clear success/error result.
  const handleSyncStatus = (silent = false) => {
    if (!silent) {
      setError(null)
      setSyncMessage(null)
    }
    startSyncTransition(async () => {
      const result = await syncShiprocketStatus(orderId)

      if (!result.success) {
        if (!silent) setError(result.error || 'Failed to sync status from Shiprocket.')
        return
      }

      if (result.shiprocketStatus) setStatus(result.shiprocketStatus)
      if (result.awbCode) setAwbCode(result.awbCode)
      if (result.courierName) setCourierName(result.courierName)
      setCurrentLocation(result.currentLocation || null)
      setScans(result.scans || [])
      if (!silent) setSyncMessage('Status synced from Shiprocket.')
    })
  }

  // Auto-sync once when this order's page is opened, so the panel reflects
  // Shiprocket's live status without the admin needing to click refresh.
  useEffect(() => {
    if (initialShiprocketOrderId) {
      handleSyncStatus(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-stone-400" />
          Shipping (Shiprocket)
        </h3>
        <div className="flex items-center gap-2">
          {shiprocketOrderId && (
            <button
              onClick={() => handleSyncStatus()}
              disabled={isSyncing}
              title="Fetch the latest status directly from Shiprocket"
              className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {isPending && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {syncMessage && (
        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">
          {syncMessage}
        </div>
      )}

      {!shiprocketOrderId ? (
        <>
          <p className="text-sm text-stone-500">
            Pushes this order to Shiprocket. You&apos;ll then assign a courier and confirm pickup yourself from the Shiprocket dashboard.
          </p>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Order Weight (kg) — optional
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Leave blank to auto-estimate"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              disabled={isPending}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-50"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              The actual packed parcel weight gives more accurate courier rates than the auto-estimate.
            </p>
          </div>
          <button
            onClick={handleCreateShipment}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Ship via Shiprocket
          </button>
        </>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Order sent to Shiprocket</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shiprocket Order ID</span>
            <span className="font-mono text-stone-900">{shiprocketOrderId}</span>
          </div>

          {awbCode ? (
            <>
              <div className="flex justify-between text-stone-600">
                <span>AWB Code</span>
                <span className="font-mono text-stone-900">{awbCode}</span>
              </div>
              {courierName && (
                <div className="flex justify-between text-stone-600">
                  <span>Courier</span>
                  <span className="font-medium text-stone-900">{courierName}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between items-center text-stone-600">
                  <span>Live Status</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold capitalize">
                    {status}
                  </span>
                </div>
              )}
              {currentLocation && (
                <div className="flex justify-between items-center text-stone-600">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-stone-400" /> Current Location</span>
                  <span className="font-medium text-stone-900">{currentLocation}</span>
                </div>
              )}
              <a
                href={`https://shiprocket.co/tracking/${awbCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold rounded-xl px-4 py-2.5 border border-orange-200 text-stone-900 hover:bg-orange-50 transition-colors"
              >
                Track Shipment <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {scans.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Tracking Timeline</p>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {scans.map((scan, idx) => (
                      <div key={idx} className="flex gap-2.5">
                        <div className="flex flex-col items-center pt-0.5">
                          <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-orange-500' : 'bg-stone-300'}`} />
                          {idx !== scans.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-1" />}
                        </div>
                        <div className="pb-2.5">
                          <p className="text-xs font-medium text-stone-900">{scan.activity || scan.status}</p>
                          {scan.location && <p className="text-[11px] text-stone-500">{scan.location}</p>}
                          {scan.date && <p className="text-[10px] text-stone-400 mt-0.5">{new Date(scan.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : !status || status.toUpperCase() === 'NEW' ? (
            <>
              <p className="text-xs text-stone-500 italic">
                No courier assigned yet — go to Shiprocket and click &quot;Ship Now&quot; on this order. The AWB and courier will appear here automatically once you do (via webhook, or click refresh above).
              </p>
              <a
                href={SHIPROCKET_NEW_ORDERS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold rounded-xl px-4 py-2.5 bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                Open Shiprocket — Ship Now <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-stone-600">
                <span>Live Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold capitalize">
                  {status}
                </span>
              </div>
              <p className="text-xs text-stone-500 italic">
                Shiprocket hasn&apos;t returned an AWB code for this order — the tracking link and courier name won&apos;t be available here, but the status above is still live from Shiprocket.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
