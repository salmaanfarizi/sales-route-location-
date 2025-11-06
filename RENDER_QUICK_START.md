# 🚀 Render Quick Start (5 Minutes)

The absolute fastest way to deploy your app to Render.

## Prerequisites Checklist

- [ ] Google Maps API Key
- [ ] Google Service Account credentials.json file
- [ ] Google Sheet created and shared with service account
- [ ] Git repository pushed to GitHub/GitLab

---

## Step 1: Encode Your Credentials (1 min)

**On Mac/Linux:**
```bash
cd sales-route-location-
./encode-credentials.sh
```

**On Windows:**
```bash
cd sales-route-location-
certutil -encode server/config/credentials.json credentials_base64_temp.txt
findstr /v /c:"-" credentials_base64_temp.txt > credentials_base64.txt
del credentials_base64_temp.txt
```

This creates `credentials_base64.txt` - keep it open, you'll need it!

---

## Step 2: Deploy to Render (4 mins)

### A. Sign up & Connect Repository
1. Go to https://render.com/register
2. Click **New +** → **Web Service**
3. Connect your Git repo
4. Select branch: `claude/initial-setup-011CUsBxuGpvpXbMJP5mJE61`

### B. Configure Service

Copy/paste these settings:

**Name:**
```
sales-route-collector
```

**Build Command:**
```
npm install && cd client && npm install && npm run build && cd ..
```

**Start Command:**
```
npm start
```

**Environment Variables** (click "Add Environment Variable" for each):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `GOOGLE_MAPS_API_KEY` | Your Google Maps API key |
| `GOOGLE_SHEET_ID` | Your spreadsheet ID (from URL) |
| `GOOGLE_CREDENTIALS_BASE64` | Content from credentials_base64.txt |

### C. Deploy!
1. Click **Create Web Service**
2. Wait 3-5 minutes for build
3. Done! ✅

---

## Step 3: Test Your App

Your URL: `https://sales-route-collector.onrender.com`

**Quick Test:**
- ✅ Map loads showing Al-Hasa
- ✅ Camera button works (allow permissions)
- ✅ Add a test shop
- ✅ Check your Google Sheet - data appears!

---

## 🎉 Success!

Your app is now live at:
```
https://[your-service-name].onrender.com
```

Share this URL with your team!

---

## ⚡ Quick Troubleshooting

**Map doesn't load?**
→ Check GOOGLE_MAPS_API_KEY is correct

**Can't save to sheets?**
→ Verify sheet is shared with service account email (from credentials.json)

**Service unavailable?**
→ Free tier sleeps after 15 min. Wait 30 sec, refresh.

**Build failed?**
→ Check logs in Render dashboard for specific error

---

## 📱 Mobile Access

Once deployed, access from any device:
- Desktop: Just open the URL
- Mobile: Open URL in browser, allow camera permissions
- Camera works perfectly on HTTPS (Render provides this)

---

## 🔄 Future Updates

When you make changes:
```bash
git add .
git commit -m "Your changes"
git push
```

Render auto-deploys! No extra steps needed.

---

## 💡 Pro Tips

1. **Custom Domain**: Add your own domain in Render dashboard (free)
2. **Keep Awake**: Upgrade to paid ($7/mo) to avoid sleep time
3. **Monitor**: Check Render logs for real-time debugging
4. **Backup**: Your data is safe in Google Sheets

---

## 🆘 Need Help?

- Check DEPLOY_RENDER.md for detailed guide
- View logs: Render Dashboard → Your Service → Logs
- Common issues: See troubleshooting section above

---

**Deployment time:** ~5 minutes
**Cost:** Free (with sleep after 15 min inactivity)
**Uptime:** 750 hours/month free tier

🎊 Congratulations on deploying your app!
