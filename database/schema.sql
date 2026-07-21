-- HIJABISTAA Supabase Complete Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.1 Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  count TEXT,
  parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT REFERENCES categories(id),
  price NUMERIC NOT NULL,
  "oldPrice" NUMERIC,
  image_url TEXT,
  badge TEXT,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  short_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address_line_1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  address_id UUID REFERENCES addresses(id),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT,
  order_status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  text_mode TEXT DEFAULT 'global',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  position TEXT DEFAULT 'right',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'global-settings-id',
  home_banner_enabled BOOLEAN DEFAULT true,
  promo_popup JSONB,
  hero_text JSONB,
  announcement_banner JSONB,
  shipping JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Email OTPs Table
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  full_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  variant_id UUID,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  price_at_purchase NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  line_total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'subscribed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Instagram Posts Table
CREATE TABLE IF NOT EXISTS instagram_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT 'https://www.instagram.com/__hijabistaa__',
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Mega Menu Discover Table
CREATE TABLE IF NOT EXISTS mega_menu_discover (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  badge TEXT,
  badge_color TEXT,
  href TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  quote TEXT NOT NULL,
  initials TEXT,
  product TEXT,
  rating INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. Global FAQs Table
CREATE TABLE IF NOT EXISTS global_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Row Level Security (RLS) & Policies ───────────────────

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public newsletter subscription" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role & admin full access to subscribers" ON subscribers FOR ALL USING (true);

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to instagram posts" ON instagram_posts FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to instagram posts" ON instagram_posts FOR ALL USING (true);

ALTER TABLE mega_menu_discover ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to mega_menu_discover" ON mega_menu_discover FOR SELECT USING (true);
CREATE POLICY "Allow authenticated admins full access to mega_menu_discover" ON mega_menu_discover FOR ALL USING (auth.role() = 'authenticated');

-- ─── Sample / Seed Data ──────────────────────────────────────

INSERT INTO instagram_posts (id, image_url, link_url, caption, display_order, is_active)
VALUES
  ('insta-1', 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=600&auto=format&fit=crop', 'https://www.instagram.com/__hijabistaa__', 'Flowing Double Layer Abaya', 1, true),
  ('insta-2', 'https://images.unsplash.com/photo-1608228079968-c76819b11456?q=80&w=600&auto=format&fit=crop', 'https://www.instagram.com/__hijabistaa__', 'Medina Silk Hijab Collection', 2, true),
  ('insta-3', 'https://images.unsplash.com/photo-1598555310619-74d32049d5c4?q=80&w=600&auto=format&fit=crop', 'https://www.instagram.com/__hijabistaa__', 'Luxe Salwar Suit Details', 3, true),
  ('insta-4', 'https://images.unsplash.com/photo-1621217036662-79ee88619379?q=80&w=600&auto=format&fit=crop', 'https://www.instagram.com/__hijabistaa__', 'Royal Blue Jilbab Set', 4, true),
  ('insta-5', 'https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=600&auto=format&fit=crop', 'https://www.instagram.com/__hijabistaa__', 'Handwork Khimar Elegance', 5, true),
  ('insta-6', 'https://images.unsplash.com/photo-1616781296191-49e3975000a6?q=80&w=600&auto=format&fit=crop', 'https://www.instagram.com/__hijabistaa__', 'Modest Fashion Inspiration', 6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO mega_menu_discover (title, badge, badge_color, href, image_url, display_order)
VALUES 
  ('New Arrivals', 'New', 'bg-[#C84B31] text-white', '/shop?sort=new', '/hijab-medina.jpg', 0),
  ('Shop All', 'Shop All', 'bg-[#F2DCD6] text-[#C84B31]', '/shop', '/abaya-front-open.png', 1)
ON CONFLICT DO NOTHING;

INSERT INTO subscribers (id, email, status, created_at)
VALUES 
  ('sub-101', 'sumaiya.khan@gmail.com', 'subscribed', NOW()),
  ('sub-102', 'afreen.fatima@gmail.com', 'subscribed', NOW()),
  ('sub-103', 'zoya.shaikh@hotmail.com', 'subscribed', NOW())
ON CONFLICT (email) DO NOTHING;
