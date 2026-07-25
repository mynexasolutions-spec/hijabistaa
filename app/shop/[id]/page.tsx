import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetailSection from './_components/ProductDetailSection'
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
        id, name, slug, category_id, is_active, badge, rating, price, oldPrice, short_description, description, featured_image_url, size,
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
          id, name, slug, category_id, is_active, badge, rating, price, oldPrice, short_description, description, featured_image_url, size,
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

  // Safely attempt to fetch size from Supabase so missing column in schema cache doesn't break product fetching
  if (productData) {
    try {
      const { data: sizeData } = await supabase
        .from("products")
        .select("size")
        .eq("id", productData.id)
        .single();
      if (sizeData && sizeData.size !== undefined && sizeData.size !== null) {
        productData.size = sizeData.size;
      }
    } catch (e) {
      // Column might not exist in Supabase schema cache yet, ignore
    }
  }

  // Check lib/db.json fallback for size ONLY if size was never set or defined
  if (productData && productData.size === undefined) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const fileData = fs.readFileSync(dbPath, 'utf8')
        const json = JSON.parse(fileData)
        if (Array.isArray(json.products)) {
          const dbProd = json.products.find((p: any) => p.id === productData.id || p.slug === productData.slug)
          if (dbProd && dbProd.size !== undefined && dbProd.size !== null) {
            productData.size = dbProd.size
          }
        }
      }
    } catch (e) {}
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
        size: (staticProduct as any).size || "",
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

  // Compile designs
  let productDesigns: string[] = []
  if (information.length > 0) {
    productDesigns = information
      .filter((info: any) => info.label === 'Design')
      .map((info: any) => info.value)
  }

  // db.json fallback for designs and information if empty
  if (productDesigns.length === 0) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
        if (Array.isArray(json.product_information)) {
          const localDesigns = json.product_information
            .filter((pi: any) => pi.product_id === productData.id && pi.label === 'Design')
            .map((pi: any) => pi.value)
          if (localDesigns.length > 0) {
            productDesigns = localDesigns
          }
          
          if (information.length === 0) {
            const localInfo = json.product_information.filter((pi: any) => pi.product_id === productData.id && pi.label !== 'Design')
            information = localInfo
          }
        }
      }
    } catch (e) {}
  }

  // Remove designs from the general information tab
  information = information.filter((info: any) => info.label !== 'Design')

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

  // Compile product variants (with lib/db.json fallback)
  let variants = productData.product_variants || []
  if (variants.length === 0 && productData.id) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'lib', 'db.json')
      if (fs.existsSync(dbPath)) {
        const json = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
        if (Array.isArray(json.product_variants)) {
          const localVars = json.product_variants.filter((pv: any) => pv.product_id === productData.id)
          if (localVars.length > 0) {
            variants = localVars
          }
        }
      }
    } catch (e) {}
  }

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

  // Fetch Color Variants for this product
  let productColors: any[] = []
  if (productData && productData.id) {
    try {
      const { data: cols } = await supabase
        .from("product_colors")
        .select("id, color_name, color_hex, images, stock_quantity, display_order")
        .eq("product_id", productData.id)
        .order("display_order", { ascending: true });

      if (cols && cols.length > 0) {
        productColors = cols;
      }
    } catch (e) {
      console.error("Error fetching product_colors from Supabase:", e);
    }

    if (productColors.length === 0) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dbPath = path.join(process.cwd(), 'lib', 'db.json');
        if (fs.existsSync(dbPath)) {
          const fileData = fs.readFileSync(dbPath, 'utf8');
          const json = JSON.parse(fileData);
          if (Array.isArray(json.product_colors)) {
            const localCols = json.product_colors.filter((pc: any) => pc.product_id === productData.id);
            if (localCols.length > 0) {
              productColors = localCols;
            }
          }
        }
      } catch (e) {}
    }
  }

  // Fetch similar products
  let similarProductsData: any[] = [];
  try {
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, category_id, is_active, badge, rating, price, oldPrice, featured_image_url,
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
    price: Number(p.product_variants?.[0]?.price || p.price || 0) || 0,
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
          customers:user_id ( full_name )
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
          customers: { full_name: r.customers?.full_name || 'Verified Customer' }
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
              customers: { full_name: r.customer_name || 'Verified Customer' }
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

  // Calculate real-time average rating and total review count
  const reviewCount = reviews.length;
  const avgRatingNumber = reviewCount > 0
    ? reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0) / reviewCount
    : (Number(productData.rating) || 5.0);
  const displayRating = avgRatingNumber.toFixed(1);
  const starCount = Math.min(5, Math.max(1, Math.round(avgRatingNumber)));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8 py-5">

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

          {/* Product Detail Section with dynamic Color Variants & Image Gallery filtering */}
          <ProductDetailSection
            productData={productData}
            categoryName={categoryName}
            displayRating={displayRating}
            starCount={starCount}
            reviewCount={reviewCount}
            images={images}
            variants={variants}
            colorVariants={productColors}
            designs={productDesigns}
            information={information}
            faqs={faqs}
            reviews={reviews}
          />

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
        <section id="reviews" className="mt-2 pt-6 border-t border-cream-line bg-cream scroll-mt-24">
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
