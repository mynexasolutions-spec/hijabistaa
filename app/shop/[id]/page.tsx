import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetailActions from './_components/ProductDetailActions'
import ProductGallery from './_components/ProductGallery'
import ProductReviews from './_components/ProductReviews'
import Products from '@/components/Products'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from "@/lib/supabase/server"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  let productData: any = null;

  // Try fetching by ID first
  try {
    const { data } = await supabase
      .from("products")
      .select(`
        id, name, slug, category_id, is_active, badge, rating, short_description, description, featured_image_url,
        product_images ( image_url ),
        product_variants ( id, variant_name, price, original_price, stock_quantity ),
        product_information ( label, value, display_order ),
        product_faqs ( question, answer, display_order )
      `)
      .eq("id", id)
      .single();
    if (data) productData = data;
  } catch (e) {
    console.error("Error fetching product by ID:", e);
  }

  // Fallback to slug if not found by ID
  if (!productData) {
    try {
      const { data: slugProduct } = await supabase
        .from("products")
        .select(`
          id, name, slug, category_id, is_active, badge, rating, short_description, description, featured_image_url,
          product_images ( image_url ),
          product_variants ( id, variant_name, price, original_price, stock_quantity ),
          product_information ( label, value, display_order ),
          product_faqs ( question, answer, display_order )
        `)
        .eq("slug", id)
        .single();
      if (slugProduct) productData = slugProduct;
    } catch (e) {
      console.error("Error fetching product by slug:", e);
    }
  }

  // Fallback to static lib/data if not found in Supabase
  
  // Safely attempt to fetch use_global_faqs so missing column doesn't break everything
  if (productData) {
    try {
      const { data: flagData } = await supabase
        .from("products")
        .select("use_global_faqs")
        .eq("id", productData.id)
        .single();
      if (flagData) {
        productData.use_global_faqs = flagData.use_global_faqs;
      }
    } catch (e) {
      // Column might not exist yet, ignore
    }
  }

  if (!productData || !productData.is_active) {
    const { products } = await import('@/lib/data');
    const allStatic = [...products];
    const staticProduct = allStatic.find(
      (p) => p.id === id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id.toLowerCase()
    ) || allStatic[0];

    if (staticProduct) {
      productData = {
        id: staticProduct.id || id,
        name: staticProduct.name || "Modest Silhouette Style",
        slug: id,
        category_id: (staticProduct as any).category?.toLowerCase() || 'hijabs',
        is_active: true,
        badge: staticProduct.badge || "Featured",
        rating: staticProduct.rating || 4.9,
        short_description: `Essential luxury ${staticProduct.name} crafted for exceptional comfort, graceful coverage, and modern elegance.`,
        description: `Discover the unmatched drape and supreme softness of our ${staticProduct.name}. Carefully designed with breathable fabric and superior stitching to ensure a comfortable fit and lasting durability throughout the day.`,
        fabric: "Premium Modest Chiffon / Silk Blend",
        stitching: "Precision reinforced stitching",
        featured_image_url: staticProduct.image || "/hijab-medina.jpg",
        product_images: [{ image_url: staticProduct.image || "/hijab-medina.jpg" }],
        product_variants: [{
          id: `${staticProduct.id || id}-default`,
          variant_name: "Standard Size",
          price: staticProduct.price || 1499,
          original_price: staticProduct.oldPrice || 1899,
          stock_quantity: 50
        }],
        product_information: [
          { label: "Care Instructions", value: "Gentle hand wash or dry clean recommended", display_order: 1 },
          { label: "Origin", value: "Crafted with love for modern Hijabistas", display_order: 2 }
        ],
        product_faqs: [
          { question: "Is this material non-slip?", answer: "Yes! Our fabric has a subtle texture engineered to stay securely in place without slipping.", display_order: 1 },
          { question: "How fast is shipping?", answer: "We process and dispatch orders within 24-48 hours with insured tracking.", display_order: 2 }
        ]
      };
    }
  }

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", productData.category_id)
    .single();

  const categoryName = category?.name || productData.category_id;

  // Compile image array
  let images: string[] = []
  if (productData.product_images && productData.product_images.length > 0) {
    images = productData.product_images.map((img: any) => img.image_url)
  } else if (productData.featured_image_url) {
    images = [productData.featured_image_url]
  }
  if (images.length === 0) {
    images = ["/image.png"]
  }

  // Compile information
  let information = productData.product_information || []
  if (productData.fabric) {
    information.push({ label: 'Fabric Details', value: productData.fabric, display_order: -2 })
  }
  if (productData.stitching) {
    information.push({ label: 'Stitching Details', value: productData.stitching, display_order: -1 })
  }
  

  information.sort((a: any, b: any) => a.display_order - b.display_order)

  let faqs = productData.product_faqs || []
  
  if (productData.use_global_faqs) {
    try {
      const { data: globalFaqs } = await supabase
        .from("global_faqs")
        .select("question, answer, display_order")
        .order("display_order", { ascending: true })
      
      if (globalFaqs && globalFaqs.length > 0) {
        faqs = globalFaqs
      }
    } catch (e) {
      console.error("Error fetching global FAQs:", e)
    }
  }
  faqs.sort((a: any, b: any) => a.display_order - b.display_order)

  // Filter out inactive or out-of-stock variants if we want to be strict,
  // but let's just pass them down and disable out-of-stock ones
  const variants = productData.product_variants || []

  // Fetch other colors of this same design (color group)
  let colorOptions: any[] = []
  if (productData.color_group_id) {
    try {
      const { data: colorGroupProducts } = await supabase
        .from("products")
        .select(`
          id, name, color_name, color_hex, featured_image_url,
          product_images ( image_url )
        `)
        .eq("color_group_id", productData.color_group_id)
        .eq("is_active", true)
        .order("created_at", { ascending: true })

      colorOptions = (colorGroupProducts || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        color_name: p.color_name,
        color_hex: p.color_hex,
        image_url: p.product_images?.[0]?.image_url || p.featured_image_url || "/image.png",
      }))
    } catch (e) {
      console.error("Error fetching color options:", e);
    }
  }

  // Fetch similar products
  let similarProductsData: any[] = [];
  try {
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, category_id, is_active, badge, rating, featured_image_url,
        product_images ( image_url ),
        product_variants ( price, original_price )
      `)
      .eq("is_active", true)
      .eq("category_id", productData.category_id)
      .limit(4);

    if (productData.id) {
      query = query.neq("id", productData.id);
    }
    const res = await query;
    similarProductsData = res.data || [];
  } catch (e) {
    console.error("Error fetching similar products:", e);
  }

  const similarProducts = similarProductsData.map((p: any) => ({
    id: p.id,
    name: p.name,
    category_id: p.category_id,
    image_url: p.featured_image_url || (p.product_images?.[0]?.image_url) || "/image.png",
    badge: p.badge,
    price: Number(p.product_variants?.[0]?.price || p.price || 1499) || 1499,
    oldPrice: p.product_variants?.[0]?.original_price || p.oldPrice || undefined
  }));

  // Fetch Reviews safely from both Supabase and lib/db.json so they never disappear on refresh
  let reviews: any[] = [];
  if (productData.id) {
    try {
      let sbReviews: any[] = [];
      const { data: reviewsData, error: revErr } = await supabase
        .from('reviews')
        .select(`
          id, rating, comment, created_at, is_approved, user_id,
          profiles:user_id ( full_name )
        `)
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false });
      
      if (!revErr && reviewsData) {
        sbReviews = reviewsData;
      } else {
        // Fallback without relationship join if foreign key not recognized by PostgREST cache
        const { data: simpleReviews } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, is_approved, user_id')
          .eq('product_id', productData.id)
          .order('created_at', { ascending: false });
        if (simpleReviews) sbReviews = simpleReviews;
      }

      const formattedSb = sbReviews
        .filter((r: any) => r.is_approved !== false)
        .map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at || new Date().toISOString(),
          profiles: { full_name: r.profiles?.full_name || 'Verified Customer' }
        }));

      // Combine with local reviews from lib/db.json
      let localReviews: any[] = [];
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dbPath = path.join(process.cwd(), 'lib', 'db.json');
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (Array.isArray(dbData.reviews)) {
          localReviews = dbData.reviews
            .filter((r: any) => r.product_id === productData.id && r.is_approved !== false)
            .map((r: any) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at || new Date().toISOString(),
              profiles: { full_name: r.customer_name || 'Verified Customer' }
            }));
        }
      } catch (localErr) {}

      // Deduplicate by ID and sort newest first
      const allMap = new Map();
      [...formattedSb, ...localReviews].forEach(r => {
        if (r && r.id && !allMap.has(r.id)) {
          allMap.set(r.id, r);
        }
      });
      reviews = Array.from(allMap.values()).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (e) {
      console.error("Error fetching reviews:", e);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-ink/50 font-medium mb-8">
            <Link href="/" className="hover:text-emerald transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-emerald transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/shop?category=${productData.category_id}`} className="hover:text-emerald transition-colors capitalize">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink font-semibold truncate max-w-[200px]">{productData.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Product Image Gallery */}
            <ProductGallery images={images} productName={productData.name} badge={productData.badge} />

            {/* Right: Product Details & Purchase Form */}
            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold font-bold">
                  {categoryName}
                </span>
                <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink mt-2 leading-tight">
                  {productData.name}
                </h1>
                
                {productData.rating && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
                    <div className="flex text-gold">★★★★★</div>
                    <span className="font-semibold text-ink">{productData.rating} ★</span>
                    <span className="text-ink/30">|</span>
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Color Options */}
              {colorOptions.length > 1 && (
                <div>
                  <p className="text-[13px] uppercase tracking-wider font-bold text-ink/70 mb-3">
                    Color{productData.color_name ? ` — ${productData.color_name}` : ''}
                    <span className="ml-1.5 font-semibold normal-case text-emerald">
                      ({colorOptions.length} colors available)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((c) => (
                      <Link
                        key={c.id}
                        href={`/shop/${c.id}`}
                        title={c.color_name || c.name}
                        className={`relative w-11 h-11 rounded-full border-2 overflow-hidden shrink-0 transition-all ${
                          c.id === productData.id
                            ? 'border-emerald scale-110 shadow-sm'
                            : 'border-cream-line hover:border-emerald/50'
                        }`}
                        style={{ backgroundColor: c.color_hex || '#E6DAC4' }}
                      >
                        <span className="sr-only">{c.color_name || c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Actions client-side wrapper (includes dynamic price and Add to cart) */}
              <ProductDetailActions 
                product={{
                  id: productData.id,
                  name: productData.name,
                  image_url: images[0] || "/image.png",
                  category_name: categoryName,
                  variants: variants
                }}
              />

              {productData.short_description && (
                <div className="font-body text-ink/80 text-lg leading-relaxed pt-2">
                  <p>{productData.short_description}</p>
                </div>
              )}

              {/* Information, Description & FAQs */}
              <div className="space-y-4 pt-6 border-t border-cream-line/50">
                {/* Product Specifications */}
                {information.length > 0 && (
                  <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors" open>
                    <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                      Product Specifications
                      <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                        <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
                      </span>
                    </summary>
                    <div className="px-3 md:px-3 lg:px-5 pb-5 pt-2 border-t border-cream-line/50">
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {information.map((info: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-cream-line shadow-sm">
                            <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">{info.label}</p>
                            <p className="text-sm font-semibold text-emerald mt-1">{info.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )}

                <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors">
                  <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                    Product Details
                    <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                      <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-ink/70 text-sm leading-relaxed border-t border-cream-line/50 mx-5 pt-3 whitespace-pre-wrap">
                    {productData.description || "Discover the unmatched drape and supreme softness of our Basic Luxe Chiffon Hijab — Medina. Carefully designed with breathable fabric and superior stitching to ensure a comfortable fit and lasting durability throughout the day."}
                  </div>
                </details>

                {faqs.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-display font-semibold text-xl text-ink mb-4">Common Questions</h3>
                    <div className="space-y-3">
                      {faqs.map((faq: any, idx: number) => (
                        <details key={idx} className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors">
                          <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                            {faq.question}
                            <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                          </summary>
                          <div className="px-5 pb-5 text-ink/70 text-sm leading-relaxed border-t border-cream-line/50 mx-5 pt-3">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-cream-line">
            <Products
              products={similarProducts}
              categories={[{ id: productData.category_id, name: categoryName }]}
              title="You might also like"
              subtitle="Explore similar styles from this collection."
            />
          </div>
        )}

        {/* Product Reviews */}
        <section className="mt-2 pt-6 border-t border-cream-line bg-cream">
          <div className="max-w-wrap mx-auto px-5 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="eyebrow justify-center inline-flex items-center gap-2">
                <span className="h-px w-6 bg-gold" />
                Customer Voices
                <span className="h-px w-6 bg-gold" />
              </div>
              <h2 className="section-heading mt-4">Ratings &amp; Reviews</h2>
            </div>
            <ProductReviews productId={productData.id} productName={productData.name} initialReviews={reviews} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
