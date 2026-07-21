'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { InstagramPost } from '@/actions/instagram'
import {
  addInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
  toggleInstagramPostActive,
} from '@/actions/admin/instagram'
import {
  Instagram,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  X,
  UploadCloud,
  ImageIcon,
} from 'lucide-react'

const DEFAULT_INSTAGRAM_LINK = 'https://www.instagram.com/__hijabistaa__'

export function InstagramPostsList({ initialPosts }: { initialPosts: InstagramPost[] }) {
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState({
    image_url: '',
    link_url: DEFAULT_INSTAGRAM_LINK,
    caption: '',
    display_order: 1,
    is_active: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const openAddModal = () => {
    setEditingPost(null)
    setFormData({
      image_url: '',
      link_url: DEFAULT_INSTAGRAM_LINK,
      caption: '',
      display_order: posts.length + 1,
      is_active: true,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const openEditModal = (post: InstagramPost) => {
    setEditingPost(post)
    setFormData({
      image_url: post.image_url,
      link_url: post.link_url || DEFAULT_INSTAGRAM_LINK,
      caption: post.caption || '',
      display_order: post.display_order || 1,
      is_active: post.is_active,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          image_url: event.target?.result as string,
        }))
        setErrorMsg(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleToggleActive = async (post: InstagramPost) => {
    const nextActive = !post.is_active
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, is_active: nextActive } : p))
    )

    try {
      const res = await toggleInstagramPostActive(post.id, nextActive)
      if (!res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, is_active: post.is_active } : p))
        )
        alert('Failed to update status')
      }
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_active: post.is_active } : p))
      )
    }
  }

  const handleDelete = async (post: InstagramPost) => {
    if (!confirm('Are you sure you want to delete this Instagram post?')) return

    setPosts((prev) => prev.filter((p) => p.id !== post.id))

    try {
      const res = await deleteInstagramPost(post.id)
      if (!res.success) {
        alert(res.error || 'Failed to delete post')
      }
    } catch (e) {
      alert('Error deleting post')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image_url.trim()) {
      setErrorMsg('Please upload an image or enter an Image URL')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    const payload = {
      ...formData,
      link_url: DEFAULT_INSTAGRAM_LINK,
    }

    try {
      if (editingPost) {
        const res = await updateInstagramPost(editingPost.id, payload)
        if (res.success) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id ? { ...p, ...payload } : p
            )
          )
          setIsModalOpen(false)
        } else {
          setErrorMsg(res.error || 'Failed to update post')
        }
      } else {
        const res = await addInstagramPost(payload)
        if (res.success) {
          const newP: InstagramPost = {
            id: `insta_${Date.now()}`,
            ...payload,
          }
          setPosts((prev) => [...prev, newP])
          setIsModalOpen(false)
        } else {
          setErrorMsg(res.error || 'Failed to add post')
        }
      }
    } catch (e) {
      setErrorMsg('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalCount = posts.length
  const activeCount = posts.filter((p) => p.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            Instagram Gallery
            <span className="px-3 py-0.5 rounded-full bg-[#9C5247]/10 text-[#9C5247] text-xs font-bold uppercase tracking-wider">
              {activeCount} Active
            </span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage images & links displayed in the homepage Instagram grid.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9C5247] text-white font-semibold text-sm hover:bg-[#7E3F35] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Instagram Post
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Feed Items</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Visible on Homepage</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Database</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">Storage Sync</h3>
          </div>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`bg-white rounded-2xl border ${
              post.is_active ? 'border-stone-200/80 shadow-sm' : 'border-dashed border-stone-300 opacity-60'
            } overflow-hidden flex flex-col group transition-all`}
          >
            {/* Image Preview Container */}
            <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
              <Image
                src={post.image_url}
                alt={post.caption || 'Instagram post'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                #{post.display_order}
              </div>
              {!post.is_active && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                  Hidden
                </div>
              )}
            </div>

            {/* Info & Action Controls */}
            <div className="p-3 flex-1 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Post #{post.display_order}
                </p>
                <a
                  href={post.link_url || DEFAULT_INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#9C5247] hover:underline inline-flex items-center gap-1 mt-0.5 truncate max-w-full font-medium"
                >
                  <span>Official Instagram Link</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <button
                  onClick={() => handleToggleActive(post)}
                  title={post.is_active ? 'Hide from homepage' : 'Show on homepage'}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    post.is_active
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-stone-500 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {post.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(post)}
                    title="Edit Post"
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    title="Delete Post"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Instagram className="w-5 h-5 text-[#9C5247]" />
                {editingPost ? 'Edit Instagram Post' : 'Add New Instagram Post'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Box & Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Upload Image <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.image_url ? (
                  <div className="relative w-full h-44 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shadow-sm group">
                    <Image
                      src={formData.image_url}
                      alt="Uploaded Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-stone-900 text-xs font-bold shadow hover:bg-white transition-all flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-bold shadow hover:bg-red-600 transition-all flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-stone-200 hover:border-[#9C5247] rounded-xl p-6 text-center cursor-pointer bg-stone-50 hover:bg-stone-100/70 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#9C5247]/10 text-[#9C5247] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        Click to Upload Image from Computer
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        PNG, JPG, WEBP formats supported
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Instagram Link URL</span>
                  <span className="text-[10px] text-stone-400 font-normal">Fixed Official Link</span>
                </label>
                <input
                  type="url"
                  value={DEFAULT_INSTAGRAM_LINK}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-sm cursor-not-allowed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9C5247] focus:ring-1 focus:ring-[#9C5247]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer pb-2.5">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#9C5247] focus:ring-[#9C5247]"
                    />
                    <span className="text-sm font-semibold text-stone-800">Active</span>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {errorMsg}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#9C5247] text-white text-sm font-semibold hover:bg-[#7E3F35] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : editingPost ? 'Update Post' : 'Add Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
