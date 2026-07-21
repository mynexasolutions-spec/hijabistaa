'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react'
import { createDiscoverItem, updateDiscoverItem, deleteDiscoverItem, toggleDiscoverItemStatus, getMegaMenuDiscoverItems } from '@/actions/admin/megaMenuDiscover'
import Image from 'next/image'

export default function DiscoverMenuManager({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [href, setHref] = useState('')
  const [badgeText, setBadgeText] = useState('')
  const [badgeColor, setBadgeColor] = useState('bg-[#C84B31] text-white')
  const [imageUrl, setImageUrl] = useState('')

  // Auto-generate default href when title changes if adding new
  useEffect(() => {
    if (isAdding && title && !editingId && !href) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setHref(`/shop?category=${slug}`)
    }
  }, [title, isAdding, editingId, href])

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setIsAdding(false)
    setTitle(item.title || '')
    setHref(item.href || '/shop')
    setBadgeText(item.badge || '')
    setBadgeColor(item.badge_color || 'bg-[#C84B31] text-white')
    setImageUrl(item.image_url || '')
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setEditingId(null)
    setTitle('')
    setHref('')
    setBadgeText('')
    setBadgeColor('bg-[#C84B31] text-white')
    setImageUrl('')
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('title', title)
    formData.append('href', href || '/shop')
    formData.append('badge', badgeText)
    formData.append('badgeColor', badgeColor)
    formData.append('imageUrl', imageUrl)
    
    try {
      let res;
      if (editingId) {
        res = await updateDiscoverItem(editingId, formData)
      } else {
        res = await createDiscoverItem(formData)
      }

      if (res?.error) {
        setError(res.error)
      } else {
        setIsAdding(false)
        setEditingId(null)
        // Refresh items from backend
        const fresh = await getMegaMenuDiscoverItems()
        setItems(fresh)
      }
    } catch (err) {
      setError('Failed to save item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setError(null)
    setTitle('')
    setHref('')
    setBadgeText('')
    setImageUrl('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discover item?')) return
    
    setLoading(true)
    const res = await deleteDiscoverItem(id)
    if (res?.error) {
      alert(res.error)
    } else {
      setItems(items.filter(i => i.id !== id))
    }
    setLoading(false)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoading(true)
    const res = await toggleDiscoverItemStatus(id, !currentStatus)
    if (res?.error) {
      alert(res.error)
    } else {
      setItems(items.map(i => i.id === id ? { ...i, is_active: !currentStatus } : i))
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden mt-8">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Mega Menu: Discover Section</h2>
          <p className="text-stone-500 text-sm mt-0.5">Manage the cards displayed in the Header Categories dropdown</p>
        </div>
        {!isAdding && !editingId && items.length < 6 && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C5247] text-white text-sm font-semibold rounded-xl hover:bg-[#7E3F35] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Discover Item
          </button>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        {(isAdding || editingId) && (
          <form ref={formRef} onSubmit={handleSubmit} className="mb-8 bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingId ? 'Edit Discover Item' : 'Add New Discover Item'}
              </h3>
              <button type="button" onClick={handleCancel} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Title *</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#9C5247] focus:border-[#9C5247]" 
                  placeholder="e.g. New Arrivals" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Link URL (href) *</label>
                <input 
                  type="text" 
                  required 
                  value={href} 
                  onChange={(e) => setHref(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#9C5247] focus:border-[#9C5247]" 
                  placeholder="e.g. /shop?sort=new" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Badge Text (Optional)</label>
                <input 
                  type="text" 
                  value={badgeText} 
                  onChange={(e) => setBadgeText(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#9C5247] focus:border-[#9C5247]" 
                  placeholder="e.g. New or 15% OFF" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Badge Style</label>
                <select 
                  value={badgeColor} 
                  onChange={(e) => setBadgeColor(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#9C5247] focus:border-[#9C5247]"
                >
                  <option value="bg-[#C84B31] text-white">Red / Terracotta (Default)</option>
                  <option value="bg-[#F2DCD6] text-[#C84B31]">Light Pink</option>
                  <option value="bg-emerald-600 text-white">Emerald Green</option>
                  <option value="bg-stone-900 text-white">Black</option>
                  <option value="bg-stone-100 text-stone-800">Light Gray</option>
                  <option value="bg-blue-600 text-white">Blue</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">Card Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />

                {imageUrl ? (
                  <div className="relative w-44 h-32 rounded-xl overflow-hidden border border-stone-300 group shadow-sm">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-1.5 bg-white text-stone-900 text-xs font-bold rounded-lg shadow"
                      >
                        Change
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setImageUrl('')} 
                        className="p-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="px-5 py-4 border-2 border-dashed border-stone-300 rounded-xl bg-white hover:border-[#9C5247] hover:bg-stone-100/50 transition-all flex flex-col items-center justify-center gap-1.5 flex-1"
                    >
                      <UploadCloud className="w-5 h-5 text-[#9C5247]" />
                      <span className="text-xs font-bold text-stone-800">Click to Upload Image from Computer</span>
                    </button>
                  </div>
                )}
                
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="Or paste image URL (e.g. /hijab-medina.jpg or https://...)" 
                  className="mt-2 w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#9C5247]" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-3 border-t border-stone-200">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-5 py-2.5 bg-[#9C5247] text-white text-sm font-semibold rounded-xl hover:bg-[#7E3F35] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Item' : 'Save Discover Item'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.length === 0 && !isAdding && (
            <div className="col-span-full py-8 text-center text-stone-500 text-sm bg-stone-50 rounded-xl border border-dashed border-stone-200">
              No discover items added yet. Click "Add Discover Item" to create one.
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className={`group relative flex flex-col p-3 rounded-2xl bg-white hover:shadow-md transition-all duration-300 border border-stone-200 ${!item.is_active ? 'opacity-60' : ''}`}>
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative border border-stone-100 mb-3 bg-stone-50 flex items-center justify-center">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" unoptimized />
                ) : (
                  <ImageIcon className="w-8 h-8 text-stone-300" />
                )}
                {item.badge && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${item.badge_color || 'bg-stone-900 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="font-display font-bold text-stone-900 text-[13px] truncate">{item.title}</h4>
                <p className="text-[10px] text-stone-500 truncate mt-0.5" title={item.href}>{item.href}</p>
              </div>
              
              {/* Actions Overlay */}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggle(item.id, item.is_active)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-colors ${item.is_active ? 'bg-white/80 text-green-600 hover:bg-white' : 'bg-stone-800/80 text-white hover:bg-stone-900'}`}
                  title={item.is_active ? "Deactivate" : "Activate"}
                >
                  {item.is_active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="w-7 h-7 rounded-full bg-white/80 text-blue-600 hover:bg-white flex items-center justify-center shadow-sm backdrop-blur-md transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 rounded-full bg-white/80 text-red-600 hover:bg-white flex items-center justify-center shadow-sm backdrop-blur-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
