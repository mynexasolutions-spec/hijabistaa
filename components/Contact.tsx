"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { SITE } from "@/lib/data";
import { submitInquiry } from "@/actions/contact";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    

    try {
      const res = await submitInquiry(formData);
      if (res.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error || "Failed to send message.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-6 md:py-10 bg-cream-deep/60">
      <div className="max-w-wrap mx-auto px-5 md:px-8">
        
        {/* Split Card Layout */}
        <Reveal>
          <div className="bg-white rounded-[32px] overflow-hidden shadow-soft grid lg:grid-cols-[0.8fr_1.2fr] border border-cream-line">
            
            {/* Left Panel: Information & Map */}
            <div className="bg-cream-deep border-r border-cream-line p-8 md:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="font-display font-semibold text-3xl text-ink mb-2">Get in Touch</h3>
                <p className="text-ink/75 text-sm md:text-[15px] mb-10 leading-relaxed max-w-sm">
                  We'd love to hear from you. Whether it's a question about hijab sizing or styling advice, we're right here to help.
                </p>

                <div className="space-y-6">
                  <a href={`mailto:${SITE.email}`} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-cream-line group-hover:border-gold transition-colors shadow-sm">
                      <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold block mb-1">Email Us</span>
                      <p className="font-display font-medium text-ink text-[15px] group-hover:text-gold transition-colors break-all">{SITE.email}</p>
                    </div>
                  </a>

                  <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-cream-line group-hover:border-gold transition-colors shadow-sm">
                      <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold block mb-1">WhatsApp / Call</span>
                      <p className="font-display font-medium text-ink text-[15px] group-hover:text-gold transition-colors">{SITE.phone}</p>
                    </div>
                  </a>

                  <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-cream-line group-hover:border-gold transition-colors shadow-sm">
                      <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold block mb-1">YouTube</span>
                      <p className="font-display font-medium text-ink text-[15px] group-hover:text-gold transition-colors">Hijabistaa Modest Fashion</p>
                    </div>
                  </a>

                  <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-cream-line group-hover:border-gold transition-colors shadow-sm">
                      <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold block mb-1">Instagram</span>
                      <p className="font-display font-medium text-ink text-[15px] group-hover:text-gold transition-colors">@{SITE.instagram}</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="relative z-10 mt-10 pt-8 border-t border-cream-line">
                <span className="text-[11px] uppercase tracking-wider text-ink/50 font-semibold block mb-2">Visit Our Store</span>
                <p className="font-display font-medium text-ink text-[15px] mb-2">{SITE.address}</p>
                <p className="text-ink/75 text-sm">{SITE.hours}</p>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="p-8 md:p-12 lg:p-14 bg-white relative">
              <h3 className="font-display font-semibold text-2xl text-ink mb-8">Send a Message</h3>
              
              {success ? (
                <div className="bg-emerald/10 border border-emerald/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="font-display font-semibold text-xl text-ink mb-2">Message Sent!</h4>
                  <p className="text-ink/70 text-sm">Thank you for reaching out. We will get back to you shortly.</p>
                  <button onClick={() => setSuccess(false)} className="mt-6 text-emerald text-sm font-semibold hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label htmlFor="first-name" className="text-[13px] font-semibold text-ink/80 mb-1">
                        First Name
                      </label>
                      <input
                        id="first-name"
                        name="first-name"
                        type="text"
                        required
                        className="w-full border-b border-cream-line bg-transparent px-0 py-2.5 text-[15px] text-ink placeholder:text-ink/30 focus:border-emerald focus:outline-none transition-colors"
                        placeholder="Aisha"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <label htmlFor="last-name" className="text-[13px] font-semibold text-ink/80 mb-1">
                        Last Name
                      </label>
                      <input
                        id="last-name"
                        name="last-name"
                        type="text"
                        required
                        className="w-full border-b border-cream-line bg-transparent px-0 py-2.5 text-[15px] text-ink placeholder:text-ink/30 focus:border-emerald focus:outline-none transition-colors"
                        placeholder="Khan"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mt-6">
                    <div className="flex flex-col">
                      <label htmlFor="email" className="text-[13px] font-semibold text-ink/80 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full border-b border-cream-line bg-transparent px-0 py-2.5 text-[15px] text-ink placeholder:text-ink/30 focus:border-emerald focus:outline-none transition-colors"
                        placeholder="aisha@example.com"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="phone" className="text-[13px] font-semibold text-ink/80 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="w-full border-b border-cream-line bg-transparent px-0 py-2.5 text-[15px] text-ink placeholder:text-ink/30 focus:border-emerald focus:outline-none transition-colors"
                        placeholder="+91 98XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col mt-6">
                    <label htmlFor="message" className="text-[13px] font-semibold text-ink/80 mb-1">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="w-full border-b border-cream-line bg-transparent px-0 py-2.5 text-[15px] text-ink placeholder:text-ink/30 focus:border-emerald focus:outline-none transition-colors resize-none"
                      placeholder="Tell us what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-10 w-full md:w-auto inline-flex items-center justify-center px-10 py-4 rounded-full bg-emerald text-cream font-body font-semibold text-[15px] tracking-wide shadow-card hover:bg-emerald-deep transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                  <p className="text-ink/45 text-xs mt-4">
                    Your message will be sent securely to our team.
                  </p>
                </form>
              )}
            </div>

          </div>
        </Reveal>

        {/* Map Section */}
        <Reveal>
          <div className="mt-16 w-full h-[350px] rounded-[32px] overflow-hidden shadow-soft border border-cream-line">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.6343079496123!2d72.83233547466212!3d18.947574105992842!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf97053fa197%3A0x7fed08cd2f095674!2sHijabistaa!5e0!3m2!1sen!2sin!4v1784188080814!5m2!1sen!2sin"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Reveal>

        {/* FAQs */}
        <div className="mt-20 max-w-3xl mx-auto">
          <Reveal className="text-center w-full">
            <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-gold" />
              Support
              <span className="h-px w-6 bg-gold" />
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-ink text-center mb-10">
              Frequently Asked Questions
            </h3>
          </Reveal>
          
          <Reveal delay={1} className="space-y-4">
            <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors duration-300">
              <summary className="font-display font-semibold text-ink text-[15px] md:text-base px-6 py-5 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                Do you ship nationwide across India?
                <span className="w-8 h-8 rounded-full bg-cream-deep flex items-center justify-center transition-transform group-open:rotate-180 group-open:bg-emerald/10 group-open:text-emerald text-ink/50">
                  <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-ink/70 text-sm md:text-[15px] leading-relaxed border-t border-cream-line/50 mx-6 pt-4">
                Yes, we proudly ship nationwide across all of India. Delivery typically takes 2-4 business days for metro cities and 5-7 business days across the rest of the country.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors duration-300">
              <summary className="font-display font-semibold text-ink text-[15px] md:text-base px-6 py-5 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                What is your return policy?
                <span className="w-8 h-8 rounded-full bg-cream-deep flex items-center justify-center transition-transform group-open:rotate-180 group-open:bg-emerald/10 group-open:text-emerald text-ink/50">
                  <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-ink/70 text-sm md:text-[15px] leading-relaxed border-t border-cream-line/50 mx-6 pt-4">
                We offer a 7-day return window for items that are unused, unwashed, and have all original tags intact. Please refer to our Refund & Cancellation policy for full details.
              </div>
            </details>

            <details className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors duration-300">
              <summary className="font-display font-semibold text-ink text-[15px] md:text-base px-6 py-5 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                Can I request custom sizing?
                <span className="w-8 h-8 rounded-full bg-cream-deep flex items-center justify-center transition-transform group-open:rotate-180 group-open:bg-emerald/10 group-open:text-emerald text-ink/50">
                  <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-ink/70 text-sm md:text-[15px] leading-relaxed border-t border-cream-line/50 mx-6 pt-4">
                Absolutely! We understand that modest fashion is about the perfect fit. Reach out to us via WhatsApp with your measurements and order details, and we'll be happy to assist.
              </div>
            </details>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
