import { getAdminInstagramPosts } from '@/actions/admin/instagram'
import { InstagramPostsList } from './_components/InstagramPostsList'

export const metadata = {
  title: 'Instagram Gallery | Admin Dashboard',
}

export default async function AdminInstagramPage() {
  const posts = await getAdminInstagramPosts()

  return <InstagramPostsList initialPosts={posts} />
}
