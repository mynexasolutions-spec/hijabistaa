import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustMarquee from "@/components/TrustMarquee";
import Story from "@/components/Story";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import LuxeSalwarKameez from "@/components/LuxeSalwarKameez";
import WhyUs from "@/components/WhyUs";
import BrandBanner from "@/components/BrandBanner";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';
import { getHomeProducts } from "@/lib/publicCatalog";
import { getActiveCategories } from "@/actions/categories";
import { getHeroSlides, getHeroText } from "@/actions/admin/hero";
import { getPromoPopupSettings } from "@/actions/admin/homeBanner";
import { getReviewCounts } from "@/actions/reviews";
import PakistaniEditBanner from "@/components/PakistaniEditBanner";
import InstagramGallery from "@/components/InstagramGallery";

const PromoPopup = dynamic(() => import('@/components/PromoPopup'));


export default async function Home() {
  // Public catalogue reads are cached (see lib/publicCatalog.ts) so page views
  // don't each hit Supabase.
  const [
    heroSlides,
    heroText,
    categoriesData,
    homeProducts,
    promoPopupSettings,
    reviewCounts
  ] = await Promise.all([
    getHeroSlides().then(slides => slides.filter((s: any) => s.is_active)),
    getHeroText(),
    getActiveCategories(),
    getHomeProducts().catch(() => ({ all: [], featured: [], salwar: [] })),
    getPromoPopupSettings(),
    getReviewCounts()
  ]);

  const allProducts: any[] = homeProducts.all;
  const products: any[] = homeProducts.featured;
  const salwarKameezProducts: any[] = homeProducts.salwar;

  const productCounts = (allProducts || []).reduce((acc: any, p: any) => {
    acc[p.category_id] = (acc[p.category_id] || 0) + 1;
    return acc;
  }, {});

  const colorGroupCounts = (allProducts || []).reduce((acc: any, p: any) => {
    if (p.color_group_id) acc[p.color_group_id] = (acc[p.color_group_id] || 0) + 1;
    return acc;
  }, {});

  const staticCategories = (await import("@/lib/data")).categories;
  const categories = (categoriesData && categoriesData.length > 0)
    ? categoriesData.map((c: any) => ({
        ...c,
        image_url: c.image_url || c.image || "/hijab-medina.jpg",
        count: `${productCounts[c.id] || 0} styles`
      }))
    : staticCategories.map((c: any) => ({
        ...c,
        image_url: c.image_url || c.image || "/hijab-medina.jpg",
        count: `${productCounts[c.id] || c.count || "12 styles"}`
      }));

  const formattedProducts = (products || []).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category_id: p.category_id,
    image_url: p.product_images?.[0]?.image_url || p.featured_image_url || p.image_url || p.image || "/image.png",
    price: Number(p.product_variants?.[0]?.price || p.price || 0) || 0,
    oldPrice: p.product_variants?.[0]?.original_price || p.oldPrice || undefined,
    badge: p.badge,
    rating: p.rating || 5,
    colorCount: p.color_group_id ? colorGroupCounts[p.color_group_id] || 1 : 1,
    reviewCount: reviewCounts[p.id] || 0,
  }));

  const formattedSalwarKameez = (salwarKameezProducts || []).map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image_url: p.product_images?.[0]?.image_url || p.featured_image_url || p.image_url || p.image || "/luxe-salwar-kameez.png",
    price: Number(p.product_variants?.[0]?.price || p.price || 0) || 0,
    oldPrice: p.product_variants?.[0]?.original_price || p.oldPrice || undefined,
    badge: p.badge,
    rating: p.rating || 5,
    colorCount: p.color_group_id ? colorGroupCounts[p.color_group_id] || 1 : 1,
    reviewCount: reviewCounts[p.id] || 0,
  }));

  const staticTestimonials = (await import("@/lib/data")).testimonials;

  const data = {
    heroSlides,
    heroText,
    categories,
    formattedProducts,
    formattedSalwarKameez,
    testimonials: staticTestimonials,
    promoPopupSettings
  };
  return renderHomePage(data);
}

function renderHomePage({
  heroSlides,
  heroText,
  categories,
  formattedProducts,
  formattedSalwarKameez,
  testimonials,
  promoPopupSettings
}: any) {
  return (
    <main className="overflow-x-hidden relative">
      <PromoPopup settings={promoPopupSettings} />
      <Header />
      <Hero slides={heroSlides || []} heroText={heroText} />
      <TrustMarquee />
      <Categories categories={categories || []} />
      <Products products={formattedProducts || []} categories={categories || []} isHomePage={true} />
      <PakistaniEditBanner />
      <LuxeSalwarKameez products={formattedSalwarKameez || []} />
      <WhyUs />
      <BrandBanner />
      <Story />
      <Testimonials testimonials={testimonials || undefined} />
      <InstagramGallery />
      <Footer />
    </main>
  );
}
