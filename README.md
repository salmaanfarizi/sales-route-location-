# Sales Route Collector - Al-Hasa

A professional web application for collecting customer data (groceries and supermarkets) across Al-Hasa, Saudi Arabia. The app features real-time map visualization, camera-based data collection with OCR, and Google Sheets backend storage.

## Features

### 🗺️ Interactive Map (40% Screen)
- Real-time Google Maps integration
- Color-coded markers for 4 sales routes
- Click markers to view shop details
- Auto-fit bounds to show all collected data
- Route legend for easy identification

### 📸 Smart Data Collection
- **Camera Capture**: Take photos of shop nameplates
- **OCR Technology**: Automatic text extraction from photos (supports English and Arabic)
- **Auto-populate**: Shop name extracted from photo
- **GPS Location**: Auto-capture current coordinates
- **Place Name**: Auto-fetch from Google Geocoding API
- **Google Maps Link**: Auto-generate shareable link

### 🛣️ Route Management
- 4 color-coded route buttons:
  - **Route 1** - Red
  - **Route 2** - Blue
  - **Route 3** - Green
  - **Route 4** - Orange

### 🏪 Store Classification
- With Supervisor
- Without Supervisor
- Discount Store

### 📊 Dashboard & Analytics
- Real-time statistics
- Shop count by route
- Search and filter functionality
- Export data to CSV
- Detailed shop listing with all information

### ☁️ Google Sheets Backend
- Automatic data sync to Google Sheets
- Real-time updates
- Easy data management and sharing
- Export functionality

## Tech Stack

### Frontend
- React 18
- Google Maps JavaScript API
- Tesseract.js (OCR)
- Axios
- CSS3 with modern gradients

### Backend
- Node.js
- Express
- Google Sheets API v4
- Google Geocoding API
- Multer (file uploads)

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v14 or higher) and npm installed
2. **Google Cloud Account** with billing enabled
3. **Google Maps API Key**
4. **Google Service Account** for Sheets API

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sales-route-location-
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Google Cloud Setup

#### A. Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com/) and enable:

1. Google Maps JavaScript API
2. Google Geocoding API
3. Google Sheets API

#### B. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "API Key"
4. Copy the API key
5. (Recommended) Restrict the key to your domain

#### C. Create Service Account for Sheets

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name it (e.g., "sales-route-sheets")
4. Grant it "Editor" role
5. Click "Done"
6. Click on the service account
7. Go to "Keys" tab
8. Click "Add Key" > "Create new key"
9. Choose "JSON" format
10. Save the downloaded file as `credentials.json`
11. Move `credentials.json` to `server/config/credentials.json`

#### D. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "Al-Hasa Sales Routes")
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
5. Share the sheet with the service account email (found in `credentials.json` as `client_email`)
6. Give it "Editor" permissions

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=5000
NODE_ENV=development

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_actual_spreadsheet_id

# Client URL
CLIENT_URL=http://localhost:3000
```

Create `.env` file in the `client` directory:

```bash
cd client
echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key" > .env
cd ..
```

### 5. Run the Application

#### Development Mode

```bash
# Terminal 1 - Run backend server
npm run dev

# Terminal 2 - Run frontend (in a new terminal)
npm run client
```

Or run both concurrently:

```bash
npm run dev-all
```

#### Production Mode

```bash
# Build frontend
cd client
npm run build
cd ..

# Start server
NODE_ENV=production npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### Collecting Shop Data

1. **Open the App**: Navigate to http://localhost:3000

2. **Camera Capture**:
   - Click "📷 Open Camera" to use your device camera
   - Or click "📁 Upload Image" to select a photo from your device
   - Point camera at shop nameplate
   - Click "Capture Photo"
   - Wait for OCR processing (shop name will auto-populate)

3. **Review Auto-populated Data**:
   - Shop Name (extracted from photo)
   - Place Name (from GPS)
   - Latitude/Longitude (from GPS)
   - Google Maps Link (auto-generated)

