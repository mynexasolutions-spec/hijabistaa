'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  Image,
  Images,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Truck,
  Tag,
  Gift,
  Mail,
  Instagram,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Hero Slides', href: '/admin/hero-slides', icon: Image },
  { label: 'Instagram Gallery', href: '/admin/instagram', icon: Instagram },
  { label: 'Promo Popup', href: '/admin/home-banner', icon: Gift },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Global FAQs', href: '/admin/settings/faqs', icon: Settings },
  { label: 'Shipping Settings', href: '/admin/settings/shipping', icon: Truck },
  { label: 'Manage Coupons', href: '/admin/settings/coupons', icon: Tag },
  { label: 'Manage Profile', href: '/admin/settings/profile', icon: User },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px]' : 'w-64'
      } bg-cream border-r border-cream-line flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-cream-line gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald to-emerald-deep rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-emerald/20">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-ink font-semibold text-sm leading-tight truncate">
              HIJABISTAA
            </p>
            <p className="text-ink/50 text-xs truncate">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href as any}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#9C5247]/10 text-[#9C5247] font-semibold'
                  : 'text-ink/75 hover:text-[#9C5247] hover:bg-cream-deep/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive
                    ? 'text-[#9C5247]'
                    : 'text-ink/40 group-hover:text-[#9C5247]'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-cream-line">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-ink/50 hover:text-emerald hover:bg-cream-deep/60 transition-all duration-200 text-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
