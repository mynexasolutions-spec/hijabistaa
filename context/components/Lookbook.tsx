import Image from "next/image";
import Reveal from "./Reveal";
import { lookbook, SITE } from "@/lib/data";

export default function Lookbook() {
  // Natural flexible height (h-auto) ensures 100% full image visibility from top to bottom without ANY cropping whatsoever.
  // Multi-column masonry automatically balances equal column widths while letting taller outfits show completely!
  const tags = [
    "@zara.modest",
    "@aiysha.k",
    "@noor_styles",
    "@fatima.lookbook",
    "@hanan.dubai",
    "@sara.hijabista",
  ];

  const likes = ["1.4k", "890", "2.1k", "1.8k", "950", "3.2k"];

  return (
    <section className="relative py-8 md:py-12 overflow-x-clip bg-gradient-to-b from-[#FAF6F0] via-[#F4ECE1]/70 to-[#FAF6F0]">
      {/* Decorative ambient background blur */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gold/10 blur-[140px]" />

      <div className="max-w-wrap mx-auto px-5 sm:px-8 relative z-10 overflow-visible">
        
        {/* Header Bar */}
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-gold/20 overflow-visible">
          <div className="text-center lg:text-left max-w-2xl overflow-visible">
            
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-gold/30 shadow-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="font-display font-bold text-xs tracking-[0.2em] text-emerald uppercase">
                📸 #HIJABISTAA &bull; STYLE CHRONICLES
              </span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.28] py-2 overflow-visible">
              Styled by our{" "}
              <span className="italic font-normal bg-gradient-to-r from-gold via-[#0F4C3A] to-gold bg-clip-text text-transparent inline-block pr-3.5 pb-2 pt-1 -my-1">
                global community
              </span>
            </h2>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-3 shrink-0">
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald text-white font-body font-semibold text-sm tracking-wide shadow-card hover:bg-emerald-deep transition-all duration-300 hover:scale-[1.03]"
            >
              <span>✦ Get VIP Styling Help</span>
            </a>
          </div>
        </Reveal>

        {/* Pinterest/Vogue-Style Staggered Masonry Grid */}
        <div className="mt-8 sm:mt-10 columns-2 md:columns-3 gap-3.5 sm:gap-6 space-y-3.5 sm:space-y-6">
          {lookbook.map((src, i) => (
            <Reveal
              key={src}
              delay={(i % 4) as 0 | 1 | 2 | 3}
              className="break-inside-avoid"
            >
              <div
                className="group lift relative w-full rounded-[18px] sm:rounded-[28px] overflow-hidden shadow-card border-[3px] sm:border-[3.5px] border-white bg-cream-deep cursor-pointer transition-all duration-500 hover:shadow-2xl"
              >
                <Image
                  src={src}
                  alt={`Hijabista community styling look ${i + 1}`}
                  width={750}
                  height={1050}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 420px"
                  className="w-full h-auto block object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Always-visible top right heart badge */}
                <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 bg-white/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-display font-bold text-ink shadow-sm flex items-center gap-1 sm:gap-1.5 z-10 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-rose">♥</span>
                  <span>{likes[i % likes.length]}</span>
                </div>

                {/* Always-visible bottom Instagram pill tag + Mobile Shop Button */}
                <div className="absolute bottom-3 sm:bottom-3.5 left-3 right-3 sm:left-3.5 sm:right-3.5 flex items-center justify-between gap-1.5 z-10">
                  <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-ink shadow-md flex items-center justify-between gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden min-w-0">
                      <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald/15 text-emerald flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
                        ✨
                      </div>
                      <span className="font-display font-semibold text-[11px] sm:text-[13px] text-ink truncate">
                        {tags[i % tags.length]}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-gold font-bold uppercase tracking-wider shrink-0 hidden sm:inline">
                      Verified
                    </span>
                  </div>

                  {/* Mobile-Only Permanent Shop Button (icon hidden as requested) */}
                  <a
                    href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                      `Hi HIJABISTAA! I loved this community look (${tags[i % tags.length]}) and would like to shop this exact style.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sm:hidden bg-[#7E3F35] text-white px-3 py-1.5 rounded-xl font-display font-bold text-[10px] uppercase tracking-wider shadow-md active:scale-95 shrink-0 hover:bg-[#2C221E] transition-colors"
                  >
                    Shop Look
                  </a>
                </div>

                {/* Desktop Hover Glassmorphic Overlay with Shop Button (with arrow icon) */}
                <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center gap-3 p-4 z-20">
                  <a
                    href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                      `Hi HIJABISTAA! I loved this community look (${tags[i % tags.length]}) and would like to shop this exact style.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-white text-ink font-display font-bold text-xs sm:text-sm uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 hover:bg-gold hover:text-white"
                  >
                    <span>Shop Look</span>
                    <span>↗</span>
                  </a>
                  <span className="text-[11px] text-white/80 font-body">
                    Click to inquire via WhatsApp
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Community CTA */}
        <Reveal className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-gold/30 shadow-soft w-full max-w-2xl mx-auto">
            <div className="text-center sm:text-left">
              <p className="font-display font-bold text-lg sm:text-xl text-ink">Want to join the lookbook?</p>
              <p className="text-xs sm:text-sm text-ink/70 mt-1">Upload your photo on Instagram with #HijabistaLook &amp; win monthly vouchers!</p>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border-2 border-gold text-gold hover:bg-gold hover:text-white font-display font-semibold text-xs uppercase tracking-wider transition-all duration-300 shrink-0"
            >
              Follow On Instagram &rarr;
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
