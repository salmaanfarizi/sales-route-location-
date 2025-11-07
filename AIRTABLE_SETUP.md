# 🎯 Airtable Setup Guide - Easy & Fast!

This guide will help you set up Airtable for your Sales Route Collector app in just 5 minutes!

## ✨ Why Airtable?

- ✅ **No Google Cloud complications** - No service accounts, no org policies
- ✅ **Simple API key** - Just one token, that's it!
- ✅ **Better interface** - Beautiful database UI
- ✅ **Free tier** - 1,200 records per base (perfect for 1,500 shops)
- ✅ **Mobile app** - View/edit data on your phone
- ✅ **Easy sharing** - Share with your team easily

---

## 📋 Step 1: Create Airtable Account (1 minute)

1. Go to https://airtable.com/signup
2. Sign up with:
   - Email
   - Google account
   - Apple ID
3. Verify your email if required

---

## 📊 Step 2: Create Your Base (2 minutes)

### A. Create New Base

1. After logging in, click **"Start from scratch"** or **"+ Add a base"**
2. Choose **"Start from scratch"**
3. Name it: **"Al-Hasa Sales Routes"**
4. Click **"Create"**

### B. Set Up Your Table

1. You'll see a default table called "Table 1"
2. Click on "Table 1" at the top and rename it to: **"Shops"**

### C. Create the Fields

Click on each default column header and modify/add these fields:

| Field Name | Field Type | Settings |
|------------|------------|----------|
| **Shop Name** | Single line text | Primary field |
| **Place Name** | Single line text | - |
| **Latitude** | Number | Precision: 6 decimal places |
| **Longitude** | Number | Precision: 6 decimal places |
| **Google Maps Link** | URL | - |
| **Route** | Single select | Options: Route 1, Route 2, Route 3, Route 4 |
| **Store Type** | Single select | Options: With Supervisor, Without Supervisor, Discount Store |
| **Operating Hours** | Single select | Options: Daytime, 24 Hours |
| **Photo URL** | URL | - |
| **Timestamp** | Created time | Automatically set |

#### How to Add Single Select Options:

1. Click **"Single select"** field type
2. Click **"Customize field type"**
3. Add options one by one:
   - For **Route**: Add "Route 1", "Route 2", "Route 3", "Route 4"
   - For **Store Type**: Add "With Supervisor", "Without Supervisor", "Discount Store"
   - For **Operating Hours**: Add "Daytime", "24 Hours"
4. Optional: Color-code them!
   - Route 1 → Red
   - Route 2 → Blue
   - Route 3 → Green
   - Route 4 → Orange

---

## 🔑 Step 3: Get Your API Credentials (2 minutes)

### A. Create Personal Access Token

1. Click your **profile icon** (top right corner)
2. Select **"Developer hub"** or **"Account"**
3. In the left sidebar, click **"Personal access tokens"**
4. Click **"Create token"** or **"Create new token"**

5. **Configure the token:**
   - **Name:** `sales-route-api`
   - **Scopes:** Check these boxes:
     - ✅ `data.records:read`
     - ✅ `data.records:write`
     - ✅ `schema.bases:read`
   - **Access:** Select your base **"Al-Hasa Sales Routes"**

