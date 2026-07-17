"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Reveal from "./Reveal";

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  count?: number | string;
}

// Helper to format style count properly (e.g. "18 Styles", "1 Style")
function formatCount(count?: string | number) {
  if (count === undefined || count === null || count === "") return "0 Styles";
  const str = String(count).trim();
  const match = str.match(/^(\d+)\s*(styles?|items?)?$/i);
  if (match) {
    const num = match[1];
    return `${num} ${Number(num) === 1 ? "Style" : "Styles"}`;
  }
  return str.replace(/\bstyles?\b/i, (m) =>
    m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
  );
}

/* =========================================================================
   Beautiful Line-Art SVG Icons for Modest Fashion Categories
   ========================================================================= */

function AbayaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Hanger top */}
      <path d="M16 3.5c1.2 0 2.2 0.9 2.2 2 0 1.2-1 1.8-2.2 2.5v1.2" />
      <path d="M11 9.2h10l1.2 2.2h-12.4z" />
      {/* Flowing Abaya gown outline */}
      <path d="M12 11.4L7.5 21c-.4.8 0 1.8.8 2l2.2.6-1.5 5h14l-1.5-5 2.2-.6c.8-.2 1.2-1.2.8-2L20 11.4" />
      {/* Center robe opening line */}
      <path d="M16 11.4v17.2" strokeDasharray="2 1.5" />
      {/* Neckline detail */}
      <path d="M14.5 11.4c0 1 .7 1.8 1.5 1.8s1.5-.8 1.5-1.8" />
    </svg>
  );
}

function HijabIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head contour curve */}
      <path d="M16 5c-3.8 0-6.5 3-6.5 7.2 0 2.8 1.2 5.5 2.8 7.6L10.5 27h11l-1.8-7.2c1.6-2.1 2.8-4.8 2.8-7.6C22.5 8 19.8 5 16 5z" />
      {/* Inner face oval outline */}
      <path d="M13 12c0 3 1.3 5.5 3 5.5s3-2.5 3-5.5-1.3-4-3-4-3 1-3 4z" />
      {/* Fabric drape folds across shoulder/chest */}
      <path d="M11.5 18c2 1.8 4.5 2.5 7 2" />
      <path d="M10.5 22.5c3.5 1.5 7.5 1.2 11-.8" />
      <path d="M14 26.5c1.5.5 2.5.5 4 0" />
    </svg>
  );
}

function JilbabIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Overhead Jilbab curve */}
      <path d="M16 4.5c-3.2 0-5.5 2.2-5.5 5.5 0 1.5.5 3 1.5 4.2L6.5 19.5c-.8.6-.6 1.8.3 2.2l3.2 1.4-1 5.4h14l-1-5.4 3.2-1.4c.9-.4 1.1-1.6.3-2.2L20 14.2c1-1.2 1.5-2.7 1.5-4.2 0-3.3-2.3-5.5-5.5-5.5z" />
      {/* Face opening */}
      <path d="M14 10c0 1.6.9 3 2 3s2-1.4 2-3-.9-2.5-2-2.5-2 .9-2 2.5z" />
      {/* Skirt separation line */}
      <path d="M10 23h12" />
      {/* Flowing arm/side lines */}
      <path d="M13 17l1.5 6" />
      <path d="M19 17l-1.5 6" />
    </svg>
  );
}

function KhimarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head top curve & pointed front drape */}
      <path d="M16 5c-3.5 0-6 2.5-6 6 0 2.2 1 4.2 2.5 5.8L16 27l3.5-10.2C21 15.2 22 13.2 22 11c0-3.5-2.5-6-6-6z" />
      {/* Face opening */}
      <path d="M13.5 11c0 2 1.1 3.6 2.5 3.6s2.5-1.6 2.5-3.6-1.1-3-2.5-3-2.5 1-2.5 3z" />
      {/* Layered ruffle hems */}
      <path d="M11 18c3 2 7 2 10 0" />
      <path d="M12.5 22c2.2 1.6 4.8 1.6 7 0" />
    </svg>
  );
}

function SalwarKameezIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Neck & Tunic (Kameez) */}
      <path d="M13 5.5h6l3 3.5-1.8 11.5H20l-.5 4.5h-7L12 20.5H9.8L8 9l3-3.5z" />
      {/* Neckline embroidery V/slit */}
      <path d="M14.5 5.5v3.5l1.5 1.5 1.5-1.5V5.5" />
      {/* Side Dupatta drape */}
      <path d="M22 9c1.2 2.5 1.8 6.5 1.2 11.5l-1.4 6" />
      <path d="M20.5 20.5l1.5 6.5" />
      {/* Trousers (Salwar) below tunic */}
      <path d="M12.5 25l-.8 3.5h2.8l.5-3.5" />
      <path d="M19.5 25l.8 3.5h-2.8l-.5-3.5" />
      {/* Hem border embroidery details */}
      <path d="M12.2 18.5h7.6" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

function DefaultIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 5c1.2 0 2.2 1 2.2 2.2 0 1.3-1 2-2.2 2.8v1.2" />
      <path d="M11.5 11.2h9l1.5 2.5H10l1.5-2.5z" />
      <path d="M12.5 13.7l-3 13h13l-3-13" />
      <path d="M16 13.7v13" strokeDasharray="2 1.5" />
    </svg>
  );
}

import {
  HijabsIcon,
  HijabCapsIcon,
  ShawlsIcon,
  HijabAccessoriesIcon,
  PrayerWearIcon,
  AbayaAccessoriesIcon,
} from "./MegaMenu";

