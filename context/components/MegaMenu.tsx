"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
// ----------------------------------------------------
// ICONS FOR THE 6 CATEGORIES (EXACT MATCH TO DESIGN)
// ----------------------------------------------------

export function HijabsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4c-3.8 0-7 3.1-7 7v4c0 3.3 2.7 6 6 6h2c3.3 0 6-2.7 6-6v-4c0-3.9-3.2-7-7-7z M12 8a3.5 3.5 0 0 0-3.5 3.5V14a3.5 3.5 0 0 0 7 0v-2.5A3.5 3.5 0 0 0 12 8z" />
    </svg>
  );
}

export function HijabCapsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8v2c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-2z M8 14v4 M16 14v4 M4 14h16" />
    </svg>
  );
}

export function ShawlsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M10 4v15 M14 4v15 M6 19v2 M10 19v2 M14 19v2 M18 19v2" />
    </svg>
  );
}

export function HijabAccessoriesIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15V9a6 6 0 0 1 12 0v6a3 3 0 0 1-6 0v-3a3 3 0 0 0-6 0v3z M4 15h4 M16 15h4 M12 3v2 M9.5 4.5l-.7-.7 M14.5 4.5l.7-.7 M12 12l.01.01" />
    </svg>
  );
}

export function PrayerWearIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18.5 19c-1.5-3.8-3.8-6.5-6.5-6.5s-5 2.7-6.5 6.5h13z M3 19h18 M8 13.5l-2.5 2.5 M16 13.5l2.5 2.5" />
    </svg>
  );
}

export function AbayaAccessoriesIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 19l3.5-12a2 2 0 0 1 1.9-1.4h1.2a2 2 0 0 1 1.9 1.4L18 19 M6 19h12 M9.5 7h5 M8.5 13h7" />
    </svg>
  );
}

// ----------------------------------------------------
// DATA STRUCTURE
// ----------------------------------------------------

export const categoriesData = [
  {
    id: "premium-hijabs",
    title: "Premium Hijabs",
    description: "Premium Hijabs",
    href: "/shop?category=premium-hijabs",
    image: "/lookbook-1.jpg",
  },
  {
    id: "abaya-accessories",
    title: "Abaya Accessories",
    description: "Luxurious belts, modest slip dresses and layered inner slips",
    href: "/shop?category=abaya-accessories",
    image: "/abaya-front-open.png",
  },
  {
    id: "hijab-accessories",
    title: "Hijab Accessories",
    description: "Magnetic pins, volumizing scrunchies and delicate brooches",
    href: "/shop?category=hijab-accessories",
    image: "/lookbook-2.jpg",
  },
  {
    id: "shawls",
    title: "Shawls",
    description: "Generous drapes and elegant pashmina shawls for every occasion",
    href: "/shop?category=shawls",
    image: "/lookbook-3.jpg",
  },
  {
    id: "hijab-caps",
    title: "Hijab Caps",
    description: "Breathable cotton & bamboo under-caps with secure stretch fit",
    href: "/shop?category=hijab-caps",
    image: "/hijab-muted-sage.jpeg",
  },
  {
    id: "hijabs",
    title: "Hijabs",
    description: "Basic Luxe chiffon, luxury jersey and multi-colour wrap sets",
    href: "/shop?category=hijabs",
    image: "/hijab-medina.jpg",
  },
];

export const discoverData = [
  {
    title: "New Arrivals",
    badge: "New",
    badgeColor: "bg-[#C84B31] text-white",
    href: "/shop?sort=new",
    image: "/hijab-medina.jpg",
  },
  {
    title: "Shop All",
    badge: "Shop All",
    badgeColor: "bg-[#F2DCD6] text-[#C84B31]",
    href: "/shop",
    image: "/abaya-front-open.png",
  },
];


// ----------------------------------------------------
// DESKTOP MEGA MENU
// ----------------------------------------------------

