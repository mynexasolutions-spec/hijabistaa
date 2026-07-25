import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'

export const dynamic = 'force-dynamic'
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const mockSessionCookie = cookieStore.get('hijabistaa-user-session')?.value
  let mockUser = null

  if (mockSessionCookie) {
    try {
      mockUser = JSON.parse(mockSessionCookie)
    } catch (e) {
      // ignore parse error
    }
  }

  // Server-side admin authorization check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isMockAdmin = mockUser && mockUser.role === 'admin'

  if (!user && !isMockAdmin) {
    redirect('/admin/login')
  }

  if (user) {
    // Verify admin role for real Supabase user
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const hasAdminMeta = user.user_metadata?.role === 'admin'
    if (!hasAdminMeta && (!profile || profile.role !== 'admin')) {
      redirect('/admin/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
