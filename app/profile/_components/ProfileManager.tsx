'use client'

import { useState, useEffect } from 'react'
import { User, Phone, MapPin, CheckCircle, Package, Mail } from 'lucide-react'
import { updateCustomerFullProfile } from '@/actions/profile'
import { useToast } from '@/context/ToastContext'

type CustomerProfile = {
  fullName: string
  phone: string
  alternatePhone: string
  street: string
  city: string
  state: string
  zipCode: string
}

export default function ProfileManager({ adminProfile, orders = [] }: { adminProfile: any, orders?: any[] }) {
  const [profile, setProfile] = useState<CustomerProfile>({
    fullName: '',
    phone: '',
    alternatePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const { showToast } = useToast()

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  // Load profile data on mount
  useEffect(() => {
    if (adminProfile) {
      setProfile({
        fullName: adminProfile.full_name || '',
        phone: adminProfile.phone || '',
        alternatePhone: adminProfile.alternatePhone || '',
        street: adminProfile.street || '',
        city: adminProfile.city || '',
        state: adminProfile.state || '',
        zipCode: adminProfile.zipCode || '',
      })
    } else if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('hijabistaa-customer-profile')
      if (savedData) {
        try {
          setProfile(JSON.parse(savedData))
        } catch (e) {
          console.error('Failed to parse profile data', e)
        }
      }
    }
  }, [adminProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adminProfile) {
      const res = await updateCustomerFullProfile(profile)
      if (res.error) {
        showToast(res.error, 'error')
        return
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('hijabistaa-customer-profile', JSON.stringify(profile))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleChange = (field: keyof CustomerProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card border border-cream-line/75">
        <form onSubmit={handleSave} className="space-y-6">
          {saved && (
            <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <span>Shipping address and profile saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Sumaiya Khan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={adminProfile?.email || ''}
                  placeholder="e.g. customer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/10 text-ink/50 cursor-not-allowed focus:outline-none text-[15px]"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Alternate Phone Number <span className="text-ink/30 normal-case font-medium">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.alternatePhone}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>
          </div>

          <div className="border-t border-cream-line/50 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold" /> Default Shipping Address
            </h3>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                required
                value={profile.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="e.g. Apartment, Suite, Block number"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                PIN Code / ZIP Code
              </label>
              <input
                type="text"
                required
                value={profile.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="e.g. 110001"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all duration-200"
          >
            Save Account Details
          </button>
        </form>
      </div>

      {/* Orders Card */}
      {/* Orders Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-ink">Order History</h2>

        {/* Mobile Custom Dropdown */}
        <div className="md:hidden relative">
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-white border border-cream-line rounded-xl px-5 py-3.5 text-sm font-bold text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald/20 transition-all capitalize"
          >
            <span>{activeTab === 'all' ? 'All Orders' : activeTab}</span>
            <svg className={`w-5 h-5 text-ink/50 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-cream-line rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab as any)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-5 py-3 text-sm capitalize transition-colors ${
                    activeTab === tab 
                      ? 'bg-emerald/5 font-bold text-emerald' 
                      : 'font-medium text-ink hover:bg-cream/50'
                  }`}
                >
                  {tab === 'all' ? 'All Orders' : tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-6 border-b border-cream-line overflow-x-auto hide-scrollbar whitespace-nowrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 capitalize transition-colors ${
                activeTab === tab 
                  ? 'text-ink font-semibold border-b-2 border-ink' 
                  : 'text-ink/60 font-medium hover:text-ink'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        {(() => {
          let displayedOrders = orders
          if (activeTab !== 'all') {
            displayedOrders = orders.filter(o => o.order_status?.toLowerCase() === activeTab)
          }

          if (!displayedOrders || displayedOrders.length === 0) {
            return (
              <div className="text-center py-12 bg-white rounded-xl border border-cream-line/75 shadow-sm">
                <Package className="w-12 h-12 text-gold mx-auto mb-3 opacity-50" />
                <p className="text-ink/60 text-lg">
                  {activeTab !== 'all' 
                    ? `No ${activeTab} orders found.` 
                    : 'No orders placed yet.'}
                </p>
                <p className="text-sm text-ink/40 mt-1">Add items to your cart and checkout to see them here.</p>
              </div>
            )
          }

          return (
            <div className="space-y-6 mt-4">
              {displayedOrders.map((order) => {
              const orderDate = new Date(order.created_at)
              const formattedDate = orderDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })

              const isExpanded = expandedOrders[order.id] || false
              const isDelivered = order.order_status?.toLowerCase() === 'delivered'
              const isCancelled = order.order_status?.toLowerCase() === 'cancelled'

              return (
                <div key={order.id} className={`bg-white rounded-xl border ${isDelivered ? 'border-emerald/30' : isCancelled ? 'border-red-500/30' : 'border-cream-line/75'} shadow-sm overflow-hidden`}>
                  {/* Order Header */}
                  <div 
                    onClick={() => toggleOrder(order.id)}
                    className={`p-4 md:p-6 flex items-start md:items-center gap-3 md:gap-4 border-b ${
                      isDelivered 
                        ? 'border-emerald/20 bg-emerald/5 hover:bg-emerald/10' 
                        : isCancelled
                        ? 'border-red-500/20 bg-red-50 hover:bg-red-100'
                        : 'border-cream-line/50 bg-cream/10 hover:bg-cream/20'
                    } cursor-pointer transition-colors`}
                  >
                    {/* Toggle Button (Left Side) */}
                    <button className="mt-0.5 md:mt-0 p-1.5 md:p-2 border border-cream-line rounded-md hover:bg-cream/50 transition-colors text-ink shrink-0">
                      <svg className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Order Info */}
                    <div className="space-y-1 md:space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-ink font-bold text-sm md:text-base">
                        <Package className={`w-4 h-4 md:w-5 md:h-5 ${isDelivered ? 'text-emerald' : isCancelled ? 'text-red-500' : 'text-ink/70'}`} />
                        <span>Order <span className="font-semibold">#{order.order_number}</span></span>
                        
                        {isDelivered && (
                          <span className="ml-1 px-1.5 py-0.5 bg-emerald/10 text-emerald text-[10px] uppercase tracking-wider font-bold rounded-md">
                            Delivered
                          </span>
                        )}
                        {isCancelled && (
                          <span className="ml-1 px-1.5 py-0.5 bg-red-500/10 text-red-600 text-[10px] uppercase tracking-wider font-bold rounded-md">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 md:gap-2 text-xs md:text-sm ${isDelivered ? 'text-emerald/80' : isCancelled ? 'text-red-600/80' : 'text-ink/60'}`}>
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                        <span>Date: {formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="animate-in fade-in duration-200">
                      {/* Order Items */}
                      <div className="divide-y divide-cream-line/30">
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.map((item: any, idx: number) => (
                        <div key={idx} className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                          {/* Product Image */}
                          <div className="w-24 h-24 md:w-32 md:h-32 bg-cream rounded-lg overflow-hidden shrink-0 border border-cream-line/50">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.product_title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink/20">
                                <Package className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                              <div className="space-y-1">
                                <h4 className="font-bold text-lg text-ink">{item.product_name || item.product_title || 'Unknown Product'}</h4>
                                <p className="text-sm text-ink/60">By: HIJABISTA</p>
                                
                                <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-ink/80">
                                  {(item.variant_name || item.selected_size) && (
                                    <span>Size: {item.variant_name || item.selected_size}</span>
                                  )}
                                  {(item.variant_name || item.selected_size) && <span className="w-px h-4 bg-cream-line"></span>}
                                  
                                  {item.color_name && (
                                    <span>Color: {item.color_name}</span>
                                  )}
                                  {item.color_name && <span className="w-px h-4 bg-cream-line"></span>}
                                  
                                  <span>Qty: {item.quantity}</span>
                                  <span className="w-px h-4 bg-cream-line"></span>
                                  <span className="font-semibold text-ink">Price: ₹{item.price_at_purchase || item.unit_price || 0}</span>
                                </div>
                              </div>

                              <div className="flex flex-col md:items-end gap-1">
                                <span className="text-sm text-ink/60">Status</span>
                                <span className={`font-bold capitalize ${
                                  order.order_status === 'delivered' ? 'text-emerald' : 
                                  order.order_status === 'cancelled' ? 'text-red-500' : 
                                  'text-ink'
                                }`}>
                                  {order.order_status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-ink/50 text-sm">
                        No items found for this order.
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="p-5 md:p-6 bg-cream/10 border-t border-cream-line/50 flex justify-end items-center gap-4">
                    <div className="text-lg">
                      <span className="text-ink/60 mr-2">Total Price:</span>
                      <span className="font-bold text-ink">₹{order.total_amount}</span>
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })()}
      </div>
    </div>
  )
}
