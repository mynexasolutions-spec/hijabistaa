import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getVerifiedSession } from '@/lib/session'
import AdminShell, { MobileMenuButton } from '@/components/admin/AdminShell'
import AdminHeader from '@/components/admin/Header'

export const dynamic = 'force-dynamic'
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  // Signature-verified session only (null if the cookie was tampered with)
  const mockUser = await getVerifiedSession(cookieStore)

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
    <AdminShell header={<AdminHeader leading={<MobileMenuButton />} />}>
      {children}
    </AdminShell>
  )
}