6. Click **"Create token"**
7. **COPY THE TOKEN IMMEDIATELY!** You won't be able to see it again
8. **Save it somewhere safe** (you'll need it in Step 4)

### B. Get Your Base ID

1. Go to https://airtable.com/api
2. Click on your base **"Al-Hasa Sales Routes"**
3. In the URL or on the page, you'll see your Base ID
4. It looks like: `appXXXXXXXXXXXXXX`
5. **Copy this Base ID**

**Alternative method to find Base ID:**
1. Open your base in Airtable
2. Click **"Help"** in the top right
3. Select **"API documentation"**
4. The Base ID is shown at the top: `appXXXXXXXXXXXXXX`

---

## ⚙️ Step 4: Configure Your App

### A. Update Root .env File

```bash
# Open your terminal in the project directory
nano .env
```

Add these lines:

```env
PORT=5000
NODE_ENV=development

# Google Maps API Key (you already have this)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Airtable Configuration
AIRTABLE_API_KEY=pat1234567890abcdefg  # Your personal access token
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX     # Your base ID

# Client URL
CLIENT_URL=http://localhost:3000
```

**Save:** Press `Ctrl + O`, then `Enter`, then `Ctrl + X`

### B. Update Client .env File

```bash
nano client/.env
```

Add:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Save:** Press `Ctrl + O`, then `Enter`, then `Ctrl + X`

---

## 🚀 Step 5: Test Your Setup

### A. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### B. Start the App

**Terminal 1 - Backend:**
```bash
npm run dev
```

You should see:
```
Server is running on port 5000
Airtable initialized successfully
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

The app should open at: http://localhost:3000

### C. Test It!

1. ✅ Map loads showing Al-Hasa
2. ✅ Click camera button (allow permissions)
3. ✅ Take a photo of any text
4. ✅ Shop name auto-populates
5. ✅ GPS location captured
6. ✅ Select Route, Store Type, and Operating Hours
7. ✅ Click "Save Shop Data"
8. ✅ Check your Airtable base - data should appear!

---

## 🎨 Customize Your Airtable (Optional)

### Color Code Your Routes

1. In Airtable, click on the **Route** field
2. Click the color dot next to each option:
   - Route 1 → Red
   - Route 2 → Blue
   - Route 3 → Green
   - Route 4 → Orange

### Create Views

1. Click **"Grid view"** dropdown
2. Create filtered views:
   - "Route 1 Only" - filter by Route 1
   - "24 Hour Shops" - filter by Operating Hours
   - "With Supervisor" - filter by Store Type

### Add Charts

1. Click **"+"** next to "Grid view"
2. Select **"Chart"**
3. Create visualizations:
   - Shops per Route
   - Store Types breakdown
   - Operating Hours distribution

---

## 🐛 Troubleshooting

### Error: "Airtable not configured"

**Solution:**
- Check `.env` file has `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`
- Restart the backend server: `npm run dev`

### Error: "Could not find table Shops"

**Solution:**
- Make sure your table is named exactly **"Shops"** (capital S)
- Check spelling and capitalization

### Error: "Invalid authentication token"

**Solution:**
- Your Personal Access Token might be wrong
- Go to Airtable Developer Hub
- Create a new token
- Update `.env` file
- Restart server

### Data not appearing in Airtable

**Solution:**
- Check the console in your browser (F12)
- Look for error messages
- Verify token has `data.records:write` permission
- Make sure base ID is correct

### Can't save - "Unknown field name"

**Solution:**
- Field names in Airtable must match exactly:
  - "Shop Name" (not "ShopName" or "shop name")
  - "Place Name"
  - "Route"
  - "Store Type"
  - "Operating Hours"
- Check capitalization and spaces

---

## 📱 Using Airtable Mobile App

1. Download Airtable app (iOS/Android)
2. Sign in with your account
3. Open "Al-Hasa Sales Routes" base
4. View all collected shop data
5. Edit records on the go!

---

## 🔐 Security Best Practices

✅ **DO:**
- Keep your Personal Access Token secret
- Never commit `.env` to Git
- Rotate tokens periodically
- Use read-only tokens for viewing

❌ **DON'T:**
- Share your token publicly
- Commit credentials to GitHub
- Use the same token across projects
- Give more permissions than needed

---

## 💡 Pro Tips

### 1. Add Linked Records
Link shops to a "Sales Agents" table to track who added which shop

### 2. Use Automations
Set up Airtable automations to:
- Send daily summary emails
- Notify when a route is complete
- Create weekly reports

### 3. Add Form View
Create an Airtable form for manual data entry as backup

### 4. Export Options
Airtable supports:
- CSV export
- Excel export
- Google Sheets sync
- API access

---

## 🎉 Success Checklist

- [ ] Airtable account created
- [ ] "Al-Hasa Sales Routes" base created
- [ ] "Shops" table with all fields configured
- [ ] Personal Access Token created and copied
- [ ] Base ID copied
- [ ] `.env` files configured
- [ ] Dependencies installed
- [ ] App running locally
- [ ] Test shop added successfully
- [ ] Data visible in Airtable

---

## 🆘 Need Help?

- **Airtable Documentation:** https://airtable.com/developers/web/api/introduction
- **API Reference:** https://airtable.com/api (select your base)
- **Support:** https://support.airtable.com

---

## ⏭️ Next Steps

Once your local testing works:

1. ✅ Deploy to Render (see RENDER_QUICK_START.md)
2. ✅ Add environment variables in Render dashboard
3. ✅ Share the app URL with your field team
4. ✅ Start collecting shop data!

---

**Setup time:** ~5 minutes
**Cost:** Free (1,200 records per base)
**Difficulty:** Easy ⭐

🎊 Enjoy your new data collection app powered by Airtable!
