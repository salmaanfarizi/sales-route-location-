# 🚀 Quick Deployment Guide - Sales Route Collector

This guide will get your app deployed to Render in **5 minutes**.

## 📋 Prerequisites

You need these credentials ready:

1. **Supabase Credentials**:
   - Project URL: `https://gxqkaholmxyjdifxejle.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from Supabase Dashboard → Settings → API)

2. **Google Maps API Key**:
   - Get from: Google Cloud Console → APIs & Services → Credentials

---

## Step 1: Set Up Supabase Database (2 minutes)

### Option A: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard
2. Select your project: `gxqkaholmxyjdifxejle`
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New query"**
5. Copy and paste the entire contents of `supabase/migrations/20250101000000_create_shops_table.sql`
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed and linked
supabase db push
```

### Verify Table Created

1. Go to **"Table Editor"** in Supabase Dashboard
2. You should see a table named **"shops"**
3. It should have 12 columns (id, shop_name, place_name, etc.)

---

## Step 2: Deploy to Render (3 minutes)

### Option A: Using Render Dashboard

1. **Go to**: https://dashboard.render.com

2. **If service already exists**:
   - Click on your service `sales-route-manager`
   - Go to **"Settings"**
   - Find **"Branch"** field
   - Change to: `claude/check-011CUvLScv3d6j4vJWwuxs4A`
   - Click **"Save Changes"**
   - Go back and click **"Manual Deploy"** → **"Deploy latest commit"**

3. **If creating new service**:
   - Click **"New +"** → **"Web Service"**
   - Connect to repo: `sales-route-location-`
   - **Important**: Select branch: `claude/check-011CUvLScv3d6j4vJWwuxs4A`
   - Name: `sales-route-manager` (or any name)
   - Build Command: `npm install && cd client && npm install && npm run build && cd ..`
   - Start Command: `npm start`
   - Click **"Create Web Service"**

4. **Add Environment Variables**:

   Go to **"Environment"** tab and add:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `GOOGLE_MAPS_API_KEY` | (your Maps API key) |
   | `SUPABASE_URL` | `https://gxqkaholmxyjdifxejle.supabase.co` |
   | `SUPABASE_ANON_KEY` | (your Supabase anon key) |

   Click **"Save Changes"** after adding each variable.

5. **Deploy**:
   - Service will automatically start deploying
   - Wait 3-5 minutes for build to complete
   - Look for: "Your service is live 🎉"

### Option B: Using Blueprint (Auto-Config)

1. **Go to**: https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect to repo: `sales-route-location-`
4. **Select branch**: `claude/check-011CUvLScv3d6j4vJWwuxs4A`
5. Render will read your `render.yaml` automatically
6. Fill in environment variable **values** only:
   - `GOOGLE_MAPS_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
7. Click **"Apply"**

---

## Step 3: Verify Deployment

Once deployment completes:

### 1. Check Health Endpoint

Open in browser:
```
https://sales-route-manager.onrender.com/api/health
```

Should return:
```json
{"status":"ok","message":"Sales Route Collector API is running"}
```

### 2. Check Database Connection

```
https://sales-route-manager.onrender.com/api/sheets/data
```

Should return:
```json
{"data":[],"count":0,"countByRoute":{"route1":0,"route2":0,"route3":0,"route4":0}}
```

### 3. Open the App

```
https://sales-route-manager.onrender.com/
```

You should see:
- ✅ Google Maps loaded
- ✅ Data collection form
- ✅ Route buttons (1-4)
- ✅ Operating Hours buttons

---

## 🎯 Test the App

1. **Allow location access** when prompted
2. **Click "Open Camera"** or **"Upload Image"**
3. **Take/upload a photo** of a shop nameplate
4. **Wait for OCR** to extract shop name
5. **Select a route** (Route 1, 2, 3, or 4)
6. **Select store type** (With/Without Supervisor, or Discount Store)
7. **Select operating hours** (Daytime or 24 Hours)
8. **Click "Save Shop Data"**
9. **Check Dashboard** to see your saved shop

---

## 🐛 Troubleshooting

### Build Fails with "package.json not found"

**Problem**: Render is using wrong branch (likely `main`)

**Solution**: Change branch to `claude/check-011CUvLScv3d6j4vJWwuxs4A` in Render Settings

### 502 Bad Gateway

**Problem**: Missing environment variables or Supabase table not created

**Solution**:
1. Check environment variables are set in Render
2. Verify `shops` table exists in Supabase Table Editor
3. Check Render logs for specific error

### "Supabase credentials not configured"

**Problem**: Environment variables not set

**Solution**: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Render Environment settings

### Map doesn't load

**Problem**: Invalid or missing Google Maps API key

**Solution**:
1. Verify API key is correct
2. Enable these APIs in Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API

---

## ✅ Success Checklist

- [ ] Supabase `shops` table created
- [ ] Render service created and deployed
- [ ] All environment variables added
- [ ] Build succeeded (check Render logs)
- [ ] Health endpoint returns OK
- [ ] Database endpoint returns data
- [ ] App loads in browser
- [ ] Can add a test shop successfully

---

## 📱 Share Your App

Once deployed, share this URL with your team:
```
https://sales-route-manager.onrender.com
```

Works on:
- ✅ Desktop browsers
- ✅ Mobile phones (camera works!)
- ✅ Tablets

---

## 🔐 Important Notes

- **Free tier**: Service sleeps after 15 min of inactivity (first request takes ~30s to wake)
- **HTTPS**: Automatically provided by Render (required for camera access)
- **Database**: Free 500MB from Supabase (enough for 100,000+ shops)

---

Need help? Check the logs in Render Dashboard or review the error messages!

**Deployment Time**: ~5 minutes
**Cost**: FREE forever (on free tiers)

🎉 Happy deploying!
