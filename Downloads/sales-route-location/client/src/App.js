import React, { useState, useEffect } from 'react';
import './App.css';
import DataForm from './components/DataForm';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function App() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('form'); // 'form', 'map', 'dashboard'
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch shops data
  useEffect(() => {
    fetchShops();
  }, [refreshTrigger]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sheets/data');
      
      if (response.data && response.data.data) {
        const formattedShops = response.data.data.map(shop => ({
          id: shop.id,
          shopName: shop['Shop Name'] || shop.shopName || '',
          placeName: shop['Place Name'] || shop.placeName || '',
          latitude: parseFloat(shop['Latitude'] || shop.latitude || 0),
          longitude: parseFloat(shop['Longitude'] || shop.longitude || 0),
          googleMapsLink: shop['Google Maps Link'] || shop.googleMapsLink || '',
          route: shop['Route'] || shop.route || '',
          storeType: shop['Store Type'] || shop.storeType || '',
          timestamp: shop['Timestamp'] || shop.timestamp || '',
          phoneNumber: shop['Phone Number'] || shop.phoneNumber || '',
          notes: shop['Notes'] || shop.notes || ''
        }));
        
        setShops(formattedShops);
        toast.success(`Loaded ${formattedShops.length} shops`);
      } else {
        setShops([]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops data');
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShopAdded = (newShop) => {
    toast.success('Shop added successfully!');
    setRefreshTrigger(prev => prev + 1);
    
    // Optionally switch to map view to see the new marker
    setTimeout(() => {
      setCurrentView('map');
    }, 1000);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/sheets/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-routes-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleRouteFilter = (route) => {
    setSelectedRoute(route === selectedRoute ? null : route);
  };

  const filteredShops = selectedRoute
    ? shops.filter(shop => shop.route === selectedRoute)
    : shops;

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>📍 Al-Hasa Sales Route Manager</h1>
          <nav className="nav-menu">
            <button 
              className={`nav-btn ${currentView === 'form' ? 'active' : ''}`}
              onClick={() => setCurrentView('form')}
            >
              📝 Add Shop
            </button>
            <button 
              className={`nav-btn ${currentView === 'map' ? 'active' : ''}`}
              onClick={() => setCurrentView('map')}
            >
              🗺️ View Map
            </button>
            <button 
              className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className="nav-btn export-btn"
              onClick={handleExport}
            >
              💾 Export CSV
            </button>
          </nav>
        </div>
      </header>

      <main className="App-main">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading shops data...</p>
          </div>
        ) : (
          <>
            {currentView === 'form' && (
              <DataForm onShopAdded={handleShopAdded} />
            )}
            
            {currentView === 'map' && (
              <div className="map-container">
                <div className="map-controls">
                  <h2>Shop Locations Map</h2>
                  <div className="route-filters">
                    <button 
                      className={`filter-btn ${!selectedRoute ? 'active' : ''}`}
                      onClick={() => handleRouteFilter(null)}
                    >
                      All Routes ({shops.length})
                    </button>
                    {['Route 1', 'Route 2', 'Route 3', 'Route 4'].map(route => {
                      const count = shops.filter(s => s.route === route).length;
                      return (
                        <button
                          key={route}
                          className={`filter-btn route-${route.split(' ')[1]} ${selectedRoute === route ? 'active' : ''}`}
                          onClick={() => handleRouteFilter(route)}
                        >
                          {route} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
                <MapView shops={filteredShops} />
              </div>
            )}
            
            {currentView === 'dashboard' && (
              <Dashboard 
                shops={shops} 
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              />
            )}
          </>
        )}
      </main>

      <footer className="App-footer">
        <p>© 2024 Al-Hasa Sales Routes | Built with ❤️ for sales teams</p>
      </footer>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
