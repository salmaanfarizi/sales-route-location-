const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase;

function initializeSupabase() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return false;
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error.message);
    return false;
  }
}

// Initialize on module load
initializeSupabase();

// Get all shops data
router.get('/data', async (req, res) => {
  try {
    if (!supabase) {
      const initialized = initializeSupabase();
      if (!initialized) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }
    }

    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shops:', error);
      return res.status(500).json({ error: error.message });
    }

    // Calculate route counts
    const countByRoute = {
      route1: shops.filter(s => s.route === 'Route 1').length,
      route2: shops.filter(s => s.route === 'Route 2').length,
      route3: shops.filter(s => s.route === 'Route 3').length,
      route4: shops.filter(s => s.route === 'Route 4').length,
    };

    // Format data to match expected structure
    const formattedData = shops.map(shop => ({
      id: shop.id,
      'Shop Name': shop.shop_name,
      'Place Name': shop.place_name,
      'Latitude': shop.latitude,
      'Longitude': shop.longitude,
      'Google Maps Link': shop.google_maps_link,
      'Route': shop.route,
      'Store Type': shop.store_type,
      'Operating Hours': shop.operating_hours,
      'Photo URL': shop.photo_url,
      'Timestamp': shop.created_at,
    }));

    res.json({
      data: formattedData,
      count: shops.length,
      countByRoute,
    });
  } catch (error) {
    console.error('Error in /data route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new shop
router.post('/add', async (req, res) => {
  try {
    if (!supabase) {
      const initialized = initializeSupabase();
      if (!initialized) {
        return res.status(500).json({ error: 'Supabase not configured' });
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

    // Validate required fields
    if (!shopName || !route || !storeType || !operatingHours) {
      return res.status(400).json({
        error: 'Missing required fields: shopName, route, storeType, operatingHours'
      });
    }

    const { data, error } = await supabase
      .from('shops')
      .insert([
        {
          shop_name: shopName,
          place_name: placeName || '',
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
          google_maps_link: googleMapsLink || '',
          route: route,
          store_type: storeType,
          operating_hours: operatingHours,
          photo_url: photoUrl || '',
        },
      ])
      .select();

    if (error) {
      console.error('Error adding shop:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Shop added successfully',
      shop: data[0],
    });
  } catch (error) {
    console.error('Error in /add route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export data as CSV
router.get('/export', async (req, res) => {
  try {
    if (!supabase) {
      const initialized = initializeSupabase();
      if (!initialized) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }
    }

    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shops for export:', error);
      return res.status(500).json({ error: error.message });
    }

    if (shops.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    // Create CSV
    const headers = [
      'ID',
      'Timestamp',
      'Shop Name',
      'Place Name',
      'Latitude',
      'Longitude',
      'Google Maps Link',
      'Route',
      'Store Type',
      'Operating Hours',
      'Photo URL',
    ];

    const csvRows = [headers.join(',')];

    shops.forEach(shop => {
      const row = [
        shop.id,
        shop.created_at,
        `"${(shop.shop_name || '').replace(/"/g, '""')}"`,
        `"${(shop.place_name || '').replace(/"/g, '""')}"`,
        shop.latitude || '',
        shop.longitude || '',
        shop.google_maps_link || '',
        shop.route || '',
        shop.store_type || '',
        shop.operating_hours || '',
        shop.photo_url || '',
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=shops_data_${new Date().toISOString().split('T')[0]}.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error in /export route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete shop (bonus feature)
router.delete('/:id', async (req, res) => {
  try {
    if (!supabase) {
      const initialized = initializeSupabase();
      if (!initialized) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shop:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update shop (bonus feature)
router.patch('/:id', async (req, res) => {
  try {
    if (!supabase) {
      const initialized = initializeSupabase();
      if (!initialized) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }
    }

    const { id } = req.params;
    const updates = {};

    // Map camelCase to snake_case
    if (req.body.shopName) updates.shop_name = req.body.shopName;
    if (req.body.placeName) updates.place_name = req.body.placeName;
    if (req.body.latitude) updates.latitude = parseFloat(req.body.latitude);
    if (req.body.longitude) updates.longitude = parseFloat(req.body.longitude);
    if (req.body.googleMapsLink) updates.google_maps_link = req.body.googleMapsLink;
    if (req.body.route) updates.route = req.body.route;
    if (req.body.storeType) updates.store_type = req.body.storeType;
    if (req.body.operatingHours) updates.operating_hours = req.body.operatingHours;
    if (req.body.photoUrl) updates.photo_url = req.body.photoUrl;

    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating shop:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Shop updated successfully',
      shop: data[0],
    });
  } catch (error) {
    console.error('Error in update route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
