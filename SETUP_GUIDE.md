# Quick Setup Guide

## Step-by-Step Setup (15 minutes)

### ✅ Step 1: Install Dependencies (2 min)

```bash
npm install
cd client && npm install && cd ..
```

### ✅ Step 2: Get Google Maps API Key (3 min)

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable APIs:
   - Google Maps JavaScript API
   - Geocoding API
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

### ✅ Step 3: Create Google Service Account (5 min)

1. In Google Cloud Console → IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `sales-route-collector`
4. Role: Editor
5. Click Keys → Add Key → Create New Key → JSON
6. Download and save as `server/config/credentials.json`
7. Copy the `client_email` from the JSON file

### ✅ Step 4: Create Google Sheet (2 min)

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it: "Al-Hasa Sales Routes"
4. Share it with the service account email (from Step 3)
5. Give "Editor" permission
6. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit
   ```

### ✅ Step 5: Configure Environment Variables (2 min)

Create `.env` in root directory:

```env
PORT=5000
NODE_ENV=development
GOOGLE_MAPS_API_KEY=paste_your_maps_api_key_here
GOOGLE_SHEET_ID=paste_your_spreadsheet_id_here
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=paste_your_maps_api_key_here
```

### ✅ Step 6: Run the App (1 min)

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

Open http://localhost:3000

## ✨ You're Ready!

The app should now be running with:
- ✅ Map showing Al-Hasa region
- ✅ Camera capture button working
- ✅ GPS location auto-capture
- ✅ Google Sheets integration

## 🆘 Having Issues?

### Map shows "For development purposes only"
- This is normal in development mode
- Add billing to Google Cloud account to remove watermark

### Camera not working
- Use HTTPS or localhost
- Grant browser camera permissions
- Or use "Upload Image" button instead

### "Google Sheets not configured" error
- Check `credentials.json` is in `server/config/`
- Verify sheet is shared with service account email
- Restart the backend server

### OCR not extracting text
- Ensure image is clear and well-lit
- Text should be readable
- Try uploading instead of camera if quality is poor

## 📱 Testing on Mobile

1. Find your computer's local IP:
   ```bash
   # On Mac/Linux
   ifconfig | grep inet

   # On Windows
   ipconfig
   ```

2. Update `client/package.json`:
   ```json
   "proxy": "http://YOUR_IP:5000"
   ```

3. Start both servers

4. On mobile, visit: `http://YOUR_IP:3000`

5. Make sure mobile and computer are on same WiFi network

## 🚀 Next Steps

1. Test by adding a few shops
2. Check Google Sheet for data
3. View shops on map
4. Try exporting data
5. Test on mobile device

## 📞 Need Help?

Check the main README.md for:
- Detailed troubleshooting
- API documentation
- Customization options
- Security notes
