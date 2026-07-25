'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Check, Loader2, Sparkles } from 'lucide-react'
import { saveProductDesigns } from '@/actions/products'

export function ProductDesignsEditor({
  productId,
  initialDesigns = [],
}: {
  productId: string
  initialDesigns?: string[]
}) {
  const [isPending, startTransition] = useTransition()
  const [designs, setDesigns] = useState<string[]>(initialDesigns)
  const [newDesign, setNewDesign] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const PRESET_DESIGNS = ['Plain', 'Stripes', 'Floral', 'Printed', 'Embroidered']

  const handleAddDesign = (design: string) => {
    const trimmed = design.trim()
    if (trimmed && !designs.includes(trimmed)) {
      setDesigns([...designs, trimmed])
      setNewDesign('')
    }
  }

  const handleRemoveDesign = (designToRemove: string) => {
    setDesigns(designs.filter(d => d !== designToRemove))
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveProductDesigns(productId, designs)
      if (res.success) {
        setSuccessMessage('Designs saved successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else if (res.error) {
        alert(`Error: ${res.error}`)
      }
    })
  }

  return (
    <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-stone-900">Product Designs</h3>
          </div>
          <p className="text-stone-500 text-xs mt-1">
            Add design variations for this product (e.g. Floral, Stripes, Plain).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 focus:outline-none transition-all duration-200 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Save Designs
        </button>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>✓ {successMessage}</span>
        </div>
      )}

      {/* Preset & Custom Adder */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Quick Add
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_DESIGNS.map(preset => {
              const isAdded = designs.includes(preset)
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => !isAdded && handleAddDesign(preset)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isAdded
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-indigo-500 hover:text-indigo-600 shadow-sm'
                  }`}
                >
                  {preset} {isAdded && '✓'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200/60 flex items-center gap-3">
          <input
            type="text"
            value={newDesign}
            onChange={e => setNewDesign(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddDesign(newDesign)
              }
            }}
            placeholder="e.g. Geometric, Abstract"
            className="flex-1 px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="button"
            onClick={() => handleAddDesign(newDesign)}
            disabled={!newDesign.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Added Designs */}
      {designs.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
          <Sparkles className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-600">No designs added yet.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {designs.map(design => (
            <div
              key={design}
              className="inline-flex items-center gap-2 bg-white border border-stone-200 shadow-sm rounded-lg pl-3 pr-1.5 py-1.5"
            >
              <span className="text-sm font-bold text-stone-800">{design}</span>
              <button
                type="button"
                onClick={() => handleRemoveDesign(design)}
                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove Design"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
