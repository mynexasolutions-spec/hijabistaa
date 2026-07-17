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
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PakistaniEditBanner from "@/components/PakistaniEditBanner";
import PromoPopup from "@/components/PromoPopup";
import { createClient } from "@/lib/supabase/server";
import { getHeroSlides, getHeroText } from "@/actions/admin/hero";
import { getPromoPopupSettings } from "@/actions/admin/homeBanner";


// In-memory cache for ultra-fast page rendering during local dev & production
let homeCache: {
  timestamp: number;
  data: any;
} | null = null;
const CACHE_TTL_MS = 1000; // 1 second cache for immediate reflection of admin updates

async function safeQuery(promise: Promise<any>, fallback: any, timeoutMs = 2500) {
  try {
    const res = await Promise.race([
      promise,
      new Promise<{ data: any }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase query timeout")), timeoutMs)
      ),
    ]);
    return res.data || fallback;
  } catch (e) {
    return fallback;
  }
}

export default async function Home() {
  // Return cached data immediately if within TTL to prevent network bottleneck
  if (homeCache && Date.now() - homeCache.timestamp < CACHE_TTL_MS) {
    return renderHomePage(homeCache.data);
  }

  const supabase = await createClient();

  // Parallelize independent queries with safe timeout limits
  const [
    heroSlides,
    heroText,
    categoriesData,
    allProducts,
    products,
    salwarKameezProducts,
    testimonials,
    promoPopupSettings
  ] = await Promise.all([
    getHeroSlides().then(slides => slides.filter((s: any) => s.is_active)),
    getHeroText(),
    safeQuery(
      supabase.from("categories").select("*").eq("is_active", true),
      []
    ),
    safeQuery(
      supabase.from("products").select("category_id, color_group_id").eq("is_active", true),
      []
    ),
    safeQuery(
      supabase.from("products").select(`
        id, name, slug, category_id, is_featured, is_active, color_group_id, badge,
        product_images ( image_url ),
        product_variants ( price, original_price )
      `).eq("is_active", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(4),
      []
    ),
    safeQuery(
      supabase.from("products").select(`
        id, name, price, oldPrice, badge, rating, featured_image_url, color_group_id,
        product_images ( image_url ),
        product_variants ( price, original_price )
      `).eq("category_id", "salwar_kameez").eq("is_active", true).order("created_at", { ascending: false }).limit(4),
      []
    ),
    safeQuery(
      supabase.from("testimonials").select("*").eq("is_active", true).order("display_order", { ascending: true }),
      undefined
    ),
    getPromoPopupSettings()
  ]);

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
    name: p.name,
    category_id: p.category_id,
    image_url: p.product_images?.[0]?.image_url || p.featured_image_url || p.image_url || p.image || "/image.png",
    price: p.product_variants?.[0]?.price || p.price || 0,
    oldPrice: p.product_variants?.[0]?.original_price || p.oldPrice || undefined,
    badge: p.badge,
    rating: p.rating || 5,
    colorCount: p.color_group_id ? colorGroupCounts[p.color_group_id] || 1 : 1,
  }));

  const formattedSalwarKameez = (salwarKameezProducts || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    image_url: p.product_images?.[0]?.image_url || p.featured_image_url || p.image_url || p.image || "/luxe-salwar-kameez.png",
    price: p.product_variants?.[0]?.price || p.price || 0,
    oldPrice: p.product_variants?.[0]?.original_price || p.oldPrice || undefined,
    badge: p.badge,
    rating: p.rating || 5,
    colorCount: p.color_group_id ? colorGroupCounts[p.color_group_id] || 1 : 1,
  }));

  const data = {
    heroSlides,
    heroText,
    categories,
    formattedProducts,
    formattedSalwarKameez,
    testimonials,
    promoPopupSettings
  };

  homeCache = {
    timestamp: Date.now(),
    data
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
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
