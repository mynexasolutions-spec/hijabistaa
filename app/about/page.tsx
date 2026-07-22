import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Story from "@/components/Story";
import BotanicalDivider from "@/components/BotanicalDivider";

export const metadata = {
  title: 'About Us | HIJABISTA',
  description: 'Learn about the story behind HIJABISTA, rooted in modesty and crafted with elegance.',
}

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden pt-28 md:pt-[130px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner for About Page */}
      <section className="relative w-full py-8 md:py-12 bg-gradient-to-br from-cream via-cream-deep to-[#F5ECE0] flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="relative z-10 text-center px-5">
          <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            Our Heritage
            <span className="h-px w-6 bg-gold" />
          </div>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-ink tracking-tight">
            About Hijabistaa
          </h1>
          <p className="mt-4 text-ink/75 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            A sanctuary of modest luxury, crafted with care and designed for the modern woman.
          </p>
        </div>
      </section>

      <BotanicalDivider tone="emerald" />

      <div className="flex-1">
        {/* We reuse the Story component which has the core information */}
        <Story />
      </div>

      <Footer />
    </main>
  );
}
