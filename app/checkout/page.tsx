import { getShippingSettings } from '@/actions/admin/shipping'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutForm from './_components/CheckoutForm'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Secure Checkout | HIJABISTA',
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const { payment } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const shipping = await getShippingSettings()

  // Saved name/phone/address for logged-in customers. Read with the service-role
  // client filtered to the verified user's own id: the custom-cookie login has no
  // Supabase Auth session, so the browser (anon key) can't read these RLS tables.
  let initialProfile: {
    fullName: string; email: string; phone: string; alternatePhone: string
    street: string; city: string; state: string; zipCode: string
  } | null = null

  if (user) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const admin = createAdminClient()
      const [{ data: customer }, { data: address }] = await Promise.all([
        admin.from('customers').select('full_name, phone').eq('id', user.id).maybeSingle(),
        admin
          .from('addresses')
          .select('phone, alternate_phone, address_line_1, city, state, postal_code')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])
      initialProfile = {
        fullName: customer?.full_name || '',
        email: user.email || '',
        phone: address?.phone || customer?.phone || '',
        alternatePhone: address?.alternate_phone || '',
        street: address?.address_line_1 || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.postal_code || '',
      }
    } catch (e) {
      console.error('Failed to load saved checkout profile:', e)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">
          <CheckoutForm shipping={shipping} isLoggedIn={!!user} initialProfile={initialProfile} paymentFailed={payment === 'failed'} />
        </div>
      </main>
      <Footer />
    </>
  )
}
