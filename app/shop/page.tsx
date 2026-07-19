import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShopGrid from './_components/ShopGrid'
import { createClient } from "@/lib/supabase/server";
import Image from 'next/image'

export const metadata = {
  title: 'Shop Collection | HIJABISTA',
  description: 'Browse our complete premium collection of modest hijabs, scarves, jilbabs and essentials.',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; featured?: string }
}) {
  const supabase = await createClient();

  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.search || '';
  const featuredOnly = resolvedSearchParams.featured === 'true';

  let productsQuery = supabase
    .from("products")
    .select(`
      id, name, slug, category_id, is_active, badge, rating, price, oldPrice, featured_image_url, color_group_id, created_at,
      product_images ( image_url ),
      product_variants ( price, original_price )
    `)
    .eq("is_active", true)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    productsQuery = productsQuery.ilike('name', `%${searchQuery}%`);
  }

  if (featuredOnly) {
    productsQuery = productsQuery.eq('is_featured', true);
  }

  const { data: productsData } = await productsQuery;

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true);

  const colorGroupCounts = (productsData || []).reduce((acc: any, p: any) => {
    if (p.color_group_id) acc[p.color_group_id] = (acc[p.color_group_id] || 0) + 1;
    return acc;
  }, {});

  const products = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    image_url: p.product_images?.[0]?.image_url || p.featured_image_url || "/image.png",
    price: p.product_variants?.[0]?.price || p.price || 0,
    oldPrice: p.product_variants?.[0]?.original_price || p.oldPrice || undefined,
    badge: p.badge,
    rating: p.rating || 5,
    colorCount: p.color_group_id ? colorGroupCounts[p.color_group_id] || 1 : 1,
  }));

  const categories = (categoriesData && categoriesData.length > 0 && categoriesData.some((c: any) => c.id === "hijab-caps" || c.id === "shawls"))
    ? categoriesData
    : (await import("@/lib/data")).categories;
  const selectedCategory = resolvedSearchParams.category || ''

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 md:pt-[130px]">
        
        {/* Shop Hero Banner */}
        <section className="relative w-full h-[160px] md:h-[220px] bg-gradient-to-br from-cream via-cream-deep to-[#F5ECE0] flex items-center justify-center overflow-hidden border-b border-cream-line">
          <Image
            src="/shop-banner.png"
            alt="Hijabista Collection"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-cream/90 via-cream-deep/60 to-white/90" />
          
          <div className="relative z-10 text-center px-5">
            <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-gold" />
              Complete Collection
              <span className="h-px w-6 bg-gold" />
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-ink tracking-wide">
              Shop the Drop
            </h1>
            <p className="mt-4 text-ink/75 font-body text-sm md:text-base max-w-lg mx-auto">
              Timeless hijabs and modest silhouettes designed with maximum drape, elegance, and comfort.
            </p>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-16">

          <ShopGrid 
            initialProducts={products} 
            categories={categories} 
            selectedCategory={selectedCategory} 
          />

        </div>
      </main>
      <Footer />
    </>
  )
}
