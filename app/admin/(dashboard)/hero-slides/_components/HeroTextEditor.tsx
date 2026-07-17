'use client'

import { useState, useTransition } from 'react'
import { updateHeroText, HeroTextConfig } from '@/actions/admin/hero'
import { Type, Save, Check, Loader2, Sparkles } from 'lucide-react'

export function HeroTextEditor({ initialText }: { initialText: HeroTextConfig }) {
  const [text, setText] = useState<HeroTextConfig>(initialText)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      const res = await updateHeroText(text)
      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert(res.error || 'Failed to update hero text')
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#7E3F35]/10 rounded-xl text-[#7E3F35]">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Hero Heading & Description</h2>
            <p className="text-xs text-stone-500 mt-0.5">Customize the main typography and tagline displayed across the storefront homepage.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-semibold text-amber-800 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Live Storefront Sync
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Column 1: Input Fields */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="grid grid-cols-1 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Heading Line 1
                </label>
                <input
                  type="text"
                  value={text.heading_line1}
                  onChange={(e) => setText({ ...text, heading_line1: e.target.value })}
                  placeholder="Modesty."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7E3F35] focus:border-transparent text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7E3F35] uppercase tracking-wider mb-1.5">
                  Heading Line 2 (Accent Color)
                </label>
                <input
                  type="text"
                  value={text.heading_line2}
                  onChange={(e) => setText({ ...text, heading_line2: e.target.value })}
                  placeholder="Elegance."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#7E3F35]/30 bg-[#7E3F35]/5 focus:outline-none focus:ring-2 focus:ring-[#7E3F35] focus:border-transparent text-sm font-semibold text-[#7E3F35] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Heading Line 3
                </label>
                <input
                  type="text"
                  value={text.heading_line3}
                  onChange={(e) => setText({ ...text, heading_line3: e.target.value })}
                  placeholder="You."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7E3F35] focus:border-transparent text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Description Paragraph / Tagline
              </label>
              <textarea
                rows={2}
                value={text.description}
                onChange={(e) => setText({ ...text, description: e.target.value })}
                placeholder="Premium Hijabs, Scarves & Modest Essentials crafted with luxurious fabric and effortless style."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7E3F35] focus:border-transparent text-sm leading-relaxed transition-all resize-none"
              />
            </div>
          </div>

          {/* Column 2: Live Storefront Preview Box */}
          <div className="bg-[#FAF6F0] rounded-xl p-5 border border-stone-200/80 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Homepage Typography Live Preview</p>
            <div className="py-2">
              <h3 className="font-display font-bold text-2xl sm:text-3xl leading-tight text-stone-900">
                {text.heading_line1 || 'Modesty.'} <br />
                <span className="text-[#7E3F35] ml-6 sm:ml-10 inline-block">{text.heading_line2 || 'Elegance.'}</span> <br />
                <span className="ml-16 sm:ml-24 inline-block">{text.heading_line3 || 'You.'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-body max-w-md mt-3 leading-relaxed">
                {text.description || 'Premium Hijabs, Scarves & Modest Essentials crafted with luxurious fabric and effortless style.'}
              </p>
            </div>
          </div>
        </div>

        {/* Center Aligned Save Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 border-t border-stone-100/80">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-fade-in">
              <Check className="w-4 h-4" />
              Saved to Storefront successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#7E3F35] hover:bg-[#68332b] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 min-w-[200px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Typography
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
