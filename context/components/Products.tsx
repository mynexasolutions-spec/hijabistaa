"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Reveal from "./Reveal";
import { SITE } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug?: string;
  category_id: string;
  image_url: string;
  badge?: string;
  rating?: number;
  price: number;
  oldPrice?: number;
  colorCount?: number;
  reviewCount?: number;
}

interface Category {
  id: string;
  name: string;
}

function formatINR(n: any) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

export default function Products({ 
  products = [], 
  categories = [],
  title = "This season's favourites",
  subtitle = "A curated edit from our latest drop — message us on WhatsApp for sizing, fabric notes or a custom order.",
  isHomePage = false
}: { 
  products?: Product[], 
  categories?: Category[],
  title?: string,
  subtitle?: string,
  isHomePage?: boolean
}) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  return (
    <section id="products" className="relative pt-2 md:pt-3 pb-2 md:pb-3 bg-cream">
      <div className="max-w-wrap mx-auto px-5 md:px-8 py-3">
        {isHomePage ? (
          <Reveal className="text-center max-w-xl mx-auto">
            <div className="eyebrow justify-center inline-flex items-center gap-2">
              <span className="h-px w-6 bg-gold" />
              Featured Products
              <span className="h-px w-6 bg-gold" />
            </div>
            <h2 className="section-heading mt-4">{title}</h2>
            <p className="section-sub mt-4">
              {subtitle}
            </p>
          </Reveal>
        ) : (
          <>
            <Reveal className="text-center w-full mb-4">
              <div className="eyebrow justify-center inline-flex items-center gap-2">
                <span className="h-px w-6 bg-gold" />
                Featured Products
                <span className="h-px w-6 bg-gold" />
              </div>
            </Reveal>

            <Reveal className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-0">
              <div className="text-center md:text-left max-w-xl w-full">
                <h2 className="section-heading">{title}</h2>
                <p className="section-sub mt-2">
                  {subtitle}
                </p>
              </div>
              <div className="shrink-0 self-center md:self-auto">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-emerald text-cream font-body font-semibold text-[15px] tracking-wide shadow-card hover:bg-emerald-deep transition-colors"
                >
                  View Full Catalogue
                </Link>
              </div>
            </Reveal>
          </>
        )}
        <div className={`mt-12 flex flex-wrap single-t1 gap-4 md:gap-6 ${isHomePage ? 'justify-center' : 'justify-start'}`}>
          {products.slice(0, isHomePage ? 4 : 10).map((p, i) => {
            const categoryName = categories.find(c => c.id === p.category_id)?.name || p.category_id || "Uncategorized";
            return (
              <Reveal key={p.id} delay={(i % 5) as any} className={isHomePage ? "flex-none w-[calc(50%-0.5rem)] md:w-[calc(34.833%-1rem)] lg:w-[calc(21.5%-1.2rem)]" : "flex-none w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)]"}>
                <div className="lift group bg-[#FAF7F2] rounded-2xl md:rounded-[20px] p-2.5 md:p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md border border-cream-line/80 h-full flex flex-col transition-all duration-300">
                  <div className="relative aspect-[4/4] rounded-xl bg-cream-deep/20 block shrink-0">
                    <Link href={`/shop/${p.slug || p.id}`} className="absolute inset-0 overflow-hidden rounded-xl z-0">
                      <Image
                        src={p.image_url || (p as any).image || "/image.png"}
                        alt={p.name || "Product"}
                        fill
                        sizes="(max-width: 768px) 50vw, 320px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </Link>
                    {p.badge && (
                      <span className="absolute top-[5px] right-[2%] z-10 bg-[#6E3416] text-white text-[9px] md:text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-xl shadow-sm pointer-events-none">
                        {p.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (isInWishlist(p.id)) {
                          removeFromWishlist(p.id)
                        } else {
                          addToWishlist({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            oldPrice: p.oldPrice,
                            image_url: p.image_url,
                            category_id: p.category_id,
                            badge: p.badge,
                            rating: p.rating || 5,
                            reviewCount: p.reviewCount ?? 0,
                          })
                        }
                      }}
                      className="absolute top-2 left-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-ink/60 hover:text-[#C84B31] hover:bg-white transition-all shadow-sm"
                      aria-label={isInWishlist(p.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(p.id) ? "fill-[#C84B31] text-[#C84B31]" : ""}`} />
                    </button>
                  </div>
                  <div className="flex flex-col flex-1 pt-3 px-0.5">
                    <div className="flex-1">
                      <Link href={`/shop/${p.slug || p.id}`} className="hover:text-emerald transition-colors block">
                        <h3 className="font-display font-medium text-ink text-[14px] md:text-[15.5px] leading-snug line-clamp-2">
                          {p.name}
                        </h3>
                      </Link>
                      {p.colorCount && p.colorCount > 1 && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald">
                          {p.colorCount} colors available
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display font-bold text-ink text-[15px] md:text-[16px]">
                        {formatINR(p.price)}
                      </span>
                      {p.oldPrice && (
                        <span className="text-ink/40 text-[12.5px] md:text-[13px] line-through font-normal">
                          {formatINR(p.oldPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex items-center text-[#B8622A] text-[13px] tracking-tight gap-0.5">
                        {"★".repeat(5)}
                      </div>
                      <span className="text-ink/55 text-[12px] font-medium">
                        ({p.reviewCount ?? 0})
                      </span>
                    </div>
                    <div className="mt-3.5 grid grid-cols-1 gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image_url: p.image_url,
                            category_name: categoryName
                          });
                        }}
                        className="w-full text-center rounded-lg border border-[#DECDBE] bg-white text-[#5C3317] text-[13px] md:text-sm font-semibold py-2 hover:bg-[#F9F6F0] hover:border-[#D0BCAC] transition-all flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      >
                        <svg className="w-4 h-4 text-[#5C3317]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Add to cart</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image_url: p.image_url,
                            category_name: categoryName
                          });
                          router.push('/checkout');
                        }}
                        className="w-full text-center rounded-lg bg-[#6E3416] text-white text-[13px] md:text-sm font-semibold py-2 hover:bg-[#5A2910] transition-all flex items-center justify-center shadow-sm"
                      >
                        <span>Buy now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {isHomePage && (
          <Reveal className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-emerald text-cream font-body font-semibold text-[15px] tracking-wide shadow-card hover:bg-emerald-deep transition-colors"
            >
              View Full Catalogue
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