export function DesktopMegaMenu({ isOpen, onClose, categories, discoverItems }: { isOpen?: boolean; onClose?: () => void; categories?: any[]; discoverItems?: any[] }) {
  const displayCategories = categories && categories.length > 0 ? categories : categoriesData;
  const displayDiscover = discoverItems && discoverItems.length > 0 ? discoverItems : discoverData;

  const mainCategories = displayCategories.filter((cat) => !cat.parent_id);
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && mainCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(mainCategories[0].id);
    }
  }, [isOpen, mainCategories, activeCategoryId]);

  const activeCategory = mainCategories.find((c) => c.id === activeCategoryId) || mainCategories[0];
  const subCategories = activeCategory ? displayCategories.filter((cat) => cat.parent_id === activeCategory.id) : [];

  const [categoryProducts, setCategoryProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (activeCategory && subCategories.length === 0) {
      const fetchProducts = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, featured_image_url')
          .eq('category_id', activeCategory.id)
          .eq('is_active', true)
          .limit(6);
        if (data) setCategoryProducts(data);
      };
      fetchProducts();
    } else {
      setCategoryProducts([]);
    }
  }, [activeCategory, subCategories.length]);

  return (
    <>
      <div
        className={`absolute top-[70px] md:top-[82px] left-1/2 -translate-x-1/2 w-[97vw] max-w-[1360px] bg-white border border-cream-line rounded-xl shadow-[0_20px_70px_-15px_rgba(44,34,30,0.18)] transition-all duration-200 transform origin-top z-[100000] overflow-hidden text-left ${
          isOpen
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 scale-[0.98]"
        }`}
      >
        <div className="absolute -top-6 inset-x-0 h-6 bg-transparent" />
        <div className="p-7 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Section: Main Categories (3 cols) */}
            <div className="lg:col-span-3 border-r border-cream-line/40 pr-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[12px] font-bold uppercase tracking-widest text-ink">
                  Categories
                </span>
              </div>
              <div className="w-8 h-[2.5px] bg-[#C84B31] mb-6 rounded-full" />

              <div className="flex flex-col gap-y-1">
                {mainCategories.map((cat) => {
                  const isActive = activeCategoryId === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      onClick={onClose}
                      onMouseEnter={() => setActiveCategoryId(cat.id)}
                      className={`group/cat flex items-center justify-between p-2 rounded-xl transition-all ${isActive ? 'bg-[#FAF5F2] shadow-sm' : 'hover:bg-[#FAF5F2]/50'}`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-lg relative overflow-hidden shrink-0 shadow-sm border border-black/5 group-hover/cat:scale-105 transition-transform duration-300">
                          <Image src={cat.image} alt={cat.title} fill className="object-cover" />
                        </div>
                        <span className={`font-display font-bold text-[14px] leading-tight transition-colors ${isActive ? 'text-[#C84B31]' : 'text-ink group-hover/cat:text-[#C84B31]'}`}>
                          {cat.title}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform shrink-0 ml-2 ${isActive ? 'text-[#C84B31] translate-x-1' : 'text-ink/30 group-hover/cat:text-[#C84B31] group-hover/cat:translate-x-1'}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Middle Section: Subcategories (5 cols) */}
            <div className="lg:col-span-5 pr-4 flex flex-col">
              {activeCategory ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-[12px] font-bold uppercase tracking-widest text-[#A83820]">
                      {activeCategory.title}
                    </span>
                  </div>
                  <div className="h-[2.5px] mb-6" />

                  {subCategories.length > 0 ? (
                    <div className="relative flex-1 py-1">
                      {/* Vertical center divider */}
                      <div className="absolute left-1/2 top-2 bottom-2 w-px bg-cream-line/60 -translate-x-1/2 pointer-events-none" />
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {subCategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={onClose}
                            className="group/sub flex items-center justify-between p-1 rounded-2xl hover:bg-[#FAF5F2]/40 transition-all"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="w-[52px] h-[52px] rounded-xl relative overflow-hidden shrink-0 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-cream-line/30 group-hover/sub:scale-105 group-hover/sub:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.15)] transition-all duration-300">
                                <Image src={sub.image} alt={sub.title} fill className="object-cover" />
                              </div>
                              <span className="font-display font-bold text-[13px] text-ink group-hover/sub:text-[#C84B31] transition-colors leading-tight">
                                {sub.title}
                              </span>
                            </div>
                            <svg
                              className="w-4 h-4 text-ink/30 group-hover/sub:text-[#C84B31] group-hover/sub:translate-x-1 transition-transform shrink-0 ml-1.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : categoryProducts.length > 0 ? (
                    <div className="relative flex-1 py-1">
                      <div className="absolute left-1/2 top-2 bottom-2 w-px bg-cream-line/60 -translate-x-1/2 pointer-events-none" />
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {categoryProducts.map((product) => {
                          const truncatedName = product.name.length > 15 ? product.name.slice(0, 15) + "..." : product.name;
                          return (
                            <Link
                              key={product.id}
                              href={`/shop/${product.slug || product.id}`}
                              onClick={onClose}
                              className="group/prod flex items-center justify-between p-1 rounded-2xl hover:bg-[#FAF5F2]/40 transition-all"
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="w-[52px] h-[52px] rounded-xl relative overflow-hidden shrink-0 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] border border-cream-line/30 group-hover/prod:scale-105 group-hover/prod:shadow-[0_4px_12px_-3px_rgba(0,0,0,0.15)] transition-all duration-300">
                                  <Image src={product.featured_image_url || '/hijab-medina.jpg'} alt={product.name} fill className="object-cover" />
                                </div>
                                <span className="font-display font-bold text-[12px] text-ink group-hover/prod:text-[#C84B31] transition-colors leading-tight">
                                  {truncatedName}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                      <p className="text-sm font-body text-ink/70">Explore our collection of {activeCategory.title}.</p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-center pt-6 border-t border-cream-line/30">
                    <Link
                      href={activeCategory.href}
                      onClick={onClose}
                      className="border border-[#F2DCD6] text-[#C84B31] py-2.5 px-6 rounded-full font-bold hover:bg-[#FAF5F2] hover:shadow-sm transition-all text-sm flex items-center gap-2 group/btn"
                    >
                      View all {activeCategory.title} <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-ink/50">Hover a category to see more</p>
                </div>
              )}
            </div>

            {/* Right Section: Discover (4 cols) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-[#FAF5F2] border border-[#F2E8E3] rounded-3xl p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="font-display text-[12px] font-bold uppercase tracking-widest text-ink">
                    Discover
                  </div>
                  <div className="w-8 h-[2.5px] bg-[#C84B31] mt-1 mb-5 rounded-full" />

                  <div className="grid grid-cols-2 gap-3.5">
                    {displayDiscover.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={onClose}
                        className="group/item flex flex-col p-2.5 rounded-2xl bg-white/70 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-cream-line/60"
                      >
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative border border-cream-line/40 mb-2.5">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                          />
                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-0.5">
                          <h4 className="font-display font-bold text-ink text-[13px] truncate group-hover/item:text-[#C84B31] transition-colors">
                            {item.title}
                          </h4>
                          <svg
                            className="w-3.5 h-3.5 text-ink/40 group-hover/item:text-[#C84B31] group-hover/item:translate-x-1 transition-all shrink-0 ml-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#EAE0DA]">
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-2 text-[12px] font-bold text-[#C84B31] hover:text-[#A83820] flex items-center gap-1.5 transition-colors group/link justify-center"
                  >
                    View all collections <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export function MobileMegaMenu({
  isOpen,
  onClose,
  categories,
  discoverItems,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories?: any[];
  discoverItems?: any[];
}) {
  const displayCategories = categories && categories.length > 0 ? categories : categoriesData;
  const displayDiscover = discoverItems && discoverItems.length > 0 ? discoverItems : discoverData;

  const mainCategories = displayCategories.filter((cat) => !cat.parent_id);

  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) setActiveCategoryId(null);
  }, [isOpen]);

  const activeCategory = mainCategories.find(c => c.id === activeCategoryId);
  const activeSubCategories = activeCategory ? displayCategories.filter(s => s.parent_id === activeCategory.id) : [];
  const [categoryProducts, setCategoryProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (activeCategory && activeSubCategories.length === 0) {
      const fetchProducts = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, featured_image_url')
          .eq('category_id', activeCategory.id)
          .eq('is_active', true)
          .limit(4);
        if (data) setCategoryProducts(data);
      };
      fetchProducts();
    } else {
      setCategoryProducts([]);
    }
  }, [activeCategory, activeSubCategories.length]);

  if (!isOpen) return null;

  return (
    <div className="pl-2 mt-3 space-y-6 animate-fade-in flex flex-col pb-4">
      {activeCategoryId ? (
        <div className="animate-fade-in">
          <button 
            onClick={() => setActiveCategoryId(null)} 
            className="flex items-center gap-2 text-sm font-bold text-ink hover:text-[#C84B31] transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/50">
              {activeCategory?.title}
            </span>
          </div>
          <div className="w-6 h-[2px] bg-[#C84B31] mb-4 rounded-full" />

          {activeSubCategories.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {activeSubCategories.map(sub => (
                <Link 
                  key={sub.id} 
                  href={sub.href} 
                  onClick={onClose} 
                  className="group/sub flex items-center gap-3.5 p-2 rounded-xl bg-white/60 border border-cream-line/50 hover:bg-white hover:border-[#F2DCD6] transition-all"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 shadow-sm">
                    <Image src={sub.image} alt={sub.title} fill className="object-cover" />
                  </div>
                  <span className="font-bold text-[14px] text-ink group-hover/sub:text-[#C84B31]">{sub.title}</span>
                </Link>
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {categoryProducts.map(product => {
                const truncatedName = product.name.length > 15 ? product.name.slice(0, 15) + "..." : product.name;
                return (
                  <Link 
                    key={product.id} 
                    href={`/shop/${product.slug || product.id}`} 
                    onClick={onClose} 
                    className="group/prod flex items-center gap-3.5 p-2 rounded-xl bg-white/60 border border-cream-line/50 hover:bg-white hover:border-[#F2DCD6] transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 shadow-sm group-hover/prod:scale-105 transition-transform">
                      <Image src={product.featured_image_url || '/hijab-medina.jpg'} alt={product.name} fill className="object-cover" />
                    </div>
                    <span className="font-bold text-[14px] text-ink group-hover/prod:text-[#C84B31] leading-tight">{truncatedName}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm font-bold opacity-60 text-ink/70">
              Explore {activeCategory?.title}
            </div>
          )}

          <Link 
            href={activeCategory?.href || "/shop"} 
            onClick={onClose} 
            className="mt-6 block text-center border border-[#F2DCD6] text-[#C84B31] py-3 rounded-xl font-bold hover:bg-[#FAF5F2] text-sm transition-all"
          >
            View all {activeCategory?.title}
          </Link>
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/50">
                Categories
              </span>
            </div>
            <div className="w-6 h-[2px] bg-[#C84B31] mb-4 rounded-full" />

            <div className="flex flex-col gap-3">
              {mainCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="group/cat flex items-center justify-between p-2 rounded-xl bg-white/60 hover:bg-white border border-cream-line/50 hover:border-[#F2DCD6] transition-all text-left w-full"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-lg bg-[#FAF3F0] text-[#C84B31] flex items-center justify-center shrink-0 group-hover/cat:scale-105 transition-transform relative overflow-hidden border border-[#F2DCD6]/50">
                      <Image src={cat.image} alt={cat.title} fill className="object-cover" />
                    </div>
                    <span className="font-display font-bold text-[14px] text-ink group-hover/cat:text-[#C84B31] transition-colors leading-tight truncate">
                      {cat.title}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-ink/40 group-hover/cat:text-[#C84B31] group-hover/cat:translate-x-1 transition-all shrink-0 ml-1.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/50">
                Discover
              </span>
            </div>
            <div className="w-6 h-[2px] bg-[#C84B31] mb-3 rounded-full" />

            <div className="grid grid-cols-2 gap-2.5">
              {displayDiscover.map((item) => (
                <Link
                  key={item.id || item.title}
                  href={item.href}
                  onClick={onClose}
                  className="group/item relative flex flex-col p-2 rounded-2xl bg-[#FAF5F2]/50 border border-[#F2DCD6]/30 hover:bg-white hover:border-[#F2DCD6] hover:shadow-sm transition-all"
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative border border-[#EAE0DA]/50 mb-2 shadow-sm group-hover/item:shadow-md transition-all">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover/item:scale-105 transition-transform duration-500" />
                    {item.badge && (
                      <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-ink text-[12px] truncate px-1">
                    {item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
