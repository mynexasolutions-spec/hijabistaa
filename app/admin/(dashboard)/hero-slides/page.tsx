import { getHeroSlides, getHeroText } from '@/actions/admin/hero'
import { HeroSlideList } from './_components/HeroSlideList'
import { HeroTextEditor } from './_components/HeroTextEditor'

export const metadata = {
  title: 'Hero Section | Admin Dashboard',
}

export default async function AdminHeroSlidesPage() {
  const [slides, heroText] = await Promise.all([
    getHeroSlides(),
    getHeroText()
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hero Section Management</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage the typography, tagline, and rotating background slides for the storefront homepage.
          </p>
        </div>
      </div>

      <div className="w-full">
        <HeroTextEditor initialText={heroText} />
      </div>

      <div className="w-full">
        <HeroSlideList 
          initialSlides={slides} 
          position="global"
          title="All Homepage Rotating Slides"
        />
      </div>
    </div>
  )
}
