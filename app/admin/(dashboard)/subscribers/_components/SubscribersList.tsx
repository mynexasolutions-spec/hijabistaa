'use client'

import { useState } from 'react'
import { Subscriber, deleteSubscriber, addSubscriberByAdmin } from '@/actions/admin/subscribers'
import {
  Mail,
  Search,
  Trash2,
  Download,
  Plus,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Users,
  Send,
  X,
} from 'lucide-react'

export function SubscribersList({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter subscribers based on search query
  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  )

  // Stats calculation
  const totalCount = subscribers.length
  const todayCount = subscribers.filter((s) => {
    const subDate = new Date(s.created_at).toDateString()
    const today = new Date().toDateString()
    return subDate === today
  }).length

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (sub: Subscriber) => {
    if (!confirm(`Are you sure you want to remove ${sub.email} from subscribers?`)) return

    setDeletingId(sub.id)
    try {
      const res = await deleteSubscriber(sub.id, sub.email)
      if (res.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== sub.id))
      } else {
        alert(res.error || 'Failed to delete subscriber')
      }
    } catch (err) {
      alert('An error occurred while deleting')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    setIsAdding(true)
    setAddError(null)

    try {
      const res = await addSubscriberByAdmin(newEmail)
      if (res.success) {
        setSubscribers((prev) => [
          {
            id: `sub_${Date.now()}`,
            email: newEmail.trim().toLowerCase(),
            status: 'subscribed',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])
        setNewEmail('')
        setIsAddModalOpen(false)
      } else {
        setAddError(res.error || 'Failed to add subscriber')
      }
    } catch (err) {
      setAddError('Something went wrong')
    } finally {
      setIsAdding(false)
    }
  }

  const handleExportCSV = () => {
    if (subscribers.length === 0) return
    const headers = ['ID', 'Email', 'Status', 'Subscribed Date']
    const rows = subscribers.map((s) => [
      s.id,
      s.email,
      s.status,
      new Date(s.created_at).toLocaleString(),
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `hijabistaa_subscribers_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            Subscribers
            <span className="px-3 py-0.5 rounded-full bg-[#9C5247]/10 text-[#9C5247] text-xs font-bold uppercase tracking-wider">
              {totalCount} Total
            </span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage user email subscriptions gathered from website newsletter forms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-stone-500" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9C5247] text-white font-semibold text-sm hover:bg-[#7E3F35] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Subscribers</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Joined Today</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">{todayCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Active Rate</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">100%</h3>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9C5247] focus:ring-1 focus:ring-[#9C5247] transition-all"
          />
        </div>
        <p className="text-xs font-medium text-stone-500 hidden sm:block">
          Showing {filteredSubscribers.length} of {totalCount} subscribers
        </p>
      </div>

      {/* Subscribers Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No subscribers found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              {search ? 'No subscriber matched your search criteria.' : 'No email subscribers registered yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-[12px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Subscriber Email</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Subscribed Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50/60 transition-colors group">
                    <td className="py-4 px-5 font-medium text-stone-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#9C5247]/10 text-[#9C5247] flex items-center justify-center font-bold text-sm shrink-0">
                        {sub.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 truncate">{sub.email}</p>
                        <p className="text-xs text-stone-400 font-normal">ID: {sub.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Subscribed
                      </span>
                    </td>
                    <td className="py-4 px-5 text-stone-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(sub.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${sub.email}`}
                          title="Send Email"
                          className="p-2 rounded-lg text-stone-400 hover:text-[#9C5247] hover:bg-stone-100 transition-all"
                        >
                          <Send className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopy(sub.email, sub.id)}
                          title="Copy Email"
                          className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all relative"
                        >
                          {copiedId === sub.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(sub)}
                          disabled={deletingId === sub.id}
                          title="Delete Subscriber"
                          className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#9C5247]" />
                Add New Subscriber
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="subscriber@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#9C5247] focus:ring-1 focus:ring-[#9C5247]"
                />
              </div>

              {addError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {addError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2.5 rounded-xl bg-[#9C5247] text-white text-sm font-semibold hover:bg-[#7E3F35] disabled:opacity-50 flex items-center gap-2"
                >
                  {isAdding ? 'Adding...' : 'Add Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
