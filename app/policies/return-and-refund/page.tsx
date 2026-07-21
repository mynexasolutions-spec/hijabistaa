import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata = {
  title: 'Return & Refund Policy | HIJABISTA',
}

export default function ReturnAndRefundPolicy() {
  return (
    <main className="overflow-x-hidden pt-28 md:pt-[130px] bg-cream min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-16 md:py-24">
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-ink mb-8">Return & Refund Policy</h1>
        
        <div className="prose prose-emerald prose-sm md:prose-base text-ink/80 max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
          
          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">1. Eligibility for Returns</h3>
          <p>
            We offer a 7-day return window for items that are unused, unwashed, and have all original tags intact. The items must be returned in their original packaging. If 7 days have passed since your purchase was delivered, unfortunately, we cannot offer you a refund or exchange.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">2. Return Process</h3>
          <p>
            To initiate a return, please contact our support team via email or WhatsApp with your order number and the reason for the return. Our team will review your request and provide you with further instructions for sending the item(s) back to us.
          </p>
          
          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">3. Refunds</h3>
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed and automatically applied to your original method of payment within 5-7 business days. Shipping charges are non-refundable.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">4. Non-Returnable Items</h3>
          <p>
            Custom orders, personalized items, sale items, and worn or washed items are non-returnable and non-refundable unless they are received damaged or defective.
          </p>
        </div>
      </div>

      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
