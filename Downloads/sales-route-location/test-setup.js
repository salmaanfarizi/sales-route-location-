// Test configuration to verify all components are working
const testConfig = {
  server: {
    port: process.env.PORT || 5000,
    apis: {
      sheets: '/api/sheets',
      ocr: '/api/ocr',
      location: '/api/location'
    }
  },
  client: {
    port: 3000,
    features: [
      'Camera Capture',
      'OCR Processing',
      'Google Maps',
      'Dashboard',
      'CSV Export'
    ]
  },
  requirements: {
    node: '>=14.0.0',
    npm: '>=6.0.0',
    apis: [
      'Google Maps JavaScript API',
      'Google Geocoding API',
      'Google Sheets API'
    ],
    credentials: [
      'GOOGLE_MAPS_API_KEY',
      'GOOGLE_SHEET_ID',
      'Service Account JSON'
    ]
  }
};

// Test function to verify setup
function verifySetup() {
  console.log('🔍 Verifying Sales Route Manager Setup...\n');
  
  // Check Node version
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
  
  // Check environment variables
  const envVars = [
    'GOOGLE_MAPS_API_KEY',
    'GOOGLE_SHEET_ID',
    'PORT',
    'CLIENT_URL'
  ];
  
  console.log('\n📋 Environment Variables:');
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  });
  
  // Check file structure
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n📁 File Structure:');
  const requiredFiles = [
    'server/index.js',
    'server/routes/sheets.js',
    'server/routes/ocr.js',
    'server/routes/location.js',
    'client/src/App.js',
    'client/src/components/DataForm.js',
    'client/src/components/MapView.js',
    'client/src/components/Dashboard.js'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing`);
    }
  });
  
  console.log('\n✨ Setup verification complete!');
  console.log('\nTo start the application:');
  console.log('  npm run dev-all');
}

// Export for use in other files
module.exports = { testConfig, verifySetup };

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  verifySetup();
}
