const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Validation middleware
const validateShopData = (req, res, next) => {
  const { shopName, latitude, longitude, route, storeType } = req.body;
  
  if (!shopName || !latitude || !longitude || !route || !storeType) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['shopName', 'latitude', 'longitude', 'route', 'storeType']
    });
  }
  
  // Validate latitude and longitude
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  
  // Validate route
  const validRoutes = ['Route 1', 'Route 2', 'Route 3', 'Route 4'];
  if (!validRoutes.includes(route)) {
    return res.status(400).json({ 
      error: 'Invalid route',
      validRoutes 
    });
  }
  
  // Validate store type
  const validStoreTypes = ['With Supervisor', 'Without Supervisor', 'Discount Store'];
  if (!validStoreTypes.includes(storeType)) {
    return res.status(400).json({ 
      error: 'Invalid store type',
      validStoreTypes 
    });
  }
  
  next();
};

// Get all shops data
router.get('/data', async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }
    
    // First, try to get the data
    let response;
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A:I'
      });
    } catch (error) {
      // If sheet doesn't exist or has no data, return empty array
      if (error.code === 400 || error.code === 404) {
        return res.json({ data: [], message: 'Sheet is empty or not initialized' });
      }
      throw error;
    }
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return res.json({ data: [], message: 'No data found' });
    }
    
    // Skip header row and format data
    const headers = rows[0];
    const data = rows.slice(1).map((row, index) => {
      const shop = {};
      headers.forEach((header, i) => {
        shop[header] = row[i] || '';
      });
      shop.id = index + 1;
      return shop;
    });
    
    res.json({ 
      data, 
      total: data.length,
      headers 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message 
    });
  }
});

// Add new shop
router.post('/add', validateShopData, async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }
    
    const {
      shopName,
      placeName,
      latitude,
      longitude,
      googleMapsLink,
      route,
      storeType,
      phoneNumber = '',
      notes = ''
    } = req.body;
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Riyadh' 
    });
    
    // Check if headers exist
    let headers;
    try {
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:I1'
      });
      headers = headerResponse.data.values?.[0];
    } catch (error) {
      headers = null;
    }
    
    // If no headers, create them
    if (!headers || headers.length === 0) {
      const headerRow = [
        'Timestamp',
        'Shop Name',
        'Place Name',
        'Latitude',
        'Longitude',
        'Google Maps Link',
        'Route',
        'Store Type',
        'Phone Number',
        'Notes'
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:J1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headerRow]
        }
      });
    }
    
    // Add the new row
    const newRow = [
      timestamp,
      shopName,
      placeName || '',
      latitude.toString(),
      longitude.toString(),
      googleMapsLink || `https://maps.google.com/?q=${latitude},${longitude}`,
      route,
      storeType,
      phoneNumber,
      notes
    ];
    
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [newRow]
      }
    });
    
    res.json({ 
      success: true,
      message: 'Shop added successfully',
      data: {
        timestamp,
        shopName,
        placeName,
        latitude,
        longitude,
        googleMapsLink,
        route,
        storeType,
        phoneNumber,
        notes
      },
      range: appendResponse.data.updates.updatedRange
    });
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ 
      error: 'Failed to add shop',
      details: error.message 
    });
  }
});

// Export data as CSV
router.get('/export', async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:J'
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }
    
    // Convert to CSV
    const csv = rows.map(row => {
      return row.map(cell => {
        // Escape cells containing commas or quotes
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell || '';
      }).join(',');
    }).join('\n');
    
    // Add BOM for Excel to recognize UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sales-routes-${Date.now()}.csv"`);
    res.send(csvWithBom);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error.message 
    });
  }
});

// Delete a shop (optional endpoint)
router.delete('/delete/:rowIndex', async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const rowIndex = parseInt(req.params.rowIndex) + 1; // Add 1 for header row
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }
    
    if (isNaN(rowIndex) || rowIndex < 2) {
      return res.status(400).json({ error: 'Invalid row index' });
    }
    
    // Delete row by clearing it (Google Sheets API doesn't have direct delete)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Sheet1!A${rowIndex}:J${rowIndex}`
    });
    
    res.json({ 
      success: true,
      message: `Row ${rowIndex} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ 
      error: 'Failed to delete shop',
      details: error.message 
    });
  }
});

// Update a shop (optional endpoint)
router.put('/update/:rowIndex', validateShopData, async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const rowIndex = parseInt(req.params.rowIndex) + 2; // Add 2 (1 for header, 1 for 0-index)
    
    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }
    
    if (isNaN(rowIndex) || rowIndex < 2) {
      return res.status(400).json({ error: 'Invalid row index' });
    }
    
    const {
      shopName,
      placeName,
      latitude,
      longitude,
      googleMapsLink,
      route,
      storeType,
      phoneNumber = '',
      notes = ''
    } = req.body;
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Riyadh' 
    });
    
    const updatedRow = [
      timestamp,
      shopName,
      placeName || '',
      latitude.toString(),
      longitude.toString(),
      googleMapsLink || `https://maps.google.com/?q=${latitude},${longitude}`,
      route,
      storeType,
      phoneNumber,
      notes
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${rowIndex}:J${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow]
      }
    });
    
    res.json({ 
      success: true,
      message: `Row ${rowIndex} updated successfully`,
      data: req.body
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ 
      error: 'Failed to update shop',
      details: error.message 
    });
  }
});

module.exports = router;
