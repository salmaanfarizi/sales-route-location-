# 🚀 Deploy to Render - Complete Guide

> **⚠️ IMPORTANT UPDATE**: This guide references the old Google Sheets backend.
>
> **The app now uses Supabase (PostgreSQL)** instead of Google Sheets!
>
> For current deployment instructions with Supabase, see **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Section: "Deployment to Render"

---

## 📋 Quick Deployment Checklist (Updated for Supabase)

Before you start, make sure you have:
- ✅ Google Maps API Key
- ✅ Supabase Project URL
- ✅ Supabase Anon Key
- ✅ Git repository with your code

### Required Environment Variables in Render:

| Key | Description | Where to get it |
|-----|-------------|-----------------|
| `NODE_ENV` | Set to `production` | - |
| `PORT` | Set to `10000` | - |
| `GOOGLE_MAPS_API_KEY` | Your Maps API key | Google Cloud Console |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API |
| `CLIENT_URL` | Your app URL (optional) | `https://your-app.onrender.com` |

---

# OLD DOCUMENTATION (Google Sheets - Deprecated)

This guide will help you deploy your Sales Route Collector app to Render.com in about 15 minutes.

## 📋 Prerequisites (OUTDATED)

Before you start, make sure you have:
- ✅ Google Maps API Key
- ✅ Google Service Account credentials (credentials.json)
- ✅ Google Spreadsheet ID
- ✅ Git repository with your code

---

## 🎯 Step-by-Step Deployment

### Step 1: Sign Up for Render (2 minutes)

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with:
   - GitHub (recommended - easier deployment)
   - GitLab
   - Or Email

---

### Step 2: Connect Your Repository (1 minute)

1. After signing in, click **"New +"** in the top right
2. Select **"Web Service"**
3. Connect your Git account if not already connected
4. Find and select your repository: `sales-route-location-`
5. Click **"Connect"**

---

### Step 3: Configure Your Web Service (5 minutes)

Fill in these settings:

#### Basic Settings:
```
Name: sales-route-collector
Region: Oregon (US West) or closest to you
Branch: claude/initial-setup-011CUsBxuGpvpXbMJP5mJE61
Runtime: Node
```

#### Build & Deploy:
```
Build Command:
npm install && cd client && npm install && npm run build && cd ..

Start Command:
npm start
```

#### Plan:
```
Instance Type: Free
```

---

### Step 4: Add Environment Variables (5 minutes)

Scroll down to **"Environment Variables"** section and add these:

#### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### 2. GOOGLE_MAPS_API_KEY
```
Key: GOOGLE_MAPS_API_KEY
Value: [Paste your Google Maps API key here]
```

#### 3. GOOGLE_SHEET_ID
```
Key: GOOGLE_SHEET_ID
Value: [Paste your Google Sheet ID here]
```

#### 4. Google Credentials (Important!)

Since Render doesn't allow file uploads, we'll encode the credentials:

**On your Mac terminal:**

```bash
# Navigate to your project
cd sales-route-location-

# Encode your credentials file to base64
base64 -i server/config/credentials.json | tr -d '\n' > credentials_base64.txt

# This creates a file with encoded credentials
# Open it and copy the content
cat credentials_base64.txt
```

**Add to Render:**
```
Key: GOOGLE_CREDENTIALS_BASE64
Value: [Paste the entire base64 string here]
```

#### 5. PORT (Optional - Render sets this automatically)
```
Key: PORT
Value: 10000
```

---

### Step 5: Update Server Code for Render (IMPORTANT!)

The server needs to read credentials from environment variable instead of file in production.

**I'll update the code for you in the next step** - but here's what needs to change in `server/routes/sheets.js`:

Instead of reading from file:
```javascript
const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/credentials.json'))
);
```

Read from environment variable:
```javascript
const credentials = process.env.GOOGLE_CREDENTIALS_BASE64
  ? JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8'))
  : JSON.parse(fs.readFileSync(path.join(__dirname, '../config/credentials.json')));
```

