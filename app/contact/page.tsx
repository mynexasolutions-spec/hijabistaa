import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Contact Us | HIJABISTA',
  description: 'Get in touch with HIJABISTA for any queries, custom orders, or feedback.',
}

export default function ContactPage() {
  return (
    <main className="overflow-x-hidden pt-28 md:pt-[130px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner for Contact Page */}
      <section className="relative w-full py-8 md:py-12 bg-gradient-to-br from-cream via-cream-deep to-[#F5ECE0] flex items-center justify-center overflow-hidden border-b border-cream-line">
        <div className="relative z-10 text-center px-5">
          <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3">
            <span className="h-px w-6 bg-gold" />
            Here to Help
            <span className="h-px w-6 bg-gold" />
          </div>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-ink tracking-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-ink/75 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Have a question about a hijab, sizing, or styling advice? Reach out and our team will be delighted to assist you.
          </p>
        </div>
      </section>

      <div className="flex-1">
        <Contact />
      </div>
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
