import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './MapView.css';

const MapView = ({ shops = [] }) => {
  const [map, setMap] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '600px'
  };

  // Default center (Al-Hasa, Saudi Arabia)
  const defaultCenter = {
    lat: 25.3792,
    lng: 49.5818
  };

  // Route colors
  const routeColors = {
    'Route 1': '#FF0000', // Red
    'Route 2': '#0000FF', // Blue
    'Route 3': '#00FF00', // Green
    'Route 4': '#FFA500'  // Orange
  };

  // Map options
  const mapOptions = {
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  };

  // On map load
  const onLoad = useCallback((map) => {
    setMap(map);
    setMapLoaded(true);
    
    // Fit bounds to show all markers
    if (shops.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      shops.forEach(shop => {
        if (shop.latitude && shop.longitude) {
          bounds.extend({
            lat: parseFloat(shop.latitude),
            lng: parseFloat(shop.longitude)
          });
        }
      });
      map.fitBounds(bounds);
      
      // Adjust zoom if only one shop
      if (shops.length === 1) {
        map.setZoom(16);
      }
    }
  }, [shops]);

  // Fit bounds when shops change
  useEffect(() => {
    if (map && shops.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      shops.forEach(shop => {
        if (shop.latitude && shop.longitude) {
          bounds.extend({
            lat: parseFloat(shop.latitude),
            lng: parseFloat(shop.longitude)
          });
        }
      });
      map.fitBounds(bounds);
      
      if (shops.length === 1) {
        map.setZoom(16);
      }
    }
  }, [map, shops]);

  // Create custom marker icon
  const getMarkerIcon = (route) => {
    const color = routeColors[route] || '#808080';
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 10
    };
  };

  // Format store type for display
  const formatStoreType = (type) => {
    const typeIcons = {
      'With Supervisor': '👔',
      'Without Supervisor': '🏪',
      'Discount Store': '💰'
    };
    return `${typeIcons[type] || '🏪'} ${type}`;
  };

  // Get Google Maps API key from environment
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="map-error">
        <p>⚠️ Google Maps API key not configured</p>
        <p>Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file</p>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <LoadScript
        googleMapsApiKey={apiKey}
        loadingElement={<div>Loading Google Maps...</div>}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={onLoad}
          options={mapOptions}
        >
          {/* Render markers */}
          {shops.map((shop) => {
            if (!shop.latitude || !shop.longitude) return null;
            
            const position = {
              lat: parseFloat(shop.latitude),
              lng: parseFloat(shop.longitude)
            };

            return (
              <Marker
                key={shop.id}
                position={position}
                icon={getMarkerIcon(shop.route)}
                title={shop.shopName}
                onClick={() => setSelectedShop(shop)}
                animation={window.google.maps.Animation.DROP}
              />
            );
          })}

          {/* Info window for selected shop */}
          {selectedShop && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedShop.latitude),
                lng: parseFloat(selectedShop.longitude)
              }}
              onCloseClick={() => setSelectedShop(null)}
            >
              <div className="info-window">
                <h3>{selectedShop.shopName}</h3>
                <p className="info-route">
                  <span 
                    className="route-badge"
                    style={{ backgroundColor: routeColors[selectedShop.route] }}
                  >
                    {selectedShop.route}
                  </span>
                </p>
                <p className="info-type">{formatStoreType(selectedShop.storeType)}</p>
                {selectedShop.placeName && (
                  <p className="info-place">📍 {selectedShop.placeName}</p>
                )}
                {selectedShop.phoneNumber && (
                  <p className="info-phone">📞 {selectedShop.phoneNumber}</p>
                )}
                {selectedShop.notes && (
                  <p className="info-notes">📝 {selectedShop.notes}</p>
                )}
                <p className="info-coords">
                  🌍 {parseFloat(selectedShop.latitude).toFixed(6)}, 
                  {parseFloat(selectedShop.longitude).toFixed(6)}
                </p>
                {selectedShop.googleMapsLink && (
                  <a 
                    href={selectedShop.googleMapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="maps-link"
                  >
                    🗺️ Open in Google Maps
                  </a>
                )}
                {selectedShop.timestamp && (
                  <p className="info-timestamp">
                    ⏰ Added: {new Date(selectedShop.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Route Colors</h4>
        <div className="legend-items">
          {Object.entries(routeColors).map(([route, color]) => (
            <div key={route} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: color }}
              ></span>
              <span className="legend-label">{route}</span>
              <span className="legend-count">
                ({shops.filter(s => s.route === route).length})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Statistics */}
      <div className="map-stats">
        <div className="stat-item">
          <span className="stat-label">Total Shops:</span>
          <span className="stat-value">{shops.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">With Supervisor:</span>
          <span className="stat-value">
            {shops.filter(s => s.storeType === 'With Supervisor').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Without Supervisor:</span>
          <span className="stat-value">
            {shops.filter(s => s.storeType === 'Without Supervisor').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Discount Stores:</span>
          <span className="stat-value">
            {shops.filter(s => s.storeType === 'Discount Store').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
