export const SITE = {
  name: "HIJABISTAA",
  tagline: "Where Modesty Meets Elegance",
  email: "hijabistaa01@gmail.com",
  phone: "+91 88283 49655",
  phoneHref: "+918828349655",
  whatsapp: "918828349655",
  whatsappAlt: "919767529510",
  whatsappMessage: "Hi HIJABISTAA! I'd like to know more about your collection.",
  city: "Mumbai, India",
  address: "Shop no 19-B & 56 mohatta cloth market near hotel Gulshan e Iran Mumbai 400001",
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
    id: "chiffon-hijabs",
    name: "Chiffon Hijabs",
    description: "Basic Luxe chiffon, perfect for elegant drapes",
    image: "/hijab-medina.jpg",
    count: "12 styles",
  },
  {
    id: "jersey-hijabs",
    name: "Jersey Hijabs",
    description: "Luxury jersey, ultra-soft and stretchy",
    image: "/hijab-muted-sage.jpeg",
    count: "8 styles",
  },
  {
    id: "modal-hijabs",
    name: "Modal Hijabs",
    description: "Breathable and lightweight modal blends",
    image: "/hijab-medina.jpg",
    count: "5 styles",
  },
  {
    id: "premium-hijabs",
    name: "Premium Hijabs",
    description: "Our highest quality fabric selections",
    image: "/hijab-muted-sage.jpeg",
    count: "4 styles",
  }
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
  size?: string;
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
    size: "Free Size (Fits S to XXL)",
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
    size: "Free Size",
  },
  {
    id: "p3",
    name: "Luxury Jersey Hijab — Muted Sage",
    category: "Hijabs",
    price: 799,
    image: "/hijab-muted-sage.jpeg",
    badge: "Hot",
    rating: 4.9,
    size: "Free Size",
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
    size: "One Size",
  },
  {
    id: "p5",
    name: "One Layer Khimar — Midnight Black",
    category: "Khimars",
    price: 1299,
    oldPrice: 1599,
    image: "/khimar-one-layer-black.jpg",
    rating: 4.8,
    size: "200 × 75cm",
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
    size: "200 × 75cm",
  },
  {
    id: "p7",
    name: "Royal Overhead Jilbab — Midnight Black",
    category: "Jilbabs",
    price: 3199,
    image: "/jilbab-black.png",
    rating: 4.6,
    size: "One Size",
  },
  {
    id: "p8",
    name: "Double Layer Premium Crepe Abaya",
    category: "Abayas",
    price: 3899,
    image: "/abaya-front-open.png",
    badge: "Popular",
    rating: 4.8,
    size: "Free Size",
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
    city: "Mumbai",
    quote:
      "The premium chiffon drapes beautifully and stays in place all day. The quality is exceptional, definitely buying more colors.",
    initials: "SR",
  },
  {
    name: "Afreen K.",
    city: "Noida",
    quote:
      "Hijabista understands modest fashion perfectly. The jersey hijabs are so soft and breathable, even in the summer heat.",
    initials: "AK",
  },
  {
    name: "Hina M.",
    city: "Gurugram",
    quote:
      "I ordered the instant hijabs and they are a lifesaver for busy mornings. Fast shipping and excellent packaging too!",
    initials: "HM",
  },
  {
    name: "Zoya A.",
    city: "Faridabad",
    quote:
      "The colors are exactly as shown on the website. These modal hijabs feel so luxurious. My new go-to store for modest essentials.",
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
    title: " Premuim breathable fabric",
    description: " We source high-quality materials—from everyday breathable cotton and airy chiffon to luxury modal—that drape elegantly and keep you cool all day long.",
  },
  {
    title: "curated colour pallet",
    description: "We offer a huge range of beautiful, universally flattering neutrals and vibrant tones to complement every skin tone and outfit.",
  },
  {
    title: "All day stay put fit",
    description: "No more constant adjustments. Our meticulously designed cuts, generous lengths, and optional grip undercaps ensure your hijab stays securely in place from morning to night",
  },
  {
    title: "Pan-India Shipping",
    description: "Dispatched from Mumbai with tracked delivery across India, and easy size-exchange support.",
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Category", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
