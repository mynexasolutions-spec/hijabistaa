import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Frequently Asked Questions | HIJABISTA',
}

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "All standard orders are processed within 2-3 business days. Delivery within Delhi NCR takes 1-2 business days, Metro Cities take 3-4 business days, and the Rest of India takes 5-7 business days after dispatch."
  },
  {
    question: "What are the shipping charges?",
    answer: "Shipping charges are tiered based on the number of items: ₹99 for 1-2 items, ₹150 for 3-4 items, and ₹200 for 5 or more items."
  },
  {
    question: "Do you accept returns?",
    answer: "Yes, we offer a 7-day return window for items that are unused, unwashed, and have all original tags intact. Custom orders and sale items are non-returnable."
  },
  {
    question: "What payment methods are available?",
    answer: "We currently accept all major credit/debit cards, UPI, and Netbanking via Razorpay. We do not offer Cash on Delivery (COD)."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you will receive a tracking link via email and WhatsApp. Please allow up to 24 hours for it to update."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach out to our support team via the WhatsApp button on the bottom right of the screen, or email us at support@hijabistaa.com."
  }
]

export default function FAQPage() {
  return (
    <main className="overflow-x-hidden pt-28 md:pt-[130px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-ink mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-6 mt-12">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gold/20">
              <h3 className="font-display font-semibold text-xl text-ink mb-3">{faq.question}</h3>
              <p className="text-ink/80 text-sm md:text-base leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
