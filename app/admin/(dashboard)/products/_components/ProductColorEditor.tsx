'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Trash2, Image as ImageIcon, Loader2, Check, Palette, Upload, ChevronDown, ChevronUp, X } from 'lucide-react'
import { saveProductColors } from '@/actions/products'
import Image from 'next/image'
import { CldUploadWidget } from 'next-cloudinary'

export type ColorVariant = {
  id: string
  color_name: string
  color_hex: string
  images: string[]
  stock_quantity: number
  is_expanded?: boolean
}

// Preset color map for instant hex matching
const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Beige', hex: '#E6DAC4' },
  { name: 'Dusty Pink', hex: '#D8A7B1' },
  { name: 'Wine', hex: '#722F37' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Muted Sage', hex: '#9CAF88' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Taupe', hex: '#8B8589' },
  { name: 'Rose', hex: '#FF007F' },
  { name: 'Emerald', hex: '#046A38' },
  { name: 'Champagne', hex: '#F7E7CE' },
  { name: 'Mocha', hex: '#967969' }
]

export default function ProductColorEditor({
  productId,
  initialColors = [],
}: {
  productId: string
  initialColors?: any[]
}) {
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Format initial colors state
  const [colors, setColors] = useState<ColorVariant[]>(() => {
    if (initialColors && initialColors.length > 0) {
      return initialColors.map((c, idx) => ({
        id: c.id || `col-${idx}-${Date.now()}`,
        color_name: c.color_name || '',
        color_hex: c.color_hex || getHexForName(c.color_name) || '#E6DAC4',
        images: Array.isArray(c.images) ? c.images : (c.image_url ? [c.image_url] : []),
        stock_quantity: c.stock_quantity ?? 50,
        is_expanded: true
      }))
    }
    return []
  })

  // Quick preset adder or custom adder state
  const [presetList, setPresetList] = useState<{ name: string; hex: string }[]>(PRESET_COLORS)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#722F37')

  // Helper to update preset list and persist across products
  const updatePresetsAndPersist = (updater: (prev: { name: string; hex: string }[]) => { name: string; hex: string }[]) => {
    setPresetList(prev => {
      const updated = updater(prev)
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hijabista_admin_color_presets', JSON.stringify(updated))
        }
      } catch (e) {}
      return updated
    })
  }

  // Load custom presets created in other products on mount
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('hijabista_admin_color_presets')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPresetList(prev => {
              const next = [...prev]
              parsed.forEach((p: any) => {
                if (p.name && !next.some(existing => existing.name.toLowerCase() === p.name.toLowerCase())) {
                  next.push({ name: p.name, hex: p.hex || '#E6DAC4' })
                }
              })
              return next
            })
          }
        }
      }
    } catch (e) {}
  }, [])

  // Sync initialColors for this specific product to presetList
  React.useEffect(() => {
    if (initialColors && initialColors.length > 0) {
      updatePresetsAndPersist(prev => {
        const next = [...prev]
        initialColors.forEach(c => {
          if (c.color_name && !next.some(p => p.name.toLowerCase() === c.color_name.toLowerCase())) {
            next.push({
              name: c.color_name,
              hex: c.color_hex || '#E6DAC4'
            })
          }
        })
        return next
      })
    }
  }, [initialColors])

  const handleRemovePreset = (nameToRemove: string) => {
    updatePresetsAndPersist(prev => prev.filter(p => p.name.toLowerCase() !== nameToRemove.toLowerCase()))
  }

  const handleResetPresets = () => {
    updatePresetsAndPersist(() => PRESET_COLORS)
  }

  function getHexForName(name: string): string {
    const found = presetList.find(p => p.name.toLowerCase() === name.toLowerCase().trim()) ||
                  PRESET_COLORS.find(p => p.name.toLowerCase() === name.toLowerCase().trim())
    return found ? found.hex : '#E6DAC4'
  }

  const addColorVariant = (name: string, hex?: string) => {
    const finalName = name.trim()
    if (!finalName) return

    const finalHex = hex || getHexForName(finalName)

    // Add to preset pills list and persist across products
    updatePresetsAndPersist(prev => {
      if (!prev.some(p => p.name.toLowerCase() === finalName.toLowerCase())) {
        return [...prev, { name: finalName, hex: finalHex }]
      }
      return prev.map(p => p.name.toLowerCase() === finalName.toLowerCase() ? { ...p, hex: finalHex } : p)
    })

    setColors(prev => [
      ...prev,
      {
        id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        color_name: finalName,
        color_hex: finalHex,
        images: [],
        stock_quantity: 50,
        is_expanded: true
      }
    ])
    setNewColorName('')
  }

  const removeColorVariant = (id: string) => {
    setColors(prev => prev.filter(c => c.id !== id))
  }

  const updateColorField = (id: string, field: keyof ColorVariant, value: any) => {
    setColors(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const toggleExpand = (id: string) => {
    setColors(prev =>
      prev.map(c => (c.id === id ? { ...c, is_expanded: !c.is_expanded } : c))
    )
  }

  const addImageToColor = (colorId: string, url: string) => {
    if (!url.trim()) return
    setColors(prev =>
      prev.map(c => {
        if (c.id === colorId) {
          if (c.images.includes(url.trim())) return c
          return { ...c, images: [...c.images, url.trim()] }
        }
        return c
      })
    )
  }

  const removeImageFromColor = (colorId: string, imgUrl: string) => {
    setColors(prev =>
      prev.map(c => {
        if (c.id === colorId) {
          return { ...c, images: c.images.filter(img => img !== imgUrl) }
        }
        return c
      })
    )
  }

  const handleSave = () => {
    startTransition(async () => {
      const formatted = colors.map((c, index) => ({
        id: c.id,
        color_name: c.color_name,
        color_hex: c.color_hex,
        images: c.images,
        stock_quantity: Number(c.stock_quantity) || 0,
        display_order: index
      }))

      const res = await saveProductColors(productId, formatted)
      if (res.success) {
        setSuccessMessage('Color variants saved successfully!')
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
            <Palette className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-stone-900">Color Variants</h3>
          </div>
          <p className="text-stone-500 text-xs mt-1">
            Add multiple colors for this product (Black, White, Wine, Beige, etc.).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-50 transition-all duration-200"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Save Color Variants
        </button>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>✓ {successMessage}</span>
        </div>
      )}

      {/* Preset Quick Adder & Custom Input */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Quick Add Popular Color
          </label>
          {presetList.length < PRESET_COLORS.length && (
            <button
              type="button"
              onClick={handleResetPresets}
              className="text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors"
            >
              Reset Presets
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1">
          {presetList.map(p => {
            const isAlreadyAdded = colors.some(c => c.color_name.toLowerCase() === p.name.toLowerCase())
            return (
              <div
                key={p.name}
                className={`inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                  isAlreadyAdded
                    ? 'bg-stone-100 text-stone-400 border-stone-200 opacity-60'
                    : 'bg-white text-stone-800 border-stone-200/90 hover:border-orange-500 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => !isAlreadyAdded && addColorVariant(p.name, p.hex)}
                  disabled={isAlreadyAdded}
                  className="inline-flex items-center gap-2 hover:text-orange-600 transition-colors disabled:cursor-not-allowed"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span>{p.name}</span>
                  {isAlreadyAdded && <span className="text-emerald-600 font-bold">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePreset(p.name)
                  }}
                  className="p-1 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-full transition-all flex items-center justify-center shrink-0 ml-0.5"
                  title={`Remove ${p.name} preset`}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Custom Color Input Form */}
        <div className="pt-2 border-t border-stone-200/60 flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={newColorName}
              onChange={e => {
                setNewColorName(e.target.value)
                const autoHex = getHexForName(e.target.value)
                if (autoHex !== '#E6DAC4') setNewColorHex(autoHex)
              }}
              placeholder="e.g. Dusty Pink, Olive, Champagne"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Swatch:</span>
            <input
              type="color"
              value={newColorHex}
              onChange={e => setNewColorHex(e.target.value)}
              className="w-9 h-9 p-0.5 rounded-lg border border-stone-200 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => addColorVariant(newColorName, newColorHex)}
            disabled={!newColorName.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Add Custom Color
          </button>
        </div>
      </div>

      {/* List of Added Color Variants */}
      {colors.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50 space-y-2">
          <Palette className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-600">No color variants added yet.</p>
          <p className="text-xs text-stone-400">
            Click on any color preset above (Black, White, Beige, Wine, etc.) to start adding color variants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
          {colors.map((c, index) => (
            <div
              key={c.id}
              className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden"
            >
              {/* Color Card Header */}
              <div className="p-4 bg-stone-50 flex items-center justify-between border-b border-stone-200/80">
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full border border-stone-300 shadow-sm shrink-0"
                    style={{ backgroundColor: c.color_hex }}
                  />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {c.color_name || 'Unnamed Color'}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeColorVariant(c.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Color Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
