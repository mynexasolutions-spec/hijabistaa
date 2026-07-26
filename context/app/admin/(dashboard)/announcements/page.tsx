import { getAnnouncementBannerSettings } from '@/actions/admin/announcements'
import { AnnouncementForm } from './_components/AnnouncementForm'

export const metadata = {
  title: 'Announcements | Admin Dashboard',
}

export default async function AdminAnnouncementsPage() {
  const config = await getAnnouncementBannerSettings()

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Announcement Banner Management</h1>
        <p className="text-sm text-stone-500 mt-1">
          Design and manage the premium sticky announcement banner that appears at the top of the storefront.
        </p>
      </div>

      <AnnouncementForm initialConfig={config} />
    </div>
  )
}
