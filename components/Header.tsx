"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { navLinks, SITE } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { DesktopMegaMenu, MobileMegaMenu } from "./MegaMenu";
import AnnouncementBanner from "./AnnouncementBanner";
import dbData from "@/lib/db.json";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { getShippingSettings } from "@/actions/admin/shipping";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();
  const [user, setUser] = useState<any>(null);
  const isAdmin = user && (user.email === 'admin@hijabistaa.com' || user.user_metadata?.role === 'admin');
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [shipping, setShipping] = useState<any>(null);

  useEffect(() => {
    getShippingSettings()
      .then((data) => setShipping(data))
      .catch((err) => console.error("Error loading header shipping settings:", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkUserSession = () => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; hijabistaa-user-session=`)
      if (parts.length === 2) {
        const val = parts.pop()?.split(';').shift()
        if (val) {
          try {
            const session = JSON.parse(decodeURIComponent(val))
            setUser({ id: session.id, email: session.email, user_metadata: { role: session.role, full_name: session.full_name } })
            return
          } catch (e) {}
        }
      }

      const mockAdmin = document.cookie.includes('mock-admin-logged-in=true')
      if (mockAdmin) {
        setUser({ id: 'mock-admin-id', email: 'admin@hijabistaa.com', user_metadata: { role: 'admin' } })
        return
      }

      setUser(null)
    }

    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
        }
      }).catch(() => { });
    }

    window.addEventListener('hijabistaa-login-status-change', checkUserSession)
    return () => {
      window.removeEventListener('hijabistaa-login-status-change', checkUserSession)
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <div className={`fixed top-0 inset-x-0 z-[99999] flex flex-col pointer-events-none ${open ? "bottom-0 h-[100dvh]" : ""}`}>
        <div className="pointer-events-auto">
          <AnnouncementBanner />
        </div>
        <header
          className={`w-full transition-all duration-300 pointer-events-auto ${open
              ? "bg-cream"
              : scrolled
                ? "bg-cream/90 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(44,34,30,0.15)]"
                : "bg-transparent"
            }`}
        >
          <div className="max-w-wrap mx-auto px-5 md:px-8 flex items-center justify-between h-[72px] md:h-[84px] relative">
          {/* Mobile hamburger — left side on mobile only */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden relative h-10 w-10 flex items-center justify-center text-ink shrink-0 transition-all ${scrolled
                ? "bg-transparent border-transparent shadow-none"
                : "bg-white/95 border border-cream-line/60 rounded-full shadow-sm hover:bg-cream"
              }`}
          >
            <span className="sr-only">Menu</span>
            {open ? (
              <svg className="w-[22px] h-[22px] text-ink" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-[22px] h-[22px] text-ink" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/hijabista-logo.png"
              alt="Hijabista logo"
              width={64}
              height={64}
              className="h-12 w-12 md:h-16 md:w-16 object-contain rounded-full"
              priority
            />
            <span className="font-display font-semibold text-lg md:text-xl tracking-tight text-ink uppercase">
              HIJABISTAA
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-9 h-full">
            {navLinks.map((link) => {
              if (link.label === "Category" || link.label === "Categories") {
                return (
                  <div
                    key={link.label}
                    className="static group flex items-center h-full"
                    onMouseEnter={() => setDesktopCategoryOpen(true)}
                    onMouseLeave={() => setDesktopCategoryOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setDesktopCategoryOpen(!desktopCategoryOpen)}
                      className="font-body text-[16px] font-semibold text-ink hover:text-[#C84B31] transition-colors flex items-center gap-1.5 cursor-pointer py-2"
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 text-ink/40 group-hover:text-[#C84B31] transition-transform duration-200 ${
                          desktopCategoryOpen ? "rotate-180 text-[#C84B31]" : "group-hover:rotate-180"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <DesktopMegaMenu
                      isOpen={desktopCategoryOpen}
                      onClose={() => setDesktopCategoryOpen(false)}
                    />
                  </div>
                );
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-[16px] font-semibold text-ink hover:text-emerald transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-1.5 h-[1.5px] w-0 bg-gold group-hover:w-full transition-all duration-300" />
                </a>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <form onSubmit={handleSearch} className="relative hidden xl:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-60 bg-cream border border-cream-line rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-gold transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center justify-center h-11 w-11 rounded-full bg-gold text-white shadow-md hover:bg-emerald hover:scale-105 transition-all shrink-0`}
              title="Shopping Cart"
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald text-cream text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm animate-scale-up">
                  {cartCount}
                </span>
              )}
            </button>

            {user && (
              <div className="flex items-center gap-4 shrink-0">
                {isAdmin && (
                  <a
                    href="/admin"
                    title="Admin Dashboard"
                    className="text-gold hover:text-emerald transition-colors p-1 shrink-0"
                  >
                    <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="9" rx="1" />
                      <rect x="14" y="3" width="7" height="5" rx="1" />
                      <rect x="14" y="12" width="7" height="9" rx="1" />
                      <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                  </a>
                )}
                <a
                  href="/profile"
                  title="Manage Profile"
                  className="text-gold hover:text-emerald transition-colors p-1 shrink-0"
                >
                  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </a>
              </div>
            )}
            {user ? (
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  localStorage.removeItem('hijabistaa-customer-profile');
                  setUser(null);
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald text-cream font-body font-semibold text-sm tracking-wide hover:bg-emerald-deep transition-colors shadow-card"
              >
                Logout
              </button>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald text-cream font-body font-semibold text-sm tracking-wide hover:bg-emerald-deep transition-colors shadow-card"
              >
                Login/Register
              </a>
            )}
          </div>

          {/* Mobile cart — right side on mobile only */}
          <button
            onClick={() => setCartOpen(true)}
            className="lg:hidden relative h-10 w-10 flex items-center justify-center rounded-full bg-gold text-white shadow-md hover:bg-emerald transition-all shrink-0"
            title="Shopping Cart"
          >
            <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald text-cream text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        </header>

        {/* Mobile menu panel */}
        <div
          className={`lg:hidden flex-1 w-full bg-cream z-[9999] overflow-y-auto overscroll-contain transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
            open ? "block opacity-100 pointer-events-auto" : "hidden opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col px-6 pt-6 pb-32 gap-1">
            {navLinks.map((link, i) => {
              if (link.label === "Category" || link.label === "Categories") {
                const isOpen = activeMobileDropdown === link.label || (activeMobileDropdown === null && mobileCollectionOpen);
                return (
                  <div key={link.label} className="border-b border-cream-line py-3.5">
                    <button
                      onClick={() => {
                        if (isOpen) {
                          setActiveMobileDropdown("");
                          setMobileCollectionOpen(false);
                        } else {
                          setActiveMobileDropdown(link.label);
                          setMobileCollectionOpen(true);
                        }
                      }}
                      className="w-full flex items-center justify-between font-display text-2xl font-semibold text-ink text-left"
                    >
                      <span>{link.label}</span>
                      <svg className={`w-6 h-6 text-gold transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <MobileMegaMenu isOpen={isOpen} onClose={() => setOpen(false)} />
                    )}
                  </div>
                )
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl font-semibold text-ink py-3.5 border-b border-cream-line"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {link.label}
                </a>
              )
            })}
            {user && (
              <>
                {isAdmin && (
                  <a
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="font-display text-2xl font-semibold text-gold py-3.5 border-b border-cream-line flex items-center justify-between"
                  >
                    <span>Admin Dashboard</span>
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="9" rx="1" />
                      <rect x="14" y="3" width="7" height="5" rx="1" />
                      <rect x="14" y="12" width="7" height="9" rx="1" />
                      <rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                  </a>
                )}
                <a
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl font-semibold text-gold py-3.5 border-b border-cream-line flex items-center justify-between"
                >
                  <span>Manage Profile</span>
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </a>
              </>
            )}
            {user ? (
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  localStorage.removeItem('hijabistaa-customer-profile');
                  setUser(null);
                  setOpen(false);
                  window.location.reload();
                }}
                className="mt-7 inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-emerald text-cream font-body font-semibold text-base shadow-card"
              >
                Logout
              </button>
            ) : (
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-7 inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-emerald text-cream font-body font-semibold text-base shadow-card"
              >
                Login/Register
              </a>
            )}
            <div className="mt-8 text-sm text-ink/60 font-body">
              <p>{SITE.phone}</p>
              <p className="mt-1">{SITE.email}</p>
            </div>
          </nav>
        </div>
      </div>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} shipping={shipping} />
    </>
  );
}
