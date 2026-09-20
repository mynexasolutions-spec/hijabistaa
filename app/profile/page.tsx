import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileManager from './_components/ProfileManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Profile | HIJABISTA',
  description: 'Manage your shipping address, contact details, and order tracking.',
}

export default async function CustomerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  
  let adminProfile = null
  let orders = []
  if (user) {
    // Reads use the service-role client: OTP-based customer logins are validated
    // via our own "hijabistaa-user-session" cookie, not a real Supabase Auth JWT,
    // so auth.uid() is NULL for these requests and the anon-key client's RLS
    // policies ("auth.uid() = id") would silently return zero rows here.
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: address } = await adminClient
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (profile) {
      adminProfile = {
        ...profile,
        phone: profile.phone || address?.phone || '',
        alternatePhone: address?.alternate_phone || '',
        street: address?.address_line_1 || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.postal_code || '',
      }
    }

    const { getUserOrdersAction } = await import('@/actions/orders')
    const ordersRes = await getUserOrdersAction()
    if (ordersRes.success) {
      orders = ordersRes.orders
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-8">
            <div className="eyebrow justify-center inline-flex items-center gap-2">
              <span className="h-px w-6 bg-gold" />
              Customer Account
              <span className="h-px w-6 bg-gold" />
            </div>
            <h1 className="section-heading mt-3">My Profile</h1>
            <p className="section-sub mt-2">
              Manage your default shipping address and order details for quicker checkouts.
            </p>
          </div>

          <ProfileManager adminProfile={adminProfile} orders={orders} initialTab={tab === 'profile' ? 'profile' : 'orders'} />
        </div>
      </main>
      <Footer />
    </>
  )
}
