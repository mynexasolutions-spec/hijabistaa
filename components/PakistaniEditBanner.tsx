import Image from "next/image";
import Link from "next/link";

export default function PakistaniEditBanner() {
  return (
    <section 
      className="relative overflow-hidden py-6 md:py-10 border-y border-cream-line min-h-[450px] flex items-center bg-cream-deep"
    >
      <div className="max-w-wrap mx-auto px-5 md:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Premium 4-Image Masonry Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-5 order-2 lg:order-1 w-full h-[450px] md:h-[550px] lg:h-[600px]">
            <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 h-full">
              <div className="relative w-full flex-grow rounded-[20px] md:rounded-[28px] overflow-hidden shadow-soft border border-gold/20 group">
                <Image src="/pakistani-suit-banner.webp" alt="The Luxury Hijab & Scarf Edit 1" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover object-center transition-all duration-700 group-hover:scale-[1.05]" />
              </div>
              <div className="relative w-full h-[35%] rounded-[20px] md:rounded-[28px] overflow-hidden shadow-soft border border-gold/20 group">
                <Image src="/abaya-double-layer.png" alt="The Luxury Hijab & Scarf Edit 2" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover object-top transition-all duration-700 group-hover:scale-[1.05]" />
              </div>
            </div>
            <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 h-full pt-8 md:pt-12">
              <div className="relative w-full h-[40%] rounded-[20px] md:rounded-[28px] overflow-hidden shadow-soft border border-gold/20 group">
                <Image src="/khimar-handwork.png" alt="The Luxury Hijab & Scarf Edit 3" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover object-center transition-all duration-700 group-hover:scale-[1.05]" />
              </div>
              <div className="relative w-full flex-grow rounded-[20px] md:rounded-[28px] overflow-hidden shadow-soft border border-gold/20 group">
                <Image src="/model-cream-hijab.png" alt="The Luxury Hijab & Scarf Edit 4" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover object-top transition-all duration-700 group-hover:scale-[1.05]" />
              </div>
            </div>
          </div>

          {/* Right Column: Brand Content and CTA (Centered) */}
          <div className="flex flex-col items-center text-center py-4 lg:py-6 justify-center order-1 lg:order-2">
            {/* Monogram Logo */}
            <div className="relative w-20 h-20 mb-6 mix-blend-multiply">
              <Image
                src="/hijabista-logo.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Brand Title */}
            <h3 className="font-display font-bold text-sm md:text-base tracking-[0.25em] text-gold uppercase">
              Exclusive Collection
            </h3>

            {/* Cursive Subtitle */}
            <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl text-ink leading-tight">
              The <span className="italic text-gold font-medium">Luxury</span> Edit
            </h2>
            
            <div className="w-24 h-[1px] bg-gold/50 my-6" />

            {/* Main Subtitle */}
            <p className="text-base md:text-lg text-ink/75 font-body max-w-[420px] leading-relaxed">
              Exquisite embroidery, fluid chiffon &amp; silk drapes, and premium textures. Discover our curated range of luxury hijabs and modest wear designed for grace.
            </p>

            {/* CTA Button */}
            <Link
              href="/shop"
              className="mt-10 inline-flex items-center justify-center px-10 py-3.5 rounded-full border border-gold bg-gold text-white font-body font-semibold text-[15px] tracking-wide hover:bg-emerald hover:border-emerald transition-all hover:scale-[1.02]"
            >
              Shop The Edit
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
