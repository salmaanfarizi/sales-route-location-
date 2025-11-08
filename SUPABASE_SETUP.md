# 🚀 Supabase Setup Guide - Complete CLI Walkthrough

The ultimate free, powerful database for your Sales Route Collector app!

## ✨ Why Supabase?

- ✅ **100% FREE Forever** - 500 MB database (your data = ~5 MB)
- ✅ **Unlimited Records** - Add 10,000+ shops if needed
- ✅ **PostgreSQL** - Industry-standard, rock-solid database
- ✅ **Beautiful UI** - Better than Google Sheets
- ✅ **CLI Tools** - Professional database management
- ✅ **Real-time** - See data updates live
- ✅ **No Credential Hassles** - No service accounts, no org policies

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Detailed Setup with CLI](#detailed-setup-with-cli)
3. [Database Schema](#database-schema)
4. [Testing Locally](#testing-locally)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (5 minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email

### Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Name:** `al-hasa-sales-routes`
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you (e.g., West US, Singapore)
3. Click **"Create new project"**
4. Wait ~2 minutes for setup ☕

### Step 3: Get Your Credentials

Once your project is ready:

1. Go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (long string)

### Step 4: Configure Your App

```bash
# Navigate to your project
cd sales-route-location-

# Create .env file
nano .env
```

Add these lines:

```env
PORT=5000
NODE_ENV=development

# Google Maps API Key (you already have this)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_actual_key_here

# Client URL
CLIENT_URL=http://localhost:3000
```

Save: `Ctrl + O`, `Enter`, `Ctrl + X`

```bash
# Create client .env
nano client/.env
```

Add:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Save and exit.

### Step 5: Create Database Table

Go to your Supabase project dashboard:

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste this entire SQL:

```sql
-- Create shops table
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

-- Create indexes
CREATE INDEX idx_shops_route ON public.shops(route);
CREATE INDEX idx_shops_created_at ON public.shops(created_at DESC);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now)
CREATE POLICY "Enable all access" ON public.shops FOR ALL USING (true);
```

4. Click **"Run"** (or press `Ctrl + Enter`)
5. You should see "Success. No rows returned"

### Step 6: Install & Run

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2 - open new tab)
npm run client
```

### Step 7: Test!

1. Open http://localhost:3000
2. Click camera, take photo
3. Fill in route, store type, operating hours
4. Click "Save Shop Data"
5. Go to Supabase Dashboard → **Table Editor** → **shops**
6. See your data! 🎉

---

## 🛠️ Detailed Setup with CLI

### Why Use Supabase CLI?

- ✅ Manage database locally
- ✅ Version control your schema (migrations)
- ✅ Test without affecting production
- ✅ Professional workflow

### Install Supabase CLI

**On Mac:**
```bash
brew install supabase/tap/supabase
```

**On Windows (with Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**On Linux:**
```bash
brew install supabase/tap/supabase
```

**Verify installation:**
```bash
supabase --version
# Should show: supabase 1.x.x
```

### Initialize Supabase in Your Project

```bash
# Navigate to project
cd sales-route-location-

# Login to Supabase
supabase login

# This opens a browser for authentication
# Grant access

# Link to your project
supabase link --project-ref your-project-ref

# Find your project ref in the Project URL:
# https://YOUR-PROJECT-REF.supabase.co
```

### Run Migrations

```bash
# Apply the migration to your cloud database
supabase db push

# This runs the SQL from:
# supabase/migrations/20250101000000_create_shops_table.sql
```

### Start Local Development (Optional)

```bash
# Start Supabase locally with Docker
supabase start

# This starts:
# - Local PostgreSQL database
# - Local Supabase Studio (UI)
# - Local APIs

# You'll see output like:
# API URL: http://localhost:54321
# Studio URL: http://localhost:54323
# anon key: eyJhbG...
```

**Update .env for local development:**
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbG... (from supabase start output)
```

**Stop local Supabase:**
```bash
supabase stop
```

### Create New Migrations

```bash
# Create a new migration file
supabase migration new add_shop_category

# This creates:
# supabase/migrations/TIMESTAMP_add_shop_category.sql

# Edit the file and add your SQL
# Then push:
supabase db push
```

---

## 📊 Database Schema

### Shops Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `shop_name` | TEXT | Shop name (from OCR) |
| `place_name` | TEXT | Location name (from GPS) |
| `latitude` | DECIMAL(10,6) | GPS latitude |
| `longitude` | DECIMAL(10,6) | GPS longitude |
| `google_maps_link` | TEXT | Google Maps URL |
| `route` | TEXT | Route 1, 2, 3, or 4 |
| `store_type` | TEXT | Supervisor type |
| `operating_hours` | TEXT | Daytime or 24 Hours |
| `photo_url` | TEXT | Shop photo URL |
| `created_at` | TIMESTAMPTZ | Auto timestamp |
| `updated_at` | TIMESTAMPTZ | Auto updated |

### Constraints & Validation

```sql
-- Route must be one of these
CHECK (route IN ('Route 1', 'Route 2', 'Route 3', 'Route 4'))

-- Store type must be one of these
CHECK (store_type IN ('With Supervisor', 'Without Supervisor', 'Discount Store'))

-- Operating hours must be one of these
CHECK (operating_hours IN ('Daytime', '24 Hours'))
```

---

## 🧪 Testing Locally

### 1. View Data in Supabase Studio

**Cloud Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"Table Editor"**
4. Click **"shops"** table
5. See all your data in spreadsheet view

**Local Dashboard (if using `supabase start`):**
1. Go to http://localhost:54323
2. Click **"Table Editor"**
3. View/edit data locally

### 2. Test API Endpoints

```bash
# Get all shops
curl http://localhost:5000/api/sheets/data

# Add a test shop
curl -X POST http://localhost:5000/api/sheets/add \
  -H "Content-Type: application/json" \
  -d '{
    "shopName": "Test Shop",
    "placeName": "Al-Hasa",
    "latitude": 25.3797,
    "longitude": 49.5857,
    "googleMapsLink": "https://maps.google.com/?q=25.3797,49.5857",
    "route": "Route 1",
    "storeType": "With Supervisor",
    "operatingHours": "Daytime"
  }'
```

### 3. Run SQL Queries

In Supabase Dashboard → SQL Editor:

```sql
-- Count shops by route
SELECT route, COUNT(*) as count
FROM shops
GROUP BY route
ORDER BY route;

-- Get recent shops
SELECT shop_name, route, created_at
FROM shops
ORDER BY created_at DESC
LIMIT 10;

-- Get shops by operating hours
SELECT operating_hours, COUNT(*) as count
FROM shops
GROUP BY operating_hours;
```

---

## 🌐 Deployment to Render

### Update render.yaml

The file is already configured! Just add environment variables in Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `GOOGLE_MAPS_API_KEY` | Your Maps API key |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your anon key |

Then deploy normally:

```bash
git add .
git commit -m "Switch to Supabase"
git push origin claude/initial-setup-011CUsBxuGpvpXbMJP5mJE61
```

In Render: It auto-deploys! ✅

---

## 🐛 Troubleshooting

### Error: "Supabase not configured"

**Solution:**
```bash
# Check .env file exists
cat .env

# Should see SUPABASE_URL and SUPABASE_ANON_KEY
# If missing, add them

# Restart server
npm run dev
```

### Error: "relation public.shops does not exist"

**Solution:**
```bash
# Run the migration
supabase db push

# Or create table manually in SQL Editor (see Quick Start Step 5)
```

### Error: "Invalid API key"

**Solution:**
```bash
# Get fresh keys from dashboard
# Supabase Dashboard → Settings → API
# Copy anon public key (NOT service_role key!)
# Update .env
# Restart server
```

### Error: "Row level security policy violation"

**Solution:**
```sql
-- In SQL Editor, enable access:
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access" ON public.shops
  FOR ALL
  USING (true);
```

### CLI Not Found

**Solution:**
```bash
# Mac
brew install supabase/tap/supabase

# Verify
which supabase
```

### Can't See Data in Dashboard

**Solution:**
1. Check you're in the right project
2. Click "Table Editor" → "shops"
3. Check RLS policies allow reads
4. Try SQL Editor: `SELECT * FROM shops;`

---

## 💡 Pro Tips

### 1. Backup Your Data

```bash
# Export to SQL
supabase db dump -f backup.sql

# Restore
supabase db reset
```

### 2. Use Database Functions

Create SQL functions for complex queries:

```sql
CREATE OR REPLACE FUNCTION get_route_stats()
RETURNS TABLE(route TEXT, shop_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT shops.route, COUNT(*)
  FROM shops
  GROUP BY shops.route;
END;
$$ LANGUAGE plpgsql;

-- Call it:
SELECT * FROM get_route_stats();
```

### 3. Set Up Real-time Updates

In your React app, subscribe to changes:

```javascript
const subscription = supabase
  .from('shops')
  .on('INSERT', payload => {
    console.log('New shop added!', payload)
  })
  .subscribe()
```

### 4. Add Full-Text Search

```sql
-- Add search column
ALTER TABLE shops ADD COLUMN search_vector tsvector;

-- Create search index
CREATE INDEX idx_shops_search ON shops USING GIN(search_vector);

-- Update search on insert/update
-- (Create trigger for this)
```

### 5. Use Supabase Storage for Photos

Instead of base64 URLs, upload photos to Supabase Storage:

```javascript
const { data, error } = await supabase.storage
  .from('shop-photos')
  .upload('shop-123.jpg', photoBlob)
```

---

## 📱 Supabase Mobile App

Download the Supabase mobile app to manage your database on the go:

- iOS: App Store → "Supabase"
- Android: Google Play → "Supabase"

View/edit data from your phone!

---

## 🔐 Security Best Practices

### Row Level Security (RLS)

Make policies more restrictive in production:

```sql
-- Example: Only allow inserts from your app
CREATE POLICY "Insert for authenticated"
  ON shops FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Example: Read-only for public
CREATE POLICY "Read for all"
  ON shops FOR SELECT
  USING (true);
```

### API Keys

- ✅ **anon key**: Use in frontend (safe to expose)
- ❌ **service_role key**: NEVER expose! Server-only

### Environment Variables

```bash
# NEVER commit these:
.env
client/.env

# Always in .gitignore!
```

---

## 📚 Resources

- **Documentation:** https://supabase.com/docs
- **SQL Reference:** https://supabase.com/docs/guides/database
- **CLI Reference:** https://supabase.com/docs/guides/cli
- **API Reference:** https://supabase.com/docs/reference/javascript/introduction

---

## ✅ Success Checklist

- [ ] Supabase account created
- [ ] Project created (al-hasa-sales-routes)
- [ ] Got Project URL and anon key
- [ ] Updated .env files
- [ ] Created shops table (via SQL Editor or migration)
- [ ] Installed dependencies
- [ ] Server running (✅ Supabase initialized)
- [ ] Frontend running
- [ ] Test shop added successfully
- [ ] Data visible in Supabase Dashboard
- [ ] (Optional) Supabase CLI installed
- [ ] (Optional) Linked to project via CLI

---

## 🎉 You're All Set!

Your app now has:
- ✅ Professional PostgreSQL database
- ✅ Free forever (500 MB)
- ✅ Unlimited shop records
- ✅ Beautiful UI dashboard
- ✅ Real-time capabilities
- ✅ CLI tools for power users
- ✅ Production-ready security

**Next Steps:**
1. Test your app locally
2. Add some shops
3. View data in Supabase Dashboard
4. Deploy to Render
5. Start collecting real data!

---

**Setup Time:** 5 minutes (Quick Start) | 15 minutes (with CLI)
**Cost:** FREE forever
**Difficulty:** Easy ⭐

🎊 Welcome to the world of professional database management!

Need help? Check the [Troubleshooting](#troubleshooting) section or ask me! 😊
