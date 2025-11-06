import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import MapView from './components/MapView';
import DataForm from './components/DataForm';
import Dashboard from './components/Dashboard';
import axios from 'axios';

// Add your Google Maps API Key here
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

function App() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    route1: 0,
    route2: 0,
    route3: 0,
    route4: 0,
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch shops data
  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sheets/data');

      if (response.data && response.data.data) {
        const shopsData = response.data.data.map((shop, index) => ({
          id: shop.ID || `shop_${index}`,
          name: shop['Shop Name'] || shop.shopName || 'Unknown',
          placeName: shop['Place Name'] || shop.placeName || '',
          lat: parseFloat(shop.Latitude || shop.latitude) || 0,
          lng: parseFloat(shop.Longitude || shop.longitude) || 0,
          route: shop.Route || shop.route || 'Route 1',
          storeType: shop['Store Type'] || shop.storeType || '',
          googleMapsLink: shop['Google Maps Link'] || shop.googleMapsLink || '',
          photoUrl: shop['Photo URL'] || shop.photoUrl || '',
          timestamp: shop.Timestamp || shop.timestamp || '',
        }));

        setShops(shopsData);

        setStats({
          total: response.data.count || 0,
          route1: response.data.countByRoute?.route1 || 0,
          route2: response.data.countByRoute?.route2 || 0,
          route3: response.data.countByRoute?.route3 || 0,
          route4: response.data.countByRoute?.route4 || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      // Set empty data on error
      setShops([]);
      setStats({ total: 0, route1: 0, route2: 0, route3: 0, route4: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops, refreshTrigger]);

  const handleShopAdded = () => {
    // Refresh the data
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/sheets/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shops_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Sales Route Collector - Al-Hasa</h1>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowDashboard(!showDashboard)}
          >
            {showDashboard ? 'Hide' : 'Show'} Dashboard
          </button>
          <button
            className="btn-export"
            onClick={handleExport}
          >
            Export Data
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item route-1">
          <span className="stat-label">Route 1:</span>
          <span className="stat-value">{stats.route1}</span>
        </div>
        <div className="stat-item route-2">
          <span className="stat-label">Route 2:</span>
          <span className="stat-value">{stats.route2}</span>
        </div>
        <div className="stat-item route-3">
          <span className="stat-label">Route 3:</span>
          <span className="stat-value">{stats.route3}</span>
        </div>
        <div className="stat-item route-4">
          <span className="stat-label">Route 4:</span>
          <span className="stat-value">{stats.route4}</span>
        </div>
      </div>

      <div className="main-container">
        {/* Map Section - 40% */}
        <div className="map-section">
          <MapView
            shops={shops}
            apiKey={GOOGLE_MAPS_API_KEY}
            loading={loading}
          />
        </div>

        {/* Form Section - 60% */}
        <div className="form-section">
          <DataForm
            onShopAdded={handleShopAdded}
            apiKey={GOOGLE_MAPS_API_KEY}
          />
        </div>
      </div>

      {/* Dashboard Modal */}
      {showDashboard && (
        <Dashboard
          shops={shops}
          stats={stats}
          onClose={() => setShowDashboard(false)}
        />
      )}
    </div>
  );
}

export default App;
