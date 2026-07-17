"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import BotanicalDivider from "./BotanicalDivider";
import { testimonials as baseTestimonials } from "@/lib/data";

// Enhanced rich testimonials list for continuous sliding
const fallbackTestimonials = [
  ...baseTestimonials.map((t) => ({ ...t, product: "Double Layer Premium Abaya", rating: 5 })),
  {
    name: "Dr. Ayesha Tariq",
    city: "Mumbai",
    quote:
      "I wore the Khimar Handwork to a family wedding and received endless compliments. The drape is lightweight, breathable, and feels like true couture.",
    initials: "AT",
    product: "Khimar Handwork — Delicate Detailing",
    rating: 5,
  },
  {
    name: "Mehak Fatima",
    city: "Lucknow",
    quote:
      "Finally a modest fashion brand in India that delivers exact international magazine quality! The embroidery and fabric texture are simply 10/10.",
    initials: "MF",
    product: "Luxe Organza Salwar Kameez",
    rating: 5,
  },
  {
    name: "Sanam Mirza",
    city: "Hyderabad",
    quote:
      "The WhatsApp team helped me pick the exact right length within 5 minutes. Fast delivery and premium royal packaging. I'm a lifetime customer now!",
    initials: "SM",
    product: "Royal Overhead Jilbab",
    rating: 5,
  },
  {
    name: "Nida Siddiqui",
    city: "Bangalore",
    quote:
      "The pure chiffon scarf is buttery soft and doesn't slip at all during long office hours. Elegance and modesty perfectly balanced.",
    initials: "NS",
    product: "Breathable Chiffon Hijab",
    rating: 5,
  },
];

type Testimonial = {
  name: string;
  city: string | null;
  quote: string;
  initials: string | null;
  product: string | null;
  rating: number;
};

export default function Testimonials({ testimonials = fallbackTestimonials }: { testimonials?: Testimonial[] }) {
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll loop every 3.5 seconds when not paused
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 20) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: -340, behavior: "smooth" });
  };

  const handleNext = () => {
    const track = trackRef.current;
    if (!track) return;
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 20) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <section id="reviews" className="relative py-10 md:py-14 overflow-hidden bg-gradient-to-b from-[#FAF6F0] via-[#F4ECE1]/60 to-[#FAF6F0]">
      {/* Subtle ambient decorative background blur */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-10 w-[400px] h-[400px] rounded-full bg-emerald/10 blur-[140px]" />

      <div className="max-w-wrap mx-auto px-5 sm:px-8 relative z-10">
        
        {/* Header Bar */}
        <Reveal className="text-center max-w-2xl mx-auto pb-6 border-b border-gold/20">
          {/* Pill Eyebrow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-gold/30 shadow-sm mb-3">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-display font-bold text-xs tracking-[0.22em] text-[#7E3F35] uppercase">
              ✦ CUSTOMER LOVE &bull; 4.9/5 RATING ✦
            </span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#2C221E] leading-[1.18]">
            Words from our{" "}
            <span className="italic font-normal text-[#7E3F35]">Hijabista family</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-[15px] text-[#5D4D46] font-body mt-2.5 leading-relaxed">
            Trusted by <span className="font-bold text-[#2C221E]">2,300+ women</span> nationwide and globally for uncompromised modest luxury.
          </p>
        </Reveal>

        {/* Continuous Auto-Sliding & Interactive Carousel Track with Left & Right Floating Buttons */}
        <div className="relative mt-8 sm:mt-10 group/slider">
          
          {/* Floating LEFT Navigation Arrow */}
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial card"
            className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#DFB283]/80 text-[#7E3F35] flex items-center justify-center shadow-2xl hover:bg-[#7E3F35] hover:text-white hover:border-[#7E3F35] transition-all duration-300 transform active:scale-90 opacity-90 hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 -ml-0.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Floating RIGHT Navigation Arrow */}
          <button
            onClick={handleNext}
            aria-label="Next testimonial card"
            className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#DFB283]/80 text-[#7E3F35] flex items-center justify-center shadow-2xl hover:bg-[#7E3F35] hover:text-white hover:border-[#7E3F35] transition-all duration-300 transform active:scale-90 opacity-90 hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 -mr-0.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Sliding Cards Track */}
          <div
            ref={trackRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-5 sm:gap-6 pb-6 pt-2 px-1 sm:px-2 w-full scroll-smooth"
          >
            {displayTestimonials.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="w-[300px] sm:w-[350px] md:w-[380px] shrink-0 snap-start flex flex-col group"
              >
                <div className="h-full bg-white/95 backdrop-blur-md border border-[#E5DBCB] rounded-[26px] sm:rounded-[30px] p-6 sm:p-7 shadow-card hover:shadow-2xl hover:border-[#DFB283] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between">
                  
                  {/* Top Row: Verified Badge & Stars */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E5DBCB]/60">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald/10 text-emerald text-[11px] font-bold uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Verified Buyer</span>
                    </span>
                    <div className="flex text-[#DFB283] text-sm tracking-tighter">
                      {"★".repeat(t.rating)}
                    </div>
                  </div>

                  {/* Middle Quote */}
                  <div className="py-4 flex-1 relative">
                    <span className="absolute -top-3 left-0 font-display text-5xl text-[#DFB283]/25 leading-none select-none pointer-events-none">
                      &ldquo;
                    </span>
                    <p className="font-body text-[#2C221E]/85 text-xs sm:text-sm md:text-[15px] leading-relaxed italic relative z-10 pt-2">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  {/* Bottom Row: Reviewer Profile */}
                  <div className="pt-4 border-t border-[#E5DBCB]/60 flex items-center gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#7E3F35] via-[#A86457] to-[#2C221E] text-white flex items-center justify-center font-display font-bold text-sm sm:text-base shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                      {t.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-sm sm:text-base text-[#2C221E] truncate">
                        {t.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#5D4D46]">
                        <span className="font-semibold text-emerald shrink-0">{t.city}</span>
                        <span>&bull;</span>
                        <span className="truncate text-[#7E3F35] font-medium">{t.product}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Guarantee Strip */}
        <Reveal className="mt-4 sm:mt-6 pt-6 border-t border-[#E5DBCB]/70 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-body text-[#5D4D46]">
            <span className="text-[#7E3F35] font-bold">✦</span>
            <span>100% Couture Fabric Guarantee</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-body text-[#5D4D46]">
            <span className="text-emerald font-bold">✓</span>
            <span>Instant WhatsApp Size Consultation</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-body text-[#5D4D46]">
            <span className="text-[#7E3F35] font-bold">✦</span>
            <span>Nationwide &amp; Global Express Delivery</span>
          </div>
        </Reveal>

      </div>
      
      <div className="mt-8 sm:mt-10">
        <BotanicalDivider tone="gold" />
      </div>
    </section>
  );
}
