# 📍 Al-Hasa Sales Route Manager

A professional web application for collecting customer data (groceries and supermarkets) across Al-Hasa, Saudi Arabia. Features real-time map visualization, camera-based data collection with OCR, and Google Sheets backend storage.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Account with billing enabled
- Google Sheets API access

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/salmaanfarizi/sales-route-location-.git
cd sales-route-location
```

2. **Install dependencies:**
```bash
# Install all dependencies (server + client)
npm run install-all

# Or separately:
npm install              # Server dependencies
cd client && npm install # Client dependencies
cd ..
```

3. **Set up Google Cloud:**

#### a. Enable APIs
Go to [Google Cloud Console](https://console.cloud.google.com/) and enable:
- Google Maps JavaScript API
- Google Geocoding API
- Google Sheets API

#### b. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Restrict the key to your domain

#### c. Create Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name it (e.g., "sales-route-sheets")
4. Grant "Editor" role
5. Click "Done"
6. Click on the service account
7. Go to "Keys" tab
8. Click "Add Key" > "Create new key"
9. Choose "JSON" format
10. Save as `credentials.json` in `server/config/`

4. **Create Google Sheet:**
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Copy the Spreadsheet ID from URL
4. Share with service account email (from credentials.json)
5. Give "Editor" permissions

5. **Configure Environment:**

Create `.env` in root directory:
```env
PORT=5000
NODE_ENV=development
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_SHEET_ID=your_spreadsheet_id
CLIENT_URL=http://localhost:3000
```

Create `.env` in `client/` directory:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

6. **Run the application:**
```bash
# Development mode (runs both server and client)
npm run dev-all

# Or run separately:
npm run dev    # Backend on port 5000
npm run client # Frontend on port 3000
```

## 📁 Project Structure

```
sales-route-location/
├── client/                # React frontend
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── MapView.js      # Google Maps integration
│   │   │   ├── DataForm.js     # Data collection form
│   │   │   └── Dashboard.js    # Statistics dashboard
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
│
├── server/               # Node.js backend
│   ├── config/
│   │   └── credentials.json    # Google service account
│   ├── routes/
│   │   ├── sheets.js     # Google Sheets operations
│   │   ├── ocr.js        # Image processing & OCR
│   │   └── location.js   # Geocoding services
│   └── index.js          # Express server
│
├── uploads/              # Uploaded images (auto-created)
├── .env                  # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🌟 Features

### 📸 Camera & OCR
- Camera capture for shop nameplates
- Image upload support
- Automatic text extraction (English & Arabic)
- Auto-populate shop name from images

### 🗺️ Maps Integration
- Real-time Google Maps visualization
- Color-coded route markers
- Click markers for shop details
- Auto-fit bounds to show all data
- Route legend and statistics

### 📊 Dashboard
- Real-time statistics by route
- Store type distribution
- Search and filter functionality
- Export data to CSV
- Detailed shop listing

### 📱 Data Collection
- GPS location auto-capture
- Place name from Google Geocoding
- 4 color-coded routes
- 3 store type categories
- Phone number and notes fields

## 🔧 API Endpoints

### Sheets API
- `GET /api/sheets/data` - Get all shops
- `POST /api/sheets/add` - Add new shop
- `GET /api/sheets/export` - Export as CSV
- `DELETE /api/sheets/delete/:id` - Delete shop
- `PUT /api/sheets/update/:id` - Update shop

### OCR API
- `POST /api/ocr/process` - Process uploaded image
- `POST /api/ocr/process-base64` - Process base64 image
- `GET /api/ocr/images` - List uploaded images

### Location API
- `POST /api/location/geocode` - Get place from coordinates
- `POST /api/location/geocode-address` - Get coordinates from address
- `POST /api/location/nearby` - Search nearby places
- `GET /api/location/place/:id` - Get place details

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
GOOGLE_MAPS_API_KEY=your_api_key
GOOGLE_SHEET_ID=your_sheet_id
CLIENT_URL=https://yourdomain.com
```

### Deployment Options
- **Heroku**: Use included `Procfile`
- **Vercel/Netlify**: Deploy frontend separately
- **AWS/GCP**: Use Docker or PM2
- **VPS**: Use nginx + PM2

## 🔒 Security

### Implemented
- CORS configuration
- Input validation
- File type validation
- File size limits (10MB)
- Environment variables for secrets

### Recommended
- Add authentication (JWT/OAuth)
- Implement rate limiting
- Use HTTPS in production
- Add request logging
- Implement user roles

## 🛠️ Troubleshooting

### Camera Not Working
- Ensure HTTPS connection (required for camera)
- Check browser permissions
- Try "Upload Image" as alternative

### Google Sheets Issues
- Verify service account has edit access
- Check credentials.json path
- Confirm GOOGLE_SHEET_ID is correct

### Maps Not Loading
- Verify API key is valid
- Check APIs are enabled in Google Cloud
- Review browser console for errors

### OCR Poor Results
- Ensure good lighting
- Keep text horizontal
- Use clear, high-contrast images

## 📝 Development

### Adding New Features
1. Create feature branch
2. Update components/routes
3. Test thoroughly
4. Update documentation
5. Submit PR

### Code Style
- Use ESLint configuration
- Follow React best practices
- Comment complex logic
- Keep components modular

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Salmaan Farizi**
- GitHub: [@salmaanfarizi](https://github.com/salmaanfarizi)

## 🙏 Acknowledgments

- Google Maps API for mapping services
- Tesseract.js for OCR capabilities
- React community for excellent libraries
- Al-Hasa sales teams for requirements

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check documentation
- Review closed issues

---

Built with ❤️ for Al-Hasa sales teams
