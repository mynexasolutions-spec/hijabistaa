import { createClient } from '@/lib/supabase/server'
import { OrderListTable } from './_components/OrderListTable'
import { SyncAllShiprocketButton } from './_components/SyncAllShiprocketButton'

export const metadata = {
  title: 'Orders | Admin Dashboard',
}

export default async function AdminOrdersPage() {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  // Fetch all orders with user profile info
  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      *,
      customers:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  const orders = rawOrders?.filter((order: any) => {
    if (order.payment_method === 'COD' || order.payment_method === 'Cash on Delivery') {
      return true
    }
    return order.payment_status === 'paid'
  }) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-sm text-stone-500 mt-1">Manage and track all store orders.</p>
        </div>
        <SyncAllShiprocketButton />
      </div>

      <OrderListTable initialOrders={orders} />
    </div>
  )
}

