"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Reveal from "./Reveal";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  slug?: string;
  name: string;
  image_url: string;
  badge?: string;
  rating?: number;
  price: number;
  oldPrice?: number;
  colorCount?: number;
  reviewCount?: number;
}

function formatINR(n: number) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

export default function LuxeSalwarKameez({ products = [] }: { products?: Product[] }) {
  const { addToCart } = useCart();
  const router = useRouter();

  if (products.length === 0) return null;

  return (
    <section id="luxe-salwar-kameez" className="relative py-2 md:py-2 bg-[#F9F7F2]">
      <div className="max-w-wrap mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <div className="eyebrow justify-center inline-flex items-center gap-2">
            <span className="h-px w-6 bg-gold" />
            New Arrival
            <span className="h-px w-6 bg-gold" />
          </div>
          <h2 className="section-heading mt-4">
            The <span className="italic text-emerald font-medium">Luxe</span> Salwar Kameez Edit
          </h2>
          <p className="section-sub mt-4">
            Exquisite embroidery, premium lawn and chikankari — a curated edit
            for those who love a statement suit.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-6">
          {products.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={(i % 5) as any} className="flex-none w-[calc(50%-0.5rem)] md:w-[calc(34.833%-1rem)] lg:w-[calc(21.5%-1.2rem)]">
              <div className="lift group bg-[#FAF7F2] rounded-2xl md:rounded-[20px] p-2.5 md:p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md border border-cream-line/80 h-full flex flex-col transition-all duration-300">
                <div className="relative aspect-[4/4.3] rounded-xl bg-cream-deep/20 block shrink-0">
                  <Link href={`/shop/${p.slug || p.id}`} className="absolute inset-0 overflow-hidden rounded-xl z-0">
                    <Image
                      src={p.image_url || (p as any).image || "/luxe-salwar-kameez.png"}
                      alt={p.name || "Salwar Kameez"}
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
                          category_name: "Luxe Salwar Kameez",
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
                          category_name: "Luxe Salwar Kameez",
                        });
                        router.push("/checkout");
                      }}
                      className="w-full text-center rounded-lg bg-[#6E3416] text-white text-[13px] md:text-sm font-bold py-2.5 hover:bg-[#5A2910] transition-all flex items-center justify-center shadow-sm"
                    >
                      <span>Buy now</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Link
            href="/shop?category=salwar_kameez"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gold text-emerald-deep font-body font-semibold text-[15px] tracking-wide shadow-card hover:bg-gold-light transition-colors"
          >
            Shop The Luxe Edit
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
