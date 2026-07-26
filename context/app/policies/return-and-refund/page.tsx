import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
          
          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">1. No Return & No Refund Policy</h3>
          <p>
            We do not offer returns or refunds on any products once an order has been placed and delivered. All sales are final. Please make sure to check product specifications, measurements, and details before completing your order.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">2. Damaged or Incorrect Products</h3>
          <p>
            In case you receive a damaged, defective, or incorrect product, please inform our support team within 24 hours of delivery via WhatsApp or email along with unboxing video/photo proof. We will review your request and process an exchange if verified.
          </p>

          <h3 className="font-display font-semibold text-xl text-ink mt-8 mb-4">3. Order Cancellations</h3>
          <p>
            Orders once dispatched cannot be cancelled. If you need to request cancellation prior to dispatch, please contact support immediately.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
