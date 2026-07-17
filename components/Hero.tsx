"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SITE } from "@/lib/data";
import HeroLineArt from "./HeroLineArt";
import MobileHeroCarousel from "./MobileHeroCarousel";
// import "../app/globals.css"


interface Slide {
  image_url: string;
  is_active: boolean;
  position?: string;
  title?: string;
  subtitle?: string;
}

export default function Hero({ 
  slides = [], 
  heroText 
}: { 
  slides?: Slide[]; 
  heroText?: { 
    heading_line1?: string; 
    heading_line2?: string; 
    heading_line3?: string; 
    description?: string; 
  } 
}) {
  const line1 = heroText?.heading_line1 || "Modesty.";
  const line2 = heroText?.heading_line2 || "Elegance.";
  const line3 = heroText?.heading_line3 || "You.";
  const desc = heroText?.description || "Premium Hijabs, Scarves & Modest Essentials crafted with luxurious fabric and effortless style.";

  // Load active hero slides from props
  const activeSlides = slides.filter((slide: any) => slide.is_active);
  
  const archImages = activeSlides.length > 0 
    ? activeSlides.map((slide: any) => slide.image_url)
    : [
        "/khimar-handwork.png",
        "/abaya-double-layer.png",
        "/model-cream-hijab.png",
        "/jilbab-blue.png",
      ];

  const gridFallbackImages = [
    "/khimar-handwork-1.png",
    "/jilbab-black.png",
    "/abaya-double-layer.png",
    "/khimar-handwork.png",
  ];

  const allAvailableImages = activeSlides.map((s: any) => s.image_url).filter(Boolean);
  
  const gridImages = [
    ...allAvailableImages,
    ...gridFallbackImages,
    "/abaya-front-open.png",
    "/luxe-salwar-kameez.png"
  ].slice(0, 6);

  const mobileCarouselImages = Array.from(new Set([
    ...allAvailableImages,
    "/khimar-handwork.png",
    "/abaya-double-layer.png",
    "/model-cream-hijab.png",
    "/jilbab-blue.png",
    "/khimar-handwork-1.png",
    "/abaya-front-open.png",
    "/luxe-salwar-kameez.png",
    "/jilbab-black.png"
  ].filter(Boolean))) as string[];

  const [activeArchIndex, setActiveArchIndex] = useState(0);
  const [activeGridIndex, setActiveGridIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveArchIndex((prev) => (prev + 1) % archImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [archImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGridIndex((prev) => (prev + 1) % gridImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [gridImages.length]);

  return (
    <section
      id="home heros"
      className="relative overflow-hidden pt-32 sm:pt-36 md:pt-40 lg:pt-25 pb-6 md:pb-8 bg-[#FAF6F0]"
    >
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-gold-pale via-gold-light/40 to-transparent blur-3xl opacity-50 z-0" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-rose-soft/30 via-[#FAF6F0] to-transparent blur-3xl opacity-55 z-0" />

      <div className="max-w-wrap mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
        {/* Main Split Layout */}
        <div className="grid lg:grid-cols-[1fr_1.3fr] xl:grid-cols-[1fr_1.45fr] gap-6 sm:gap-8 lg:gap-10 xl:gap-14 items-center w-full">
          
          {/* Left Column: Brand Typography, CTAs, Sub-features */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10 py-2 sm:py-4 w-full">
            
            {/* Subtitle / Eyebrow */}
            <span className="font-display font-semibold text-xs sm:text-sm tracking-[0.25em] text-[#7E3F35] uppercase mb-3 sm:mb-4">
              HIJABISTAA &ndash; HIJAB &amp; SCARF
            </span>

            {/* Mobile Main Heading exact as image */}
            <h1 className="block lg:hidden font-display font-bold text-[2.7rem] sm:text-4xl leading-[1.12] tracking-tight text-ink w-full">
              {line1} <br />
              <span className="text-[#7E3F35]">{line2}</span>{" "}
              <span className="text-ink">{line3}</span>
            </h1>

            {/* Desktop Main Heading */}
            <h1 className="hidden lg:block font-display font-bold lg:text-[3.5rem] xl:text-[4.1rem] leading-[1.05] tracking-tight text-ink heros-txt">
              {line1} <br />
              <span className="text-[#7E3F35] ml-16">{line2}</span> <br />
              <span className="heros-you ml-[275px]">{line3}</span>
            </h1>

            {/* Decorative Diamond Divider */}
            <div className="flex items-center gap-2.5 my-4 sm:my-5 w-52 sm:w-60 mx-auto lg:mx-0">
              <div className="h-[1px] flex-1 bg-[#7E3F35]/35" />
              <div className="w-2 h-2 rotate-45 bg-[#7E3F35]" />
              <div className="h-[1px] flex-1 bg-[#7E3F35]/35" />
            </div>

            {/* Mobile Description Paragraph exact as image */}
            <p className="block lg:hidden text-sm sm:text-base text-ink/80 font-body max-w-[440px] leading-relaxed mx-auto">
              {desc}
            </p>

            {/* Desktop Description Paragraph */}
            <p className="hidden lg:block text-base lg:text-lg text-ink/80 font-body max-w-[460px] leading-relaxed">
              {desc}
            </p>

            {/* Mobile 3D Smooth Right-to-Left Carousel exact as Carousel UI guide */}
            <MobileHeroCarousel images={mobileCarouselImages} speed={1.20} />

            {/* CTA Buttons - Using original brand color (#7E3F35) with reduced border radius (rounded-xl) and exact WhatsApp outline icon */}
            <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full max-w-[360px] sm:max-w-none mx-auto lg:mx-0">
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                  SITE.whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-xl bg-[#7E3F35] text-cream font-body font-semibold text-sm sm:text-[15px] tracking-wide shadow-card hover:bg-[#5D2B23] transition-all hover:scale-[1.02] w-full sm:w-auto"
              >
                <svg className="w-5 h-5 flex-shrink-0 text-cream" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
                Shop on WhatsApp
              </a>
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-7 py-3.5 sm:py-4 rounded-xl border border-[#7E3F35]/70 bg-transparent text-[#7E3F35] font-body font-semibold text-sm sm:text-[15px] tracking-wide hover:bg-[#7E3F35] hover:text-cream transition-all hover:scale-[1.02] w-full sm:w-auto"
              >
                Shop the Collection
              </a>
            </div>

          </div>

          {/* Right Column: Visual Showcase (Arch + 2x2 Grid + NEW ARRIVAL Badge) - Desktop only */}
          <div className="hidden lg:flex relative items-center justify-end gap-5 xl:gap-6 py-4">
            
            {/* Center-Right Archway Image (Increased height and width) */}
            <div className="w-[350px] xl:w-[390px] h-[460px] xl:h-[490px] rounded-t-full rounded-b-3xl overflow-hidden shadow-soft border-[6px] border-white relative bg-cream-deep flex-shrink-0">
              {archImages.map((src, index) => (
                <div
                  key={src + "-arch"}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === activeArchIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt="Hijabista Collection"
                    fill
                    sizes="390px"
                    className="object-cover object-top"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* 2x2 Grid Photo Collage with Floating Circle Badge exact as image (Increased height and width) */}
            <div className="relative w-[245px] xl:w-[275px] h-[460px] xl:h-[490px] bg-white rounded-3xl p-2 border-[5px] border-white shadow-soft flex-shrink-0 flex flex-col">
              
              {/* Floating Circle Badge positioned between Arch and Grid */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-12 z-30 w-24 h-24 rounded-full bg-[#FAF6F0] border-[4px] border-white shadow-card flex flex-col items-center justify-center text-center p-1">
                <span className="text-[#7E3F35] text-xl leading-none mb-1.5">✦</span>
                <span className="font-display font-bold text-[11px] tracking-wider text-ink uppercase leading-tight">
                  NEW <br /> ARRIVAL
                </span>
              </div>

              {/* Single Image Showcase (changes every 3s) */}
              <div className="relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden bg-cream-deep">
                {gridImages.map((src, idx) => (
                  <div
                    key={src + "-grid-single-" + idx}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      idx === activeGridIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`New Arrival Look ${idx + 1}`}
                      fill
                      sizes="280px"
                      className="object-cover object-top"
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Feature Bar (White Card) with original circle badge design and 2-col on mobile */}
        <div className="mt-4 sm:mt-4 lg:mt-6 w-full bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-[#7E3F35]/15 p-4 sm:p-5 lg:p-6 z-10 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Item 1 */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FAF6F0] border border-[#7E3F35]/20 flex items-center justify-center text-[#7E3F35] flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-body font-bold text-[13px] sm:text-[15px] text-ink leading-snug">Premium</h4>
                <p className="font-body text-[11px] sm:text-[13px] text-ink/70 mt-0.5">Quality Fabric</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-2.5 sm:gap-4 sm:border-l sm:border-[#7E3F35]/15 sm:pl-4 lg:pl-6">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FAF6F0] border border-[#7E3F35]/20 flex items-center justify-center text-[#7E3F35] flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h4 className="font-body font-bold text-[13px] sm:text-[15px] text-ink leading-snug">Elegant</h4>
                <p className="font-body text-[11px] sm:text-[13px] text-ink/70 mt-0.5">Designs</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-2.5 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#7E3F35]/15 lg:border-l lg:pl-6">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FAF6F0] border border-[#7E3F35]/20 flex items-center justify-center text-[#7E3F35] flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-body font-bold text-[13px] sm:text-[15px] text-ink leading-snug">Comfortable</h4>
                <p className="font-body text-[11px] sm:text-[13px] text-ink/70 mt-0.5">All Day</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-2.5 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#7E3F35]/15 sm:border-l sm:pl-4 lg:pl-6">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FAF6F0] border border-[#7E3F35]/20 flex items-center justify-center text-[#7E3F35] flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h4 className="font-body font-bold text-[13px] sm:text-[15px] text-ink leading-snug">Affordable</h4>
                <p className="font-body text-[11px] sm:text-[13px] text-ink/70 mt-0.5">Luxury</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Hero Line Art Animation */}
      <HeroLineArt className="hidden lg:block absolute bottom-4 right-4 w-[110px] h-[110px] opacity-70 z-0 pointer-events-none" />
    </section>
  );
}

