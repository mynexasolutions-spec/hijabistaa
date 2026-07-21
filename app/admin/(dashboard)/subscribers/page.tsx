import { getSubscribers } from '@/actions/admin/subscribers'
import { SubscribersList } from './_components/SubscribersList'

export const metadata = {
  title: 'Subscribers | Admin Dashboard',
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers()

  return <SubscribersList initialSubscribers={subscribers} />
}