function CategorySvgIcon({
  categoryId,
  categoryName,
  className,
}: {
  categoryId?: string;
  categoryName?: string;
  className?: string;
}) {
  const id = (categoryId || "").toLowerCase();
  const name = (categoryName || "").toLowerCase();

  if (id === "hijabs" || name === "hijabs") return <HijabsIcon className={className} />;
  if (id === "hijab-caps" || name.includes("cap")) return <HijabCapsIcon className={className} />;
  if (id === "shawls" || name.includes("shawl")) return <ShawlsIcon className={className} />;
  if (id === "hijab-accessories" || (name.includes("hijab") && name.includes("accessor"))) return <HijabAccessoriesIcon className={className} />;
  if (id === "prayer-wear" || name.includes("prayer")) return <PrayerWearIcon className={className} />;
  if (id === "abaya-accessories" || (name.includes("abaya") && name.includes("accessor"))) return <AbayaAccessoriesIcon className={className} />;

  if (id.includes("abaya") || name.includes("abaya"))
    return <AbayaIcon className={className} />;
  if (id.includes("hijab") || name.includes("hijab"))
    return <HijabIcon className={className} />;
  if (id.includes("jilbab") || name.includes("jilbab"))
    return <JilbabIcon className={className} />;
  if (id.includes("khimar") || name.includes("khimar"))
    return <KhimarIcon className={className} />;
  if (
    id.includes("salwar") ||
    id.includes("kameez") ||
    name.includes("salwar") ||
    name.includes("kameez") ||
    name.includes("suit") ||
    id.includes("luxe")
  ) {
    return <SalwarKameezIcon className={className} />;
  }
  return <DefaultIcon className={className} />;
}

/* =========================================================================
   Categories Section Component
   ========================================================================= */

export default function Categories({ categories = [] }: { categories?: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Automatic slide every 3.5s when not hovered and items > 1
  useEffect(() => {
    if (isHovered || categories.length <= 1) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const firstCard = el.firstElementChild as HTMLElement;
        const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 240;
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, categories.length]);

  const scrollPrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? (firstCard.offsetWidth + 16) * 2 : 480;
    el.scrollBy({ left: -cardWidth, behavior: "smooth" });
  };

  const scrollNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      const firstCard = el.firstElementChild as HTMLElement;
      const cardWidth = firstCard ? (firstCard.offsetWidth + 16) * 2 : 480;
      el.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  return (
    <section id="categories" className="relative py-6 md:py-10 bg-cream-deep/60 overflow-hidden">
      <div className="max-w-wrap mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-xl mx-auto">
          <div className="eyebrow justify-center inline-flex items-center gap-2">
            <span className="h-px w-6 bg-gold" />
            Shop by Category
            <span className="h-px w-6 bg-gold" />
          </div>
          <h2 className="section-heading mt-4">Find your silhouette</h2>
          <p className="section-sub mt-4">
            Essential collections of the Hijabista wardrobe — crafted for exceptional comfort, graceful coverage and modern luxury.
          </p>
        </Reveal>

        {/* Carousel Grid Track Wrapper with Left/Right Buttons */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative mt-8 md:mt-10 group/carousel"
        >
          {/* Left Navigation Button (Website Theme Color #C84B31) */}
          <button
            onClick={scrollPrev}
            aria-label="Previous categories"
            className="absolute -left-2 sm:-left-4 lg:-left-5 top-[42%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#A83D26] text-white hover:bg-[#A83D26] border-2 border-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Navigation Button (Website Theme Color #C84B31) */}
          <button
            onClick={scrollNext}
            aria-label="Next categories"
            className="absolute -right-2 sm:-right-4 lg:-right-5 top-[42%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#A83D26] text-white hover:bg-[#A83D26] border-2 border-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Track */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((cat, i) => (
              <div
                key={cat.id || i}
                className="snap-start shrink-0 w-[calc(50%-0.38rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(16.666%-0.84rem)] h-auto flex flex-col"
              >
                <a
                  href={`/shop?category=${cat.id}`}
                  className="group block relative h-full rounded-xl md:rounded-xl overflow-hidden bg-white shadow-card hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col border border-cream-line/50"
                >
                  {/* Top Image Section (Height slightly increased ~2%) */}
                  <div className="relative w-full aspect-[4/3.7] overflow-hidden rounded-t-xl bg-cream/40">
                    <Image
                      src={cat.image_url || (cat as any).image || "/hijab-medina.jpg"}
                      alt={cat.name || "Category"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                    />
                  </div>

                  {/* Overlapping Circular SVG Icon Badge (Smaller box & icon) */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FAF6F0] border-[3px] md:border-[3.5px] border-white shadow-md flex items-center justify-center -mt-6 md:-mt-7 mx-auto relative z-10 group-hover:scale-105 group-hover:border-cream-line transition-all duration-300 shrink-0">
                    <CategorySvgIcon
                      categoryId={cat.id}
                      categoryName={cat.name}
                      className="w-6 h-6 md:w-7 md:h-7 text-[#7E3F35] transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Bottom Text Section (Compact & responsive text) */}
                  <div className="pt-2 sm:pt-2.5 pb-4 md:pb-5 px-2 sm:px-2.5 flex flex-col items-center text-center flex-grow justify-center">
                    <h3 className="font-display font-bold text-ink text-[13.5px] sm:text-[14.5px] lg:text-[15.5px] leading-tight group-hover:text-[#7E3F35] transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] sm:text-[12px] font-body font-medium text-ink/65 group-hover:text-[#7E3F35] transition-colors inline-flex items-center gap-1 mt-1">
                      {formatCount(cat.count)}
                      <svg
                        className="w-3 h-3 md:w-3.5 md:h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#7E3F35]/70 group-hover:text-[#7E3F35]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
