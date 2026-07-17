"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
    id: "hijabs",
    title: "Hijabs",
    href: "/shop?category=hijabs",
    icon: HijabsIcon,
  },
  {
    id: "hijab-caps",
    title: "Hijab Caps",
    href: "/shop?category=hijab-caps",
    icon: HijabCapsIcon,
  },
  {
    id: "shawls",
    title: "Shawls",
    href: "/shop?category=shawls",
    icon: ShawlsIcon,
  },
  {
    id: "hijab-accessories",
    title: "Hijab Accessories",
    href: "/shop?category=hijab-accessories",
    icon: HijabAccessoriesIcon,
  },
  {
    id: "prayer-wear",
    title: "Prayer Wear",
    href: "/shop?category=prayer-wear",
    icon: PrayerWearIcon,
  },
  {
    id: "abaya-accessories",
    title: "Abaya Accessories",
    href: "/shop?category=abaya-accessories",
    icon: AbayaAccessoriesIcon,
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

export function DesktopMegaMenu({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      <div
        className={`absolute top-[70px] md:top-[82px] left-1/2 -translate-x-1/2 w-[97vw] max-w-[1360px] bg-white border border-cream-line rounded-xl shadow-[0_20px_70px_-15px_rgba(44,34,30,0.18)] transition-all duration-200 transform origin-top z-[100000] overflow-hidden text-left ${
          isOpen
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 scale-[0.98]"
        }`}
      >
        {/* Invisible 24px bridge extending above the card to guarantee zero gap when mouse moves */}
        <div className="absolute -top-6 inset-x-0 h-6 bg-transparent" />
        <div className="p-7 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section: 6 Categories (8 cols) */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[12px] font-bold uppercase tracking-widest text-ink">
                  Categories
                </span>
              </div>
              <div className="w-8 h-[2.5px] bg-[#C84B31] mb-6 rounded-full" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                {categoriesData.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      onClick={onClose}
                      className="group/cat flex items-center justify-between p-2.5 rounded-xl border border-cream-line/60 bg-[#FAF5F2]/40 hover:bg-white hover:border-[#F2DCD6] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF3F0] text-[#C84B31] border border-[#F2DCD6]/70 flex items-center justify-center shrink-0 group-hover/cat:scale-105 group-hover/cat:bg-[#FCECE8] transition-all duration-300 shadow-sm">
                          <IconComponent className="w-[22px] h-[22px]" />
                        </div>
                        <span className="font-display font-bold text-[14px] text-ink group-hover/cat:text-[#C84B31] transition-colors leading-tight">
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
                    </Link>
                  );
                })}
              </div>
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
                    {discoverData.map((item) => (
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

                <div className="mt-5 pt-3 border-t border-[#EAE0DA] flex items-center justify-start">
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="text-[13px] font-bold text-[#C84B31] hover:text-[#A83820] flex items-center gap-1.5 transition-colors group/link"
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

// ----------------------------------------------------
// MOBILE MEGA MENU (RESPONSIVE ACCORDION)
// ----------------------------------------------------

export function MobileMegaMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="pl-2 mt-3 space-y-6 animate-fade-in flex flex-col pb-4">
      {/* Categories Grid on Mobile */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/50">
            Categories
          </span>
        </div>
        <div className="w-6 h-[2px] bg-[#C84B31] mb-4 rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categoriesData.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                onClick={onClose}
                className="group/cat flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-cream-line/80 bg-white/60 hover:bg-white hover:border-[#F2DCD6] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FAF3F0] text-[#C84B31] border border-[#F2DCD6]/70 flex items-center justify-center shrink-0 group-hover/cat:scale-105 transition-transform">
                    <IconComponent className="w-[21px] h-[21px] sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <span className="font-display font-bold text-[13px] sm:text-[14px] text-ink group-hover/cat:text-[#C84B31] transition-colors leading-tight truncate">
                    {cat.title}
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-ink/40 group-hover/cat:text-[#C84B31] group-hover/cat:translate-x-1 transition-all shrink-0 ml-1.5"
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

      {/* Discover Section on Mobile */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/50">
            Discover
          </span>
        </div>
        <div className="w-6 h-[2px] bg-[#C84B31] mb-3 rounded-full" />

        <div className="grid grid-cols-2 gap-2.5">
          {discoverData.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className="flex flex-col p-2.5 rounded-2xl bg-[#FAF5F2] border border-[#F2E8E3] hover:bg-white transition-colors"
            >
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative border border-cream-line/40 mb-2">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-sm ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <div className="flex items-center justify-between px-0.5">
                <h4 className="font-display font-bold text-ink text-[12px] truncate">
                  {item.title}
                </h4>
                <svg className="w-3.5 h-3.5 text-[#C84B31] shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
