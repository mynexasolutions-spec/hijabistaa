"use client";

import Image from "next/image";
import Link from "next/link";
import { navLinks, SITE } from "@/lib/data";
import BotanicalDivider from "./BotanicalDivider";

export default function Footer() {
  return (
    <footer className="relative bg-cream-deep border-t border-cream-line">
      {/* Newsletter Section */}
      <div className="border-b border-cream-line/60 bg-cream/30">
        <div className="max-w-wrap mx-auto px-5 md:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-cream-line">
            <div className="max-w-md text-center md:text-left">
              <h3 className="font-display font-semibold text-2xl text-ink mb-2">Join the Hijabistaa Family</h3>
              <p className="text-ink/60 text-sm leading-relaxed">
                Subscribe to our newsletter for exclusive offers, early access to new collections, and modest styling tips.
              </p>
            </div>
            <form className="w-full md:w-auto flex-1 max-w-md flex gap-3 flex-wrap" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 bg-cream-deep/50 border border-cream-line rounded-full px-6 py-3.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold transition-colors"
                required
              />
              <button 
                type="submit"
                className="bg-ink flex-1 lg:flex-none hover:bg-ink/90 text-cream px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <BotanicalDivider tone="gold" />
      
      {/* Main Footer Content */}
      <div className="max-w-wrap mx-auto px-5 md:px-8 pb-10 pt-12 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-3 inline-flex mb-6">
              <div className="bg-white p-1.5 rounded-full shadow-sm border border-cream-line">
                <Image
                  src="/hijabista-logo.png"
                  alt={`${SITE.name} logo`}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain rounded-full"
                />
              </div>
              <span className="font-display font-semibold text-xl text-ink uppercase tracking-wide">
                {SITE.name}
              </span>
            </Link>
            <p className="text-ink/70 text-sm leading-relaxed mb-6">
              Premium hijabs, scarves &amp; modest essentials with sophisticated detailing, luxurious fabric and timeless silhouettes — shipped nationwide &amp; globally.
            </p>
            <div className="flex items-center gap-3">
              <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-cream-line flex items-center justify-center text-ink/70 hover:text-gold hover:border-gold transition-all shadow-sm hover:-translate-y-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-cream-line flex items-center justify-center text-ink/70 hover:text-gold hover:border-gold transition-all shadow-sm hover:-translate-y-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-cream-line flex items-center justify-center text-ink/70 hover:text-[#25D366] hover:border-[#25D366] transition-all shadow-sm hover:-translate-y-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0c-6.627 0-12 5.373-12 12 0 2.115.549 4.143 1.595 5.952l-1.626 5.945 6.082-1.597c1.782 1.01 3.791 1.542 5.949 1.542 6.627 0 12-5.373 12-12s-5.373-12-12-12zm6.398 17.291c-.272.766-1.579 1.472-2.183 1.545-.53.064-1.218.179-3.415-.733-2.697-1.116-4.408-3.882-4.542-4.062-.132-.179-1.085-1.447-1.085-2.76 0-1.312.688-1.957.935-2.228.245-.272.531-.341.71-.341.178 0 .356.002.518.01.179.009.421-.073.657.494.246.594.844 2.057.92 2.213.076.155.124.336.035.514-.091.179-.136.291-.271.452-.136.162-.288.354-.407.481-.132.144-.271.302-.112.578.158.275.706 1.168 1.516 1.887 1.045.925 1.916 1.212 2.193 1.347.276.134.437.112.602-.075.163-.188.705-.823.896-1.107.19-.283.379-.236.626-.145.247.09 1.564.738 1.832.873.268.134.446.202.512.314.065.112.065.643-.207 1.409z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-ink text-[15px] tracking-wide uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-gold"></span>
              Explore
            </h4>
            <ul className="space-y-3.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink/75 text-sm hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cream-line group-hover:bg-gold transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-ink text-[15px] tracking-wide uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-gold"></span>
              Support
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/policies/privacy" className="text-ink/75 text-sm hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-cream-line group-hover:bg-gold transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="text-ink/75 text-sm hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-cream-line group-hover:bg-gold transition-colors"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="text-ink/75 text-sm hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-cream-line group-hover:bg-gold transition-colors"></span>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="text-ink/75 text-sm hover:text-gold transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-cream-line group-hover:bg-gold transition-colors"></span>
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-4">
            <h4 className="font-display font-semibold text-ink text-[15px] tracking-wide uppercase mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-gold"></span>
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm text-ink/80">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="leading-relaxed">{SITE.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${SITE.email}`} className="hover:text-gold transition-colors break-all">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:${SITE.phoneHref}`} className="hover:text-gold transition-colors">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{SITE.hours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright & Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-cream-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ink/60 text-[13px] font-medium">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[13px] text-ink/60 font-medium">
            <span>Crafted with elegance and modesty.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
