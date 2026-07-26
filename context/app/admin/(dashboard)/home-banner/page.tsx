import { getPromoPopupSettings } from '@/actions/admin/homeBanner'
import { PromoPopupManager } from './_components/PromoPopupManager'

export const metadata = {
  title: 'Promo Popup & Coupon | Admin Dashboard',
}

export default async function AdminHomeBannerPage() {
  const promoSettings = await getPromoPopupSettings()

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Promo Popup & Discount Coupon</h1>
        <p className="text-sm text-stone-500 mt-1">
Manage the promotional popup shown on homepage visits and refreshes.        </p>
      </div>

      <PromoPopupManager initialSettings={promoSettings} />
    </div>
  )
}

