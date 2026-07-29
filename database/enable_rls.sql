-- PL/pgSQL Block to safely enable RLS and set policies only on tables that exist in the database.
-- This version uses a SECURITY DEFINER function to reliably check if a user is an admin without recursion.
-- It includes a fallback check on auth.users email to ensure admin operations don't get locked out.

-- 0. Create/Update is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean SECURITY DEFINER AS $$
DECLARE
  user_email text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;

  RETURN (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin')
    OR user_email = 'admin@hijabistaa.com'
    OR user_email LIKE '%admin%'
  );
END;
$$ LANGUAGE plpgsql;

-- 0.1 Seed/Fix existing admin profiles in the database
-- This updates existing profile roles to 'admin' for admin emails.
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'hijabistaa01@gmail.com' OR email LIKE '%admin%';

DO $$
BEGIN
    -- 1. Profiles Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles';
        EXECUTE 'CREATE POLICY "Allow users to read their own profile" ON profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow users to insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()))';
    END IF;

    -- 2. Customers Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
        EXECUTE 'ALTER TABLE customers ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read their own customer profile" ON customers';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public/users to insert customer profiles" ON customers';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to update their own customer profile" ON customers';
        EXECUTE 'CREATE POLICY "Allow users to read their own customer profile" ON customers FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow public/users to insert customer profiles" ON customers FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Allow users to update their own customer profile" ON customers FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()))';
    END IF;

    -- 3. Categories Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        EXECUTE 'ALTER TABLE categories ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to categories" ON categories';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to categories" ON categories';
        EXECUTE 'CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to categories" ON categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 4. Products Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        EXECUTE 'ALTER TABLE products ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to products" ON products';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to products" ON products';
        EXECUTE 'CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to products" ON products FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 5. Addresses Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'addresses') THEN
        EXECUTE 'ALTER TABLE addresses ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read their own addresses" ON addresses';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to insert their own addresses" ON addresses';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to update their own addresses" ON addresses';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to delete their own addresses" ON addresses';
        EXECUTE 'CREATE POLICY "Allow users to read their own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow users to insert their own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow users to update their own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow users to delete their own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()))';
    END IF;

    -- 6. Orders Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        EXECUTE 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read their own orders" ON orders';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to insert their own orders" ON orders';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to orders" ON orders';
        EXECUTE 'CREATE POLICY "Allow users to read their own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow users to insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()))';
        EXECUTE 'CREATE POLICY "Allow admin full access to orders" ON orders FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 7. Reviews Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        EXECUTE 'ALTER TABLE reviews ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to reviews" ON reviews';
        EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to insert reviews" ON reviews';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to reviews" ON reviews';
        EXECUTE 'CREATE POLICY "Allow public read access to reviews" ON reviews FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow authenticated users to insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Allow admin full access to reviews" ON reviews FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 8. Inquiries Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries') THEN
        EXECUTE 'ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public insert inquiries" ON inquiries';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON inquiries';
        EXECUTE 'CREATE POLICY "Allow public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to inquiries" ON inquiries FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 9. Hero Slides Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hero_slides') THEN
        EXECUTE 'ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to hero_slides" ON hero_slides';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to hero_slides" ON hero_slides';
        EXECUTE 'CREATE POLICY "Allow public read access to hero_slides" ON hero_slides FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to hero_slides" ON hero_slides FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 10. Coupons Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
        EXECUTE 'ALTER TABLE coupons ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to coupons" ON coupons';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to coupons" ON coupons';
        EXECUTE 'CREATE POLICY "Allow public read access to coupons" ON coupons FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to coupons" ON coupons FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 11. Announcements Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'announcements') THEN
        EXECUTE 'ALTER TABLE announcements ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to announcements" ON announcements';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to announcements" ON announcements';
        EXECUTE 'CREATE POLICY "Allow public read access to announcements" ON announcements FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to announcements" ON announcements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 12. Settings Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
        EXECUTE 'ALTER TABLE settings ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to settings" ON settings';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to settings" ON settings';
        EXECUTE 'CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to settings" ON settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 13. Email OTPs Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_otps') THEN
        EXECUTE 'ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public insert email_otps" ON email_otps';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public select email_otps" ON email_otps';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public delete email_otps" ON email_otps';
        EXECUTE 'CREATE POLICY "Allow public insert email_otps" ON email_otps FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Allow public select email_otps" ON email_otps FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow public delete email_otps" ON email_otps FOR DELETE USING (true)';
    END IF;

    -- 14. Product Variants Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_variants') THEN
        EXECUTE 'ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to product_variants" ON product_variants';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to product_variants" ON product_variants';
        EXECUTE 'CREATE POLICY "Allow public read access to product_variants" ON product_variants FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to product_variants" ON product_variants FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 15. Product Colors Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_colors') THEN
        EXECUTE 'ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to product_colors" ON product_colors';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to product_colors" ON product_colors';
        EXECUTE 'CREATE POLICY "Allow public read access to product_colors" ON product_colors FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to product_colors" ON product_colors FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 16. Cart Items Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cart_items') THEN
        EXECUTE 'ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to manage their own cart items" ON cart_items';
        EXECUTE 'CREATE POLICY "Allow users to manage their own cart items" ON cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;

    -- 17. Order Items Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
        EXECUTE 'ALTER TABLE order_items ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users to read their own order items" ON order_items';
        EXECUTE 'DROP POLICY IF EXISTS "Allow users/admin to insert order items" ON order_items';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to order items" ON order_items';
        EXECUTE 'CREATE POLICY "Allow users to read their own order items" ON order_items FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
            ) OR public.is_admin(auth.uid())
        )';
        EXECUTE 'CREATE POLICY "Allow users/admin to insert order items" ON order_items FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
            ) OR public.is_admin(auth.uid())
        )';
        EXECUTE 'CREATE POLICY "Allow admin full access to order items" ON order_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 18. Testimonials Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
        EXECUTE 'ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to testimonials" ON testimonials';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to testimonials" ON testimonials';
        EXECUTE 'CREATE POLICY "Allow public read access to testimonials" ON testimonials FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to testimonials" ON testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 19. Global FAQs Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'global_faqs') THEN
        EXECUTE 'ALTER TABLE global_faqs ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to global_faqs" ON global_faqs';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to global_faqs" ON global_faqs';
        EXECUTE 'CREATE POLICY "Allow public read access to global_faqs" ON global_faqs FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to global_faqs" ON global_faqs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 20. Instagram Posts Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'instagram_posts') THEN
        EXECUTE 'ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to instagram_posts" ON instagram_posts';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to instagram_posts" ON instagram_posts';
        EXECUTE 'CREATE POLICY "Allow public read access to instagram_posts" ON instagram_posts FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to instagram_posts" ON instagram_posts FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 21. Mega Menu Discover Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mega_menu_discover') THEN
        EXECUTE 'ALTER TABLE mega_menu_discover ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to mega_menu_discover" ON mega_menu_discover';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to mega_menu_discover" ON mega_menu_discover';
        EXECUTE 'CREATE POLICY "Allow public read access to mega_menu_discover" ON mega_menu_discover FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to mega_menu_discover" ON mega_menu_discover FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 22. Product FAQs Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_faqs') THEN
        EXECUTE 'ALTER TABLE product_faqs ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to product_faqs" ON product_faqs';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to product_faqs" ON product_faqs';
        EXECUTE 'CREATE POLICY "Allow public read access to product_faqs" ON product_faqs FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to product_faqs" ON product_faqs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 23. Product Images Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_images') THEN
        EXECUTE 'ALTER TABLE product_images ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to product_images" ON product_images';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to product_images" ON product_images';
        EXECUTE 'CREATE POLICY "Allow public read access to product_images" ON product_images FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to product_images" ON product_images FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 24. Product Information Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_information') THEN
        EXECUTE 'ALTER TABLE product_information ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to product_information" ON product_information';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to product_information" ON product_information';
        EXECUTE 'CREATE POLICY "Allow public read access to product_information" ON product_information FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to product_information" ON product_information FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;

    -- 25. Subscribers Table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscribers') THEN
        EXECUTE 'ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Allow public insert to subscribers" ON subscribers';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admin full access to subscribers" ON subscribers';
        EXECUTE 'CREATE POLICY "Allow public insert to subscribers" ON subscribers FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Allow admin full access to subscribers" ON subscribers FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))';
    END IF;
END
$$;
