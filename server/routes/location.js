const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get place name from coordinates using Google Geocoding API
router.post('/geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await axios.get(url);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const placeName = result.formatted_address;

      res.json({
        success: true,
        placeName,
        fullResult: result,
      });
    } else {
      res.json({
        success: false,
        placeName: 'Unknown Location',
        message: 'Could not geocode coordinates',
      });
    }
  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