**Don't worry - I'll make these changes for you!**

---

### Step 6: Deploy! (2 minutes)

1. Click **"Create Web Service"** at the bottom
2. Render will start building your app
3. Watch the build logs (takes 3-5 minutes)
4. When you see "Your service is live 🎉" - you're done!

---

## 🌐 Your App is Live!

After deployment completes, you'll get a URL like:
```
https://sales-route-collector.onrender.com
```

Click on it to open your app!

---

## ✅ Testing Your Deployment

1. **Open the URL** - You should see your app
2. **Check the map** - Should show Al-Hasa region
3. **Test camera** - Take a photo (HTTPS required for camera)
4. **Add a shop** - Try adding test data
5. **Check Google Sheet** - Verify data appears

---

## 🐛 Troubleshooting

### Build Fails

**Error: Cannot find module**
```bash
# Solution: Make sure all dependencies are in package.json
# Re-deploy after fixing
```

**Error: ENOENT credentials.json**
```bash
# Solution: Make sure you added GOOGLE_CREDENTIALS_BASE64
# environment variable correctly
```

### App Loads but Features Don't Work

**Map doesn't load**
- Check GOOGLE_MAPS_API_KEY is set correctly
- Make sure API is enabled in Google Cloud Console
- Check browser console for errors

**Can't save to Google Sheets**
- Verify GOOGLE_SHEET_ID is correct
- Check GOOGLE_CREDENTIALS_BASE64 is set
- Make sure sheet is shared with service account email

**Camera doesn't work**
- Camera requires HTTPS (Render provides this automatically)
- Check browser permissions
- Try "Upload Image" instead

---

## 🔧 Updating Your App

After making changes to your code:

```bash
# 1. Commit your changes
git add .
git commit -m "Your update message"

# 2. Push to the branch
git push origin claude/initial-setup-011CUsBxuGpvpXbMJP5mJE61

# 3. Render will automatically rebuild and deploy!
```

---

## 💰 Costs

**Free Tier Includes:**
- ✅ 750 hours/month (enough for 24/7 operation)
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Automatic deploys from Git

**Note:** Free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

**To keep it awake 24/7:** Upgrade to paid plan ($7/month)

---

## 📱 Mobile Access

Once deployed, anyone can access your app from:
- Desktop browsers
- Mobile phones (camera works!)
- Tablets

Just share the URL: `https://sales-route-collector.onrender.com`

---

## 🔐 Security Notes

**In Production:**
- ✅ Render provides automatic HTTPS
- ✅ Environment variables are encrypted
- ✅ Credentials are never exposed in code
- ✅ Google Sheets access is controlled by service account

**Best Practices:**
- Don't commit `.env` files
- Don't commit `credentials.json`
- Rotate API keys periodically
- Monitor Google Sheet access

---

## 📊 Monitoring

**Render Dashboard shows:**
- Deployment status
- Build logs
- Runtime logs
- CPU/Memory usage
- Request metrics

**Check logs:**
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. See real-time logs

---

## 🎉 You're Done!

Your app is now live and accessible worldwide!

**Next Steps:**
1. ✅ Test all features
2. ✅ Share URL with your team
3. ✅ Start collecting shop data
4. ✅ Monitor Google Sheet for data

**Need help?** Check the main README.md or troubleshooting section above.

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Your App: `https://[your-service-name].onrender.com`
- Google Sheet: `https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]`

---

## 🆘 Common Issues & Solutions

### Issue: "Service Unavailable"
**Solution:** Service is sleeping (free tier). Wait 30 seconds and refresh.

### Issue: Build takes too long
**Solution:** Normal for first deploy. Subsequent deploys are faster.

### Issue: Can't access environment variables
**Solution:** Make sure they're added in Render Dashboard, not in code.

### Issue: Google Sheets not updating
**Solution:**
1. Check service account has editor access to sheet
2. Verify GOOGLE_SHEET_ID matches your sheet
3. Check logs for errors

---

Happy deploying! 🚀
