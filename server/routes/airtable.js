const express = require('express');
const router = express.Router();
const Airtable = require('airtable');

// Initialize Airtable
let base;

function initializeAirtable() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      console.error('Airtable credentials not configured');
      return false;
    }

    Airtable.configure({
      apiKey: apiKey,
    });

    base = Airtable.base(baseId);
    console.log('Airtable initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Airtable:', error.message);
    return false;
  }
}

// Initialize on module load
initializeAirtable();

// Get all shops data
router.get('/data', async (req, res) => {
  try {
    if (!base) {
      const initialized = initializeAirtable();
      if (!initialized) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }
    }

    const records = [];

    await base('Shops').select({
      view: 'Grid view' // or your view name
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach((record) => {
        records.push({
          id: record.id,
          'Shop Name': record.get('Shop Name') || '',
          'Place Name': record.get('Place Name') || '',
          'Latitude': record.get('Latitude') || 0,
          'Longitude': record.get('Longitude') || 0,
          'Google Maps Link': record.get('Google Maps Link') || '',
          'Route': record.get('Route') || '',
          'Store Type': record.get('Store Type') || '',
          'Operating Hours': record.get('Operating Hours') || '',
          'Photo URL': record.get('Photo URL') || '',
          'Timestamp': record.get('Timestamp') || record.get('Created') || '',
        });
      });
      fetchNextPage();
    });

    // Calculate route counts
    const countByRoute = {
      route1: records.filter(r => r.Route === 'Route 1').length,
      route2: records.filter(r => r.Route === 'Route 2').length,
      route3: records.filter(r => r.Route === 'Route 3').length,
      route4: records.filter(r => r.Route === 'Route 4').length,
    };

    res.json({
      data: records,
      count: records.length,
      countByRoute,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new shop
router.post('/add', async (req, res) => {
  try {
    if (!base) {
      const initialized = initializeAirtable();
      if (!initialized) {
        return res.status(500).json({ error: 'Airtable not configured' });
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
      operatingHours,
      photoUrl,
    } = req.body;

    const record = await base('Shops').create([
      {
        fields: {
          'Shop Name': shopName,
          'Place Name': placeName,
          'Latitude': parseFloat(latitude) || 0,
          'Longitude': parseFloat(longitude) || 0,
          'Google Maps Link': googleMapsLink,
          'Route': route,
          'Store Type': storeType,
          'Operating Hours': operatingHours || '',
          'Photo URL': photoUrl || '',
        },
      },
    ]);

    res.json({
      success: true,
      message: 'Shop added successfully',
      recordId: record[0].id
    });
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export data as CSV
router.get('/export', async (req, res) => {
  try {
    if (!base) {
      const initialized = initializeAirtable();
      if (!initialized) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }
    }

    const records = [];

    await base('Shops').select({
      view: 'Grid view'
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach((record) => {
        records.push({
          'Timestamp': record.get('Timestamp') || record.get('Created') || '',
          'Shop Name': record.get('Shop Name') || '',
          'Place Name': record.get('Place Name') || '',
          'Latitude': record.get('Latitude') || '',
          'Longitude': record.get('Longitude') || '',
          'Google Maps Link': record.get('Google Maps Link') || '',
          'Route': record.get('Route') || '',
          'Store Type': record.get('Store Type') || '',
          'Operating Hours': record.get('Operating Hours') || '',
          'Photo URL': record.get('Photo URL') || '',
        });
      });
      fetchNextPage();
    });

    // Convert to CSV
    if (records.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    const headers = Object.keys(records[0]);
    const csvRows = [headers.join(',')];

    records.forEach(record => {
      const values = headers.map(header => {
        const value = record[header] || '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=shops_data_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
