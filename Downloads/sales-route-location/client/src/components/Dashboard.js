import React, { useState, useMemo } from 'react';
import './Dashboard.css';
import { toast } from 'react-toastify';

const Dashboard = ({ shops = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [filterStoreType, setFilterStoreType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: shops.length,
      byRoute: {},
      byStoreType: {},
      recentlyAdded: 0,
      todayAdded: 0
    };

    const today = new Date().toDateString();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    shops.forEach(shop => {
      // Count by route
      if (shop.route) {
        stats.byRoute[shop.route] = (stats.byRoute[shop.route] || 0) + 1;
      }

      // Count by store type
      if (shop.storeType) {
        stats.byStoreType[shop.storeType] = (stats.byStoreType[shop.storeType] || 0) + 1;
      }

      // Count recent additions
      if (shop.timestamp) {
        const shopDate = new Date(shop.timestamp);
        if (shopDate.toDateString() === today) {
          stats.todayAdded++;
        }
        if (shopDate >= lastWeek) {
          stats.recentlyAdded++;
        }
      }
    });

    return stats;
  }, [shops]);

  // Filter and sort shops
  const filteredShops = useMemo(() => {
    let filtered = [...shops];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(shop =>
        shop.shopName?.toLowerCase().includes(search) ||
        shop.placeName?.toLowerCase().includes(search) ||
        shop.phoneNumber?.includes(search) ||
        shop.notes?.toLowerCase().includes(search)
      );
    }

    // Apply route filter
    if (filterRoute) {
      filtered = filtered.filter(shop => shop.route === filterRoute);
    }

    // Apply store type filter
    if (filterStoreType) {
      filtered = filtered.filter(shop => shop.storeType === filterStoreType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.shopName || '').localeCompare(b.shopName || '');
          break;
        case 'route':
          comparison = (a.route || '').localeCompare(b.route || '');
          break;
        case 'type':
          comparison = (a.storeType || '').localeCompare(b.storeType || '');
          break;
        case 'date':
        default:
          const dateA = new Date(a.timestamp || 0);
          const dateB = new Date(b.timestamp || 0);
          comparison = dateA - dateB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [shops, searchTerm, filterRoute, filterStoreType, sortBy, sortOrder]);

  // Open Google Maps link
  const openGoogleMaps = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.warning('No Google Maps link available for this shop');
    }
  };

  // Copy shop details to clipboard
  const copyShopDetails = (shop) => {
    const details = `
Shop: ${shop.shopName}
Route: ${shop.route}
Type: ${shop.storeType}
Location: ${shop.placeName || 'N/A'}
Coordinates: ${shop.latitude}, ${shop.longitude}
Phone: ${shop.phoneNumber || 'N/A'}
Notes: ${shop.notes || 'N/A'}
Google Maps: ${shop.googleMapsLink || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(details).then(() => {
      toast.success('Shop details copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy details');
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get route color
  const getRouteColor = (route) => {
    const colors = {
      'Route 1': '#FF0000',
      'Route 2': '#0000FF',
      'Route 3': '#00FF00',
      'Route 4': '#FFA500'
    };
    return colors[route] || '#808080';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <button onClick={onRefresh} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Total Shops</div>
          </div>
        </div>

        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.todayAdded}</div>
            <div className="stat-label">Added Today</div>
          </div>
        </div>

        <div className="stat-card week">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.recentlyAdded}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>

        {/* Route Statistics */}
        {Object.entries(statistics.byRoute).map(([route, count]) => (
          <div key={route} className="stat-card route">
            <div 
              className="stat-icon" 
              style={{ color: getRouteColor(route) }}
            >
              📍
            </div>
            <div className="stat-content">
              <div className="stat-value">{count}</div>
              <div className="stat-label">{route}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Store Type Statistics */}
      <div className="store-type-stats">
        <h3>Store Types Distribution</h3>
        <div className="type-bars">
          {Object.entries(statistics.byStoreType).map(([type, count]) => (
            <div key={type} className="type-bar">
              <div className="type-label">{type}</div>
              <div className="type-progress">
                <div 
                  className="type-progress-bar"
                  style={{ width: `${(count / statistics.total) * 100}%` }}
                >
                  {count}
                </div>
              </div>
              <div className="type-percentage">
                {((count / statistics.total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select 
            value={filterRoute} 
            onChange={(e) => setFilterRoute(e.target.value)}
            className="filter-select"
          >
            <option value="">All Routes</option>
            {['Route 1', 'Route 2', 'Route 3', 'Route 4'].map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>

          <select 
            value={filterStoreType} 
            onChange={(e) => setFilterStoreType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {['With Supervisor', 'Without Supervisor', 'Discount Store'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="route">Sort by Route</option>
            <option value="type">Sort by Type</option>
          </select>

          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="filter-summary">
          Showing {filteredShops.length} of {shops.length} shops
        </div>
      </div>

      {/* Shops Table */}
      <div className="shops-table-container">
        <table className="shops-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Shop Name</th>
              <th>Route</th>
              <th>Store Type</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No shops found
                </td>
              </tr>
            ) : (
              filteredShops.map((shop, index) => (
                <tr key={shop.id}>
                  <td>{index + 1}</td>
                  <td className="shop-name">
                    <strong>{shop.shopName}</strong>
                    {shop.notes && (
                      <span className="shop-notes" title={shop.notes}>
                        📝
                      </span>
                    )}
                  </td>
                  <td>
                    <span 
                      className="route-badge"
                      style={{ backgroundColor: getRouteColor(shop.route) }}
                    >
                      {shop.route}
                    </span>
                  </td>
                  <td>{shop.storeType}</td>
                  <td className="location-cell">
                    {shop.placeName || `${shop.latitude}, ${shop.longitude}`}
                  </td>
                  <td>{shop.phoneNumber || '-'}</td>
                  <td>{formatDate(shop.timestamp)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => openGoogleMaps(shop.googleMapsLink)}
                      className="action-btn map-btn"
                      title="Open in Google Maps"
                    >
                      🗺️
                    </button>
                    <button
                      onClick={() => copyShopDetails(shop)}
                      className="action-btn copy-btn"
                      title="Copy Details"
                    >
                      📋
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
