import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './MapView.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Center on Al-Hasa, Saudi Arabia
const defaultCenter = {
  lat: 25.3797,
  lng: 49.5857,
};

// Route colors
const routeColors = {
  'Route 1': '#ef4444', // Red
  'Route 2': '#3b82f6', // Blue
  'Route 3': '#10b981', // Green
  'Route 4': '#f59e0b', // Orange
};

function MapView({ shops, apiKey, loading }) {
  const [selectedShop, setSelectedShop] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const onMapLoad = useCallback((map) => {
    setMapRef(map);
  }, []);

  // Fit bounds to show all markers
  React.useEffect(() => {
    if (mapRef && shops.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      shops.forEach((shop) => {
        if (shop.lat && shop.lng) {
          bounds.extend({ lat: shop.lat, lng: shop.lng });
        }
      });
      mapRef.fitBounds(bounds);
    }
  }, [mapRef, shops]);

  const getMarkerIcon = (route) => {
    const color = routeColors[route] || '#6b7280';
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8,
    };
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {shops.map((shop) => {
            if (!shop.lat || !shop.lng) return null;

            return (
              <Marker
                key={shop.id}
                position={{ lat: shop.lat, lng: shop.lng }}
                icon={getMarkerIcon(shop.route)}
                onClick={() => setSelectedShop(shop)}
              />
            );
          })}

          {selectedShop && (
            <InfoWindow
              position={{ lat: selectedShop.lat, lng: selectedShop.lng }}
              onCloseClick={() => setSelectedShop(null)}
            >
              <div className="info-window">
                <h3>{selectedShop.name}</h3>
                <div className="info-details">
                  <p><strong>Location:</strong> {selectedShop.placeName || 'N/A'}</p>
                  <p><strong>Route:</strong> <span className={`route-badge ${selectedShop.route.toLowerCase().replace(' ', '-')}`}>{selectedShop.route}</span></p>
                  <p><strong>Type:</strong> {selectedShop.storeType || 'N/A'}</p>
                  {selectedShop.googleMapsLink && (
                    <a
                      href={selectedShop.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="maps-link"
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Legend */}
      <div className="map-legend">
        <h4>Routes</h4>
        {Object.entries(routeColors).map(([route, color]) => (
          <div key={route} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }}></div>
            <span>{route}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapView;
