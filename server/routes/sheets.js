const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Initialize Google Sheets API
let sheets;
let auth;

async function initializeGoogleSheets() {
  try {
    let credentials;

    // Check if credentials are provided via environment variable (for Render/production)
    if (process.env.GOOGLE_CREDENTIALS_BASE64) {
      console.log('Loading credentials from environment variable...');
      const credentialsJson = Buffer.from(
        process.env.GOOGLE_CREDENTIALS_BASE64,
        'base64'
      ).toString('utf-8');
      credentials = JSON.parse(credentialsJson);
    } else {
      // Fall back to reading from file (for local development)
      console.log('Loading credentials from file...');
      credentials = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../config/credentials.json'))
      );
    }

    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error.message);
    return false;
  }
}

// Initialize on module load
initializeGoogleSheets();

// Get all shops data
router.get('/data', async (req, res) => {
  try {
    if (!sheets) {
      const initialized = await initializeGoogleSheets();
      if (!initialized) {
        return res.status(500).json({ error: 'Google Sheets not configured' });
      }
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A:K';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({ data: [], count: 0 });
    }

    // Convert rows to objects
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    res.json({
      data,
      count: data.length,
      countByRoute: {
        route1: data.filter(d => d.Route === 'Route 1').length,
        route2: data.filter(d => d.Route === 'Route 2').length,
        route3: data.filter(d => d.Route === 'Route 3').length,
        route4: data.filter(d => d.Route === 'Route 4').length,
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new shop
router.post('/add', async (req, res) => {
  try {
    if (!sheets) {
      const initialized = await initializeGoogleSheets();
      if (!initialized) {
        return res.status(500).json({ error: 'Google Sheets not configured' });
      }
    }

    const {
      shopName,
      placeName,
      latitude,
      longitude,
      googleMapsLink,
      route,
      storeType,
      photoUrl,
    } = req.body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const timestamp = new Date().toISOString();

    // Check if sheet has headers, if not add them
    const checkRange = 'Sheet1!A1:K1';
    const checkResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: checkRange,
    });

    if (!checkResponse.data.values || checkResponse.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:K1',
        valueInputOption: 'RAW',
        resource: {
          values: [[
            'Timestamp',
            'Shop Name',
            'Place Name',
            'Latitude',
            'Longitude',
            'Google Maps Link',
            'Route',
            'Store Type',
            'Photo URL',
            'Added By',
            'ID'
          ]],
        },
      });
    }

    // Add the new row
    const values = [[
      timestamp,
      shopName,
      placeName,
      latitude,
      longitude,
      googleMapsLink,
      route,
      storeType,
      photoUrl || '',
      'Field Agent',
      `SHOP_${Date.now()}`
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      resource: { values },
    });

    res.json({ success: true, message: 'Shop added successfully' });
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export data as CSV
router.get('/export', async (req, res) => {
  try {
    if (!sheets) {
      const initialized = await initializeGoogleSheets();
      if (!initialized) {
        return res.status(500).json({ error: 'Google Sheets not configured' });
      }
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1!A:K';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    // Convert to CSV
    const csv = rows.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=shops_data.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
