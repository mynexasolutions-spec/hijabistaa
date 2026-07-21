import Header from '@/components/Header'
import Footer from '@/components/Footer'
import OrderTrackerClient from './_components/OrderTrackerClient'

export const metadata = {
  title: 'Track Order & Order History | HIJABISTA',
  description: 'Track your HIJABISTA order status in real-time or view your past order history.',
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string; contact?: string }>
}) {
  const resolvedParams = await searchParams
  const initialOrderNumber = resolvedParams?.orderNumber || ''
  const initialContact = resolvedParams?.contact || ''

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="eyebrow justify-center inline-flex items-center gap-2">
              <span className="h-px w-6 bg-gold" />
              Customer Support
              <span className="h-px w-6 bg-gold" />
            </div>
            <h1 className="section-heading mt-3">Order Tracking &amp; History</h1>
            {/* <p className="section-sub mt-2">
              Stay updated on your shipment progress or review your previous purchase history.
            </p> */}
          </div>

          <OrderTrackerClient
            initialOrderNumber={initialOrderNumber}
            initialContact={initialContact}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