4. **Select Route**:
   - Click one of the 4 colored route buttons

5. **Select Store Type**:
   - Choose: With Supervisor, Without Supervisor, or Discount Store

6. **Save**:
   - Click "Save Shop Data"
   - Data is instantly saved to Google Sheets
   - Map updates with new marker

### Viewing Dashboard

1. Click "Show Dashboard" in the header
2. View statistics by route
3. Search shops by name or location
4. Filter by route or store type
5. Click "View Map" to open shop location in Google Maps

### Exporting Data

1. Click "Export Data" in the header
2. CSV file downloads with all shop data
3. Open in Excel, Google Sheets, or any spreadsheet software

## Project Structure

```
sales-route-location-/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.js         # Google Maps with markers
│   │   │   ├── MapView.css
│   │   │   ├── DataForm.js        # Data collection form
│   │   │   ├── DataForm.css
│   │   │   ├── Dashboard.js       # Stats and shop listing
│   │   │   └── Dashboard.css
│   │   ├── App.js             # Main app component
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── server/                    # Node.js backend
│   ├── config/
│   │   └── credentials.json   # Google service account (don't commit!)
│   ├── routes/
│   │   ├── sheets.js          # Google Sheets operations
│   │   ├── ocr.js             # Image upload and OCR
│   │   └── location.js        # Geocoding
│   └── index.js               # Express server
├── uploads/                   # Uploaded images (auto-created)
├── .env                       # Environment variables (don't commit!)
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Sheets API
- `GET /api/sheets/data` - Get all shops
- `POST /api/sheets/add` - Add new shop
- `GET /api/sheets/export` - Export CSV

### OCR API
- `POST /api/ocr/process` - Upload and process image

### Location API
- `POST /api/location/geocode` - Get place name from coordinates

## Customization

### Changing Route Colors

Edit `client/src/components/MapView.js`:

```javascript
const routeColors = {
  'Route 1': '#your-color',
  'Route 2': '#your-color',
  'Route 3': '#your-color',
  'Route 4': '#your-color',
};
```

### Changing Default Map Center

Edit `client/src/components/MapView.js`:

```javascript
const defaultCenter = {
  lat: your_latitude,
  lng: your_longitude,
};
```

### Adding More Store Types

Edit `client/src/components/DataForm.js` and add buttons in the Store Type section.

## Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS (required for camera access)
- Check browser permissions
- Try using "Upload Image" as alternative

### Google Sheets Not Saving
- Verify service account email has edit access to the sheet
- Check `credentials.json` is in `server/config/`
- Verify `GOOGLE_SHEET_ID` in `.env` is correct

### Map Not Loading
- Verify `GOOGLE_MAPS_API_KEY` is correct
- Check API is enabled in Google Cloud Console
- Check browser console for errors

### OCR Not Working
- Ensure image is clear and well-lit
- Text should be horizontal and readable
- Supports English and Arabic text

## Security Notes

⚠️ **Important**: Never commit these files to version control:
- `.env`
- `server/config/credentials.json`
- `uploads/*` (images may contain sensitive data)

These are already in `.gitignore`.

## Mobile Support

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones (iOS Safari, Chrome)
- Progressive Web App (PWA) ready

## Performance

- Map markers are optimized for up to 10,000+ shops
- Image uploads limited to 10MB
- OCR processing takes 2-5 seconds per image
- Real-time data sync with Google Sheets

## Future Enhancements

- [ ] Offline mode with local storage
- [ ] Bulk upload via CSV
- [ ] Advanced analytics and reports
- [ ] Multi-user authentication
- [ ] Route optimization algorithms
- [ ] WhatsApp integration for sharing
- [ ] Arabic language support in UI

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Google Cloud Console setup
3. Check browser console for errors
4. Verify all environment variables are set

## License

MIT License - See LICENSE file for details

## Credits

Built with ❤️ for Al-Hasa sales teams
