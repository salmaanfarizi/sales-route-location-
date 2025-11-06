import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ shops, stats, onClose }) {
  const [filterRoute, setFilterRoute] = useState('all');
  const [filterStoreType, setFilterStoreType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = shops.filter((shop) => {
    const matchesRoute = filterRoute === 'all' || shop.route === filterRoute;
    const matchesStoreType = filterStoreType === 'all' || shop.storeType === filterStoreType;
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.placeName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRoute && matchesStoreType && matchesSearch;
  });

  return (
    <div className="dashboard-overlay" onClick={onClose}>
      <div className="dashboard-content" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <h2>Shop Database Dashboard</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Stats Summary */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Shops</div>
            </div>
          </div>
          <div className="stat-card route-1-card">
            <div className="stat-icon">🔴</div>
            <div>
              <div className="stat-number">{stats.route1}</div>
              <div className="stat-label">Route 1</div>
            </div>
          </div>
          <div className="stat-card route-2-card">
            <div className="stat-icon">🔵</div>
            <div>
              <div className="stat-number">{stats.route2}</div>
              <div className="stat-label">Route 2</div>
            </div>
          </div>
          <div className="stat-card route-3-card">
            <div className="stat-icon">🟢</div>
            <div>
              <div className="stat-number">{stats.route3}</div>
              <div className="stat-label">Route 3</div>
            </div>
          </div>
          <div className="stat-card route-4-card">
            <div className="stat-icon">🟠</div>
            <div>
              <div className="stat-number">{stats.route4}</div>
              <div className="stat-label">Route 4</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-filters">
          <input
            type="text"
            placeholder="Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Routes</option>
            <option value="Route 1">Route 1</option>
            <option value="Route 2">Route 2</option>
            <option value="Route 3">Route 3</option>
            <option value="Route 4">Route 4</option>
          </select>

          <select
            value={filterStoreType}
            onChange={(e) => setFilterStoreType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Store Types</option>
            <option value="With Supervisor">With Supervisor</option>
            <option value="Without Supervisor">Without Supervisor</option>
            <option value="Discount Store">Discount Store</option>
          </select>
        </div>

        <div className="results-count">
          Showing {filteredShops.length} of {shops.length} shops
        </div>

        {/* Shops Table */}
        <div className="shops-table-container">
          <table className="shops-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Shop Name</th>
                <th>Location</th>
                <th>Route</th>
                <th>Store Type</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No shops found
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop, index) => (
                  <tr key={shop.id}>
                    <td>{index + 1}</td>
                    <td className="shop-name">{shop.name}</td>
                    <td>{shop.placeName || 'N/A'}</td>
                    <td>
                      <span className={`route-badge ${shop.route.toLowerCase().replace(' ', '-')}`}>
                        {shop.route}
                      </span>
                    </td>
                    <td>{shop.storeType || 'N/A'}</td>
                    <td className="coordinates">
                      {shop.lat.toFixed(4)}, {shop.lng.toFixed(4)}
                    </td>
                    <td>
                      {shop.googleMapsLink && (
                        <a
                          href={shop.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-map"
                        >
                          View Map
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
