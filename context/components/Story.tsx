import Image from "next/image";
import Reveal from "./Reveal";
import BotanicalDivider from "./BotanicalDivider";

export default function Story() {
  return (
    <section id="story" className="relative py-8 md:py-12 overflow-hidden bg-[#FAF6F0]">
      {/* Subtle background ambient glows / texture */}
      <div className="pointer-events-none absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-[#DFB283]/15 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[#7E3F35]/10 blur-[150px]" />

      <div className="max-w-wrap mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 items-center">
          
          {/* Left Column: 3-Image Editorial Masonry Grid with Overlapping Badge (6 cols) */}
          <div className="lg:col-span-6 relative order-2 lg:order-1 pt-4 sm:pt-6 lg:pt-0">
            <Reveal className="relative max-w-[540px] mx-auto lg:mx-0">
              
              {/* 3-Image Grid Container */}
              <div className="grid grid-cols-12 gap-3 sm:gap-4.5">
                
                {/* Image 1: Tall Portrait on Left (Spans 7 cols, 2 rows) */}
                <div className="col-span-7 relative aspect-[3.2/5] rounded-[26px] sm:rounded-[34px] overflow-hidden shadow-xl border border-[#E5DBCB]/80 bg-cream-deep group">
                  <Image
                    src="/assets/images/img_11.webp"
                    alt="Hijabista Modest Elegance Story"
                    fill
                    sizes="(max-width: 768px) 55vw, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Right Side 2 Stacked Images (Spans 5 cols) */}
                <div className="col-span-5 flex flex-col justify-between gap-3 sm:gap-4.5">
                  
                  {/* Image 2: Top Right */}
                  <div className="relative aspect-[1/1.08] w-full rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-lg border border-[#E5DBCB]/80 bg-cream-deep group">
                    <Image
                      src="/assets/images/img_12.webp"
                      alt="Hijabista Abaya Craftsmanship"
                      fill
                      sizes="(max-width: 768px) 45vw, 220px"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Image 3: Bottom Right */}
                  <div className="relative aspect-[1/1.08] w-full rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-lg border border-[#E5DBCB]/80 bg-cream-deep group">
                    <Image
                      src="/assets/images/img_13.webp"
                      alt="Refined Modest Detail"
                      fill
                      sizes="(max-width: 768px) 45vw, 220px"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                </div>

              </div>

              {/* Overlapping Bottom-Left Badge Exactly Like Reference Image */}
              <div className="absolute -bottom-5 sm:-bottom-7 -left-3 sm:-left-8 bg-[#FAF6F0] rounded-[22px] sm:rounded-[26px] p-3.5 sm:p-4.5 shadow-2xl border border-[#DFB283]/45 flex items-center gap-3 sm:gap-3.5 z-20">
                
                {/* Beige Circle Icon */}
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#F5ECE0] border border-[#DFB283]/40 flex items-center justify-center shrink-0 text-[#7E3F35]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M12 3v18M7.5 6.5C8.5 5 10 3.5 12 3.5s3.5 1.5 4.5 3l1.5 8c0 3-2 5.5-6 5.5s-6-2.5-6-5.5l1.5-8z" />
                  </svg>
                </div>

                {/* Badge Text */}
                <div>
                  <span className="font-display font-bold text-xl sm:text-2xl text-[#7E3F35] block leading-none">
                    7+
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#2C221E]/80 font-medium leading-snug block mt-0.5">
                    Years of elegance <br />
                    in modest fashion
                  </span>
                </div>

              </div>

            </Reveal>
          </div>

          {/* Right Column: Centered Editorial Layout Exactly Like Reference Image (6 cols) */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center text-center lg:px-4 md:px-5">
            
            <Reveal className="flex flex-col items-center">
              {/* Lotus/Flower Motif Icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#7E3F35] mb-2">
                <path d="M12 2C12 2 15 6 15 9C15 11 13.5 12.5 12 12.5C10.5 12.5 9 11 9 9C9 6 12 2 12 2ZM12 12.5C14.5 12.5 17 14 18 17C19 20 17.5 22 17.5 22C17.5 22 15 20.5 12 20.5C9 20.5 6.5 22 6.5 22C6.5 22 5 20 6 17C7 14 9.5 12.5 12 12.5ZM4 11C4 11 7.5 11.5 9.5 14C11.5 16.5 11.5 19.5 11.5 19.5C11.5 19.5 8.5 19.5 6 17.5C3.5 15.5 4 11 4 11ZM20 11C20 11 16.5 11.5 14.5 14C12.5 16.5 12.5 19.5 12.5 19.5C12.5 19.5 15.5 19.5 18 17.5C20.5 15.5 20 11 20 11Z" />
              </svg>

              {/* Eyebrow With Flanking Lines */}
              <div className="flex items-center gap-3">
                <span className="w-8 sm:w-12 h-[1px] bg-[#DFB283]/60" />
                <span className="font-body font-semibold text-xs tracking-[0.25em] text-[#7E3F35] uppercase">
                  OUR STORY
                </span>
                <span className="w-8 sm:w-12 h-[1px] bg-[#DFB283]/60" />
              </div>
            </Reveal>

            {/* Main Title */}
            <Reveal delay={1} className="mt-3 sm:mt-4">
              <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#2C221E] leading-[1.15] tracking-tight">
                Rooted in modesty, <br />
                <span className="italic font-normal text-[#7E3F35]">Styled with Elegance.</span>
              </h2>
            </Reveal>

            {/* Decorative Diamond Separator */}
            <Reveal delay={2} className="flex items-center justify-center gap-3 my-5 sm:my-6 text-[#DFB283]">
              <span className="w-16 sm:w-22 h-[1px] bg-[#DFB283]/60" />
              <span className="text-xs sm:text-sm">✦</span>
              <span className="w-16 sm:w-22 h-[1px] bg-[#DFB283]/60" />
            </Reveal>

            {/* Concise Sub-text Paragraph */}
            <Reveal delay={2}>
              <p className="text-[#5D4D46] font-body text-sm sm:text-base md:text-[16px] leading-relaxed max-w-lg mx-auto">
              Hijabistaa is a Mumbai-based modest fashion brand offering premium-quality hijabs for everyday wear and special occasions. Our thoughtfully curated collection combines comfort, elegance, and versatility, with pan-India shipping to bring timeless modest fashion to your doorstep.
              </p>
            </Reveal>

            {/* 3-Column Stats Row With Circle Icons */}
            <Reveal delay={3} className="mt-8 sm:mt-10 grid grid-cols-3 w-full max-w-lg border-t border-b border-[#E5DBCB]/80 py-6 sm:py-7 gap-2 sm:gap-4">
              
              {/* Stat 1 */}
              <div className="flex flex-col items-center px-1 sm:px-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5ECE0] text-[#7E3F35] flex items-center justify-center mb-2 sm:mb-2.5 border border-[#DFB283]/30 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M12 3v18M7.5 6.5C8.5 5 10 3.5 12 3.5s3.5 1.5 4.5 3l1.5 8c0 3-2 5.5-6 5.5s-6-2.5-6-5.5l1.5-8z" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg sm:text-2xl text-[#2C221E] leading-none">
                  120+
                </span>
                <span className="text-[11px] sm:text-xs text-[#5D4D46] font-medium mt-1 text-center leading-tight">
                  Styles Collection
                </span>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center px-1 sm:px-3 border-x border-[#E5DBCB]/80">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5ECE0] text-[#7E3F35] flex items-center justify-center mb-2 sm:mb-2.5 border border-[#DFB283]/30 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg sm:text-2xl text-[#2C221E] leading-none">
                  18
                </span>
                <span className="text-[11px] sm:text-xs text-[#5D4D46] font-medium mt-1 text-center leading-tight">
                  States We Serve
                </span>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center px-1 sm:px-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5ECE0] text-[#7E3F35] flex items-center justify-center mb-2 sm:mb-2.5 border border-[#DFB283]/30 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="font-display font-bold text-lg sm:text-2xl text-[#2C221E] leading-none">
                  2,300+
                </span>
                <span className="text-[11px] sm:text-xs text-[#5D4D46] font-medium mt-1 text-center leading-tight">
                  Happy Customers
                </span>
              </div>

            </Reveal>

            {/* Bottom CTA Button Exactly Like Reference Image */}
            <Reveal delay={4} className="mt-6 sm:mt-8">
              <a
                href="/shop"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:py-4 rounded-full bg-[#7E3F35] text-white font-body font-semibold text-xs sm:text-sm tracking-wide shadow-card hover:bg-[#5D2B23] transition-all duration-300 hover:scale-105"
              >
                <span>Explore Our Collection</span>
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/60 flex items-center justify-center">
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            </Reveal>

          </div>

        </div>
      </div>
      
      <div className="mt-12 sm:mt-16">
        <BotanicalDivider tone="gold" />
      </div>
    </section>
  );
}
