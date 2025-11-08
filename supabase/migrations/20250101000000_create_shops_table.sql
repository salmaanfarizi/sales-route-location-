-- Create shops table for Al-Hasa Sales Route Collector
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL,
  place_name TEXT,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  google_maps_link TEXT,
  route TEXT NOT NULL CHECK (route IN ('Route 1', 'Route 2', 'Route 3', 'Route 4')),
  store_type TEXT NOT NULL CHECK (store_type IN ('With Supervisor', 'Without Supervisor', 'Discount Store')),
  operating_hours TEXT NOT NULL CHECK (operating_hours IN ('Daytime', '24 Hours')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on route for faster filtering
CREATE INDEX IF NOT EXISTS idx_shops_route ON public.shops(route);

-- Create index on store_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_shops_store_type ON public.shops(store_type);

-- Create index on operating_hours for faster filtering
CREATE INDEX IF NOT EXISTS idx_shops_operating_hours ON public.shops(operating_hours);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON public.shops(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated and anon users
-- (You can make this more restrictive later)
CREATE POLICY "Enable read access for all users" ON public.shops
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON public.shops
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.shops
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON public.shops
  FOR DELETE
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.shops IS 'Stores information about shops/stores for sales route collection in Al-Hasa';
COMMENT ON COLUMN public.shops.shop_name IS 'Name of the shop (extracted from photo via OCR)';
COMMENT ON COLUMN public.shops.place_name IS 'Place name from reverse geocoding';
COMMENT ON COLUMN public.shops.latitude IS 'GPS latitude coordinate';
COMMENT ON COLUMN public.shops.longitude IS 'GPS longitude coordinate';
COMMENT ON COLUMN public.shops.google_maps_link IS 'Google Maps link for the location';
COMMENT ON COLUMN public.shops.route IS 'Sales route assignment (Route 1-4)';
COMMENT ON COLUMN public.shops.store_type IS 'Type of store supervision';
COMMENT ON COLUMN public.shops.operating_hours IS 'Operating hours classification';
COMMENT ON COLUMN public.shops.photo_url IS 'URL to uploaded shop photo';
