import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--bricolage",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HIJABISTAA | Hijab & Scarf — Modest Fashion Elevated",
  description:
    "HIJABISTAA crafts premium hijabs, scarves and modest essentials with sophisticated detailing, luxurious fabric and timeless silhouettes.",
  keywords: [
    "Hijabistaa",
    "modest fashion",
    "hijab",
    "scarf",
    "modest wear",
  ],
  icons: {
    icon: '/hijabista-logo.png',
    apple: '/hijabista-logo.png',
  },
  openGraph: {
    title: "HIJABISTAA | Hijab & Scarf — Modest Fashion Elevated",
    description:
      "Premium hijabs, scarves and modest essentials crafted with sophisticated detailing and luxurious fabric.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <body className="font-body bg-cream text-ink antialiased" suppressHydrationWarning>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <FloatingWhatsApp />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
