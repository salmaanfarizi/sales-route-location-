const express = require('express');
const router = express.Router();
const axios = require('axios');

// Validate coordinates middleware
const validateCoordinates = (req, res, next) => {
  const { lat, lng } = req.body;
  
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ 
      error: 'Missing coordinates',
      required: ['lat', 'lng']
    });
  }
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ 
      error: 'Invalid coordinates format' 
    });
  }
  
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({ 
      error: 'Latitude must be between -90 and 90' 
    });
  }
  
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({ 
      error: 'Longitude must be between -180 and 180' 
    });
  }
  
  req.coords = { latitude, longitude };
  next();
};

// Get place name from coordinates (Reverse Geocoding)
router.post('/geocode', validateCoordinates, async (req, res) => {
  try {
    const { latitude, longitude } = req.coords;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google Maps API key not configured' 
      });
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const params = {
      latlng: `${latitude},${longitude}`,
      key: apiKey,
      language: 'en', // Can be changed to 'ar' for Arabic
      result_type: 'street_address|establishment|point_of_interest|premise'
    };
    
    const response = await axios.get(url, { params });
    
    if (response.data.status === 'ZERO_RESULTS') {
      return res.json({
        success: true,
        placeName: 'Unknown Location',
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: { latitude, longitude },
        googleMapsLink: `https://maps.google.com/?q=${latitude},${longitude}`
      });
    }
    
    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }
    
    const results = response.data.results;
    const primaryResult = results[0];
    
    // Extract place information
    const placeInfo = {
      placeName: extractPlaceName(primaryResult),
      formattedAddress: primaryResult.formatted_address,
      coordinates: {
        latitude,
        longitude
      },
      googleMapsLink: `https://maps.google.com/?q=${latitude},${longitude}`,
      placeId: primaryResult.place_id,
      types: primaryResult.types,
      components: extractAddressComponents(primaryResult.address_components)
    };
    
    // Add additional details if available
    if (results.length > 1) {
      placeInfo.nearbyPlaces = results.slice(1, 4).map(place => ({
        name: extractPlaceName(place),
        address: place.formatted_address,
        types: place.types
      }));
    }
    
    res.json({
      success: true,
      ...placeInfo
    });
    
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Handle specific API errors
    if (error.response && error.response.data) {
      return res.status(500).json({
        error: 'Geocoding service error',
        details: error.response.data.error_message || error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to get location details',
      details: error.message
    });
  }
});

// Get coordinates from address (Forward Geocoding)
router.post('/geocode-address', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || address.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Address is required' 
      });
    }
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google Maps API key not configured' 
      });
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const params = {
      address: address,
      key: apiKey,
      region: 'SA', // Saudi Arabia region bias
      language: 'en'
    };
    
    const response = await axios.get(url, { params });
    
    if (response.data.status === 'ZERO_RESULTS') {
      return res.status(404).json({
        error: 'No location found for this address'
      });
    }
    
    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }
    
    const result = response.data.results[0];
    const location = result.geometry.location;
    
    res.json({
      success: true,
      address: result.formatted_address,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng
      },
      googleMapsLink: `https://maps.google.com/?q=${location.lat},${location.lng}`,
      placeId: result.place_id,
      types: result.types,
      components: extractAddressComponents(result.address_components)
    });
    
  } catch (error) {
    console.error('Address geocoding error:', error);
    res.status(500).json({
      error: 'Failed to geocode address',
      details: error.message
    });
  }
});

// Search nearby places
router.post('/nearby', validateCoordinates, async (req, res) => {
  try {
    const { latitude, longitude } = req.coords;
    const { radius = 500, type = 'grocery_or_supermarket' } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google Maps API key not configured' 
      });
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    const params = {
      location: `${latitude},${longitude}`,
      radius: Math.min(radius, 5000), // Max 5000 meters
      type: type,
      key: apiKey,
      language: 'en'
    };
    
    const response = await axios.get(url, { params });
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${response.data.status}`);
    }
    
    const places = (response.data.results || []).map(place => ({
      name: place.name,
      address: place.vicinity,
      placeId: place.place_id,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      googleMapsLink: `https://maps.google.com/?q=${place.geometry.location.lat},${place.geometry.location.lng}`,
      types: place.types,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      openNow: place.opening_hours?.open_now
    }));
    
    res.json({
      success: true,
      places: places,
      total: places.length,
      searchRadius: radius,
      searchType: type
    });
    
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({
      error: 'Failed to search nearby places',
      details: error.message
    });
  }
});

// Get place details by Place ID
router.get('/place/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google Maps API key not configured' 
      });
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = {
      place_id: placeId,
      key: apiKey,
      fields: 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,user_ratings_total,types,geometry,photos',
      language: 'en'
    };
    
    const response = await axios.get(url, { params });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Place Details API error: ${response.data.status}`);
    }
    
    const place = response.data.result;
    
    res.json({
      success: true,
      place: {
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        },
        googleMapsLink: `https://maps.google.com/?q=${place.geometry.location.lat},${place.geometry.location.lng}`,
        openingHours: place.opening_hours,
        types: place.types,
        photos: place.photos?.slice(0, 5).map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        }))
      }
    });
    
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({
      error: 'Failed to get place details',
      details: error.message
    });
  }
});

// Helper function to extract place name
function extractPlaceName(result) {
  // Try to get establishment or point of interest name
  for (const component of result.address_components) {
    if (component.types.includes('establishment') || 
        component.types.includes('point_of_interest') ||
        component.types.includes('premise')) {
      return component.long_name;
    }
  }
  
  // Fallback to street address
  for (const component of result.address_components) {
    if (component.types.includes('route') || 
        component.types.includes('street_address')) {
      return component.long_name;
    }
  }
  
  // Fallback to neighborhood or locality
  for (const component of result.address_components) {
    if (component.types.includes('neighborhood') || 
        component.types.includes('locality')) {
      return component.long_name;
    }
  }
  
  // Last resort: use first part of formatted address
  return result.formatted_address.split(',')[0];
}

// Helper function to extract address components
function extractAddressComponents(components) {
  const extracted = {};
  
  const componentMap = {
    street_number: 'streetNumber',
    route: 'street',
    neighborhood: 'neighborhood',
    locality: 'city',
    administrative_area_level_1: 'state',
    country: 'country',
    postal_code: 'postalCode'
  };
  
  for (const component of components) {
    for (const type of component.types) {
      if (componentMap[type]) {
        extracted[componentMap[type]] = component.long_name;
      }
    }
  }
  
  return extracted;
}

module.exports = router;
