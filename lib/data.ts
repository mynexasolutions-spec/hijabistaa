export const SITE = {
  name: "HIJABISTAA",
  tagline: "Where Modesty Meets Elegance",
  email: "hijabsitaa01@gmail.com",
  phone: "+91 88283 49655",
  phoneHref: "+918828349655",
  whatsapp: "918828349655",
  whatsappAlt: "919767529510",
  whatsappMessage: "Hi HIJABISTAA! I'd like to know more about your collection.",
  city: "Mumbai, India",
  address: "Shop no 19-B & 56, Mohatta Cloth Market, near Hotel HIJABISTAA e Iran, Mumbai 400001",
  hours: "Mon to Sat: 11:30 am to 8:30 pm (Sunday closed)",
  instagram: "__hijabistaa__",
  youtube: "https://youtube.com/@hijabistaa-1229?si=VdmdcKYeobkII47E",
};

export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  count: string;
};

export const categories: Category[] = [
  {
    id: "hijabs",
    name: "Hijabs",
    description: "Basic Luxe chiffon, luxury jersey and multi-colour wrap sets",
    image: "/hijab-medina.jpg",
    count: "32 styles",
  },
  {
    id: "hijab-caps",
    name: "Hijab Caps",
    description: "Breathable cotton & bamboo under-caps with secure stretch fit",
    image: "/hijab-muted-sage.jpeg",
    count: "18 styles",
  },
  {
    id: "shawls",
    name: "Shawls",
    description: "Generous drapes and elegant pashmina shawls for every occasion",
    image: "/abaya-double-layer.png",
    count: "24 styles",
  },
  {
    id: "hijab-accessories",
    name: "Hijab Accessories",
    description: "Magnetic pins, volumizing scrunchies and delicate brooches",
    image: "/khimar-handwork-1.png",
    count: "15 styles",
  },
  {
    id: "prayer-wear",
    name: "Prayer Wear",
    description: "Ultra-soft, full-coverage 2-piece prayer sets and modest abayas",
    image: "/jilbab-blue.png",
    count: "12 styles",
  },
  {
    id: "abaya-accessories",
    name: "Abaya Accessories",
    description: "Luxurious belts, modest slip dresses and layered inner slips",
    image: "/abaya-front-open.png",
    count: "14 styles",
  },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  rating: number;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Front Open Double Layer Abaya",
    category: "Abayas",
    price: 3299,
    oldPrice: 3999,
    image: "/abaya-double-layer.png",
    badge: "Bestseller",
    rating: 4.9,
  },
  {
    id: "p2",
    name: "Basic Luxe Chiffon Hijab — Medina",
    category: "Hijabs",
    price: 699,
    oldPrice: 899,
    image: "/hijab-medina.jpg",
    badge: "New",
    rating: 4.8,
  },
  {
    id: "p3",
    name: "Luxury Jersey Hijab — Muted Sage",
    category: "Hijabs",
    price: 799,
    image: "/hijab-muted-sage.jpeg",
    badge: "Hot",
    rating: 4.9,
  },
  {
    id: "p4",
    name: "Classic Flowing Blue Jilbab",
    category: "Jilbabs",
    price: 3499,
    oldPrice: 4299,
    image: "/jilbab-blue.png",
    badge: "Premium",
    rating: 4.7,
  },
  {
    id: "p5",
    name: "One Layer Khimar — Midnight Black",
    category: "Khimars",
    price: 1299,
    oldPrice: 1599,
    image: "/khimar-one-layer-black.jpg",
    rating: 4.8,
  },
  {
    id: "p6",
    name: "Khimar Handwork — Delicate Detailing",
    category: "Khimars",
    price: 1899,
    oldPrice: 2499,
    image: "/khimar-handwork.png",
    badge: "Handcrafted",
    rating: 4.9,
  },
  {
    id: "p7",
    name: "Royal Overhead Jilbab — Midnight Black",
    category: "Jilbabs",
    price: 3199,
    image: "/jilbab-black.png",
    rating: 4.6,
  },
  {
    id: "p8",
    name: "Double Layer Premium Crepe Abaya",
    category: "Abayas",
    price: 3899,
    image: "/abaya-front-open.png",
    badge: "Popular",
    rating: 4.8,
  },
];

export type Testimonial = {
  name: string;
  city: string;
  quote: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Sumaiya R.",
    city: "Delhi",
    quote:
      "The fabric quality is unlike anything I've ordered online before. My abaya drapes beautifully and the stitching is flawless.",
    initials: "SR",
  },
  {
    name: "Afreen K.",
    city: "Noida",
    quote:
      "Hijabista understands modest fashion doesn't mean boring. Loved the colour options and how fast it reached me.",
    initials: "AK",
  },
  {
    name: "Hina M.",
    city: "Gurugram",
    quote:
      "I messaged on WhatsApp for sizing help and got a reply within minutes. The dress fit perfectly on the first try.",
    initials: "HM",
  },
  {
    name: "Zoya A.",
    city: "Faridabad",
    quote:
      "Ordered three hijabs for Eid and each one felt premium. Definitely my go-to store for modest essentials now.",
    initials: "ZA",
  },
];

export const lookbook = [
  "/lookbook-1.jpg",
  "/lookbook-2.jpg",
  "/lookbook-3.jpg",
  "/lookbook-4.jpg",
  "/lookbook-5.jpg",
  "/lookbook-6.jpg",
];

export const usps = [
  {
    title: "Premium Fabric",
    description: "Crepe, nida & chiffon sourced for drape, breathability and a fabric that lasts seasons, not weeks.",
  },
  {
    title: "Handcrafted Detailing",
    description: "Botanical embroidery and finishing touches stitched by hand, inspired by our own logo's line-art.",
  },
  {
    title: "Modest, Never Plain",
    description: "Considered colour stories and silhouettes so modesty never means settling on style.",
  },
  {
    title: "Pan-India Shipping",
    description: "Dispatched from Delhi NCR with tracked delivery across India, and easy size-exchange support.",
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Category", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
