'use client'

import { createContext, useContext, useState } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from '@/components/admin/Sidebar'

const MobileNavContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export function MobileMenuButton() {
  const { setOpen } = useContext(MobileNavContext)

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open menu"
      className="md:hidden -ml-1 p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}

export default function AdminShell({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <MobileNavContext.Provider value={{ open, setOpen }}>
      <div className="flex h-dvh overflow-hidden bg-stone-50">
        <AdminSidebar mobileOpen={open} onClose={() => setOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {header}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </MobileNavContext.Provider>
  )
}
