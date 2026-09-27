// SQL Schema for BUNKAR SANSKRITI Supabase database
// Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/epkmdmenneocgpzuhrne/sql)

export const SUPABASE_SQL_SETUP = `
-- 1. Create Products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC,
  sale_price NUMERIC,
  short_description TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  is_outlet BOOLEAN DEFAULT false,
  fabric TEXT,
  weave TEXT,
  color TEXT,
  zari_type TEXT,
  tags TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  enabled BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Orders table (stores every customer order & WhatsApp checkout)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  customer_note TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT,
  via_whatsapp BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  product_id TEXT,
  product_name TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Business Settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  business_name TEXT DEFAULT 'BUNKAR SANSKRITI',
  tagline TEXT DEFAULT 'TRADITION WOVEN WITH GRACE',
  sonu_phone TEXT DEFAULT '9305564295',
  shop_phone TEXT DEFAULT '9250420097',
  aman_phone TEXT DEFAULT '8468098924',
  email TEXT DEFAULT 'shadabk3050@gamil.com',
  address TEXT DEFAULT 'Plot No-17, Ravindrapuri Extension, Lanka Road, Opp. Oriyana Hospital, Near Champaran Restaurant, Varanasi – 221005, Uttar Pradesh, India',
  google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/Bnx9Se7HRZ9hL7bB9',
  instagram_handle TEXT DEFAULT '@BUNKAR.__SANSKRITI',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/BUNKAR.__SANSKRITI',
  whatsapp_number TEXT DEFAULT '9305564295',
  business_hours JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) & Allow public read/insert for customer orders
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon/authenticated roles
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to categories" ON public.categories;
CREATE POLICY "Allow all access to categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to enquiries" ON public.enquiries;
CREATE POLICY "Allow all access to enquiries" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to business_settings" ON public.business_settings;
CREATE POLICY "Allow all access to business_settings" ON public.business_settings FOR ALL USING (true) WITH CHECK (true);
`;
