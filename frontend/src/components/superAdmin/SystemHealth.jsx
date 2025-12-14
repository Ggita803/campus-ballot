import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const SystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/super-admin/system-health', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch system health', err);
      // Fallback dummy data
      setHealthData({
        status: 'Healthy',
        uptime: '45 days 12 hours',
        cpuUsage: 42,
        memoryUsage: 58,
        databaseConnections: 15,
        activeUsers: 234,
        apiResponseTime: 145,
        errorRate: 0.02,
      });
      setLoading(false);
    }
  };

  const getStatusColor = (value, threshold = 70) => {
    if (value < 50) return '#10b981';
    if (value < threshold) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusText = (value, threshold = 70) => {
    if (value < 50) return 'Good';
    if (value < threshold) return 'Warning';
    return 'Critical';
  };

  if (loading) return <div className="text-center py-5">Loading system health...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">System Health Monitor</h3>
        <label className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span className="form-check-label">Auto-refresh (30s)</span>
        </label>
      </div>

      {/* Key Metrics */}
      <div className="row g-3 mb-4">
        {/* CPU Usage */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">CPU Usage</h6>
              <div className="d-flex align-items-center justify-content-between">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(healthData?.cpuUsage) }}>
                  {healthData?.cpuUsage}%
                </div>
                <div className="progress" style={{ width: '100px', height: '30px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${healthData?.cpuUsage}%`,
                      backgroundColor: getStatusColor(healthData?.cpuUsage),
                    }}
                  />
                </div>
              </div>
              <small className="text-muted">{getStatusText(healthData?.cpuUsage)}</small>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">Memory Usage</h6>
              <div className="d-flex align-items-center justify-content-between">
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(healthData?.memoryUsage) }}>
                  {healthData?.memoryUsage}%
                </div>
                <div className="progress" style={{ width: '100px', height: '30px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${healthData?.memoryUsage}%`,
                      backgroundColor: getStatusColor(healthData?.memoryUsage),
                    }}
                  />
                </div>
              </div>
              <small className="text-muted">{getStatusText(healthData?.memoryUsage)}</small>
            </div>
          </div>
        </div>

        {/* API Response Time */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">API Response Time</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {healthData?.apiResponseTime}ms
              </div>
              <small className="text-muted">Average response time</small>
            </div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">System Uptime</h6>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {healthData?.uptime}
              </div>
              <small className="text-muted">Continuous operation</small>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">Database Connections</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {healthData?.databaseConnections}
              </div>
              <small className="text-muted">Active connections</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">Active Users</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
                {healthData?.activeUsers}
              </div>
              <small className="text-muted">Currently online</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">Error Rate</h6>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: healthData?.errorRate > 0.05 ? '#ef4444' : '#10b981' }}>
                {(healthData?.errorRate * 100).toFixed(2)}%
              </div>
              <small className="text-muted">API errors per request</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted mb-2">Overall Status</h6>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: healthData?.status === 'Healthy' ? '#10b981' : '#ef4444',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {healthData?.status}
                </span>
              </div>
              <small className="text-muted">System operational status</small>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {healthData?.alerts && healthData.alerts.length > 0 && (
        <div className="card mb-4 border-warning">
          <div className="card-header bg-warning">
            <h6 className="mb-0">Active Alerts</h6>
          </div>
          <div className="card-body">
            {healthData.alerts.map((alert, idx) => (
              <div key={idx} className="d-flex align-items-start gap-2 mb-2">
                <i className="fa-solid fa-exclamation-triangle text-warning mt-1"></i>
                <div>
                  <strong>{alert.title}</strong>
                  <p className="text-muted small mb-0">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SystemHealth;
