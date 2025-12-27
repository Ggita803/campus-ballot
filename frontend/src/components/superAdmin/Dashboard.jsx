import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OverviewCards from '../admin/OverviewCards';
import SuperAdminCharts from './SuperAdminCharts';

// Dummy data for fallback
const dummyStats = {
  totalAdmins: 5,
  totalUsers: 120,
  totalElections: 8,
  activeElections: 2,
  pendingRequests: 3,
  systemHealth: 'OK',
  recentActions: [
    { adminName: 'Jane Doe', action: 'Created Election', date: '2024-05-10T10:00:00Z' },
    { adminName: 'John Smith', action: 'Approved Candidate', date: '2024-05-09T14:30:00Z' },
  ],
  // Add other keys as needed for OverviewCards
};

const SuperAdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/super-admin/reports/system-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data || dummyStats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setStats(dummyStats); // fallback to dummy data
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div
      className="container-fluid"
      style={{
        padding: '2rem',
        minHeight: '100vh',
        transition: 'margin-left 0.2s, width 0.2s',
        width: '100%',
        marginTop: "-40px"
      }}
    >
      {/* Banner */}
      <div 
        className="mb-4 mt-0 rounded-3 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
          padding: '2.5rem 2rem',
          // marginTop: "-10px"
        }}
      >
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <i className="fa-solid fa-crown text-warning" style={{ fontSize: '1.8rem' }}></i>
            </div>
            <div>
              <h2 className="mb-1 fw-bold">Welcome, Super Admin!</h2>
              <p className="mb-0 opacity-90">Manage your campus voting system with full control and oversight</p>
            </div>
          </div>
          <div className="d-flex gap-4 mt-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-shield-halved"></i>
              <span className="small">Full Access</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-users-gear"></i>
              <span className="small">Admin Management</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-chart-line"></i>
              <span className="small">System Analytics</span>
            </div>
          </div>
        </div>
      </div>
      {/* Use the OverviewCards component for stats display */}
      {/* <OverviewCards stats={stats} /> */}
      <OverviewCards stats={stats} />
      <div className="mt-4">
        <Link to="/super-admin/manage-admins" className="btn btn-primary me-2">Manage Admins</Link>
        <Link to="/super-admin/global-settings" className="btn btn-secondary me-2">Global Settings</Link>
        <Link to="/super-admin/audit-logs" className="btn btn-outline-primary me-2">Audit Logs</Link>
        <Link to="/super-admin/election-oversight" className="btn btn-outline-success me-2">Election Oversight</Link>
        <Link to="/super-admin/data-maintenance" className="btn btn-outline-info me-2">Data Maintenance</Link>
        <Link to="/super-admin/reporting" className="btn btn-outline-dark me-2">Reporting</Link>
        <Link to="/super-admin/help" className="btn btn-outline-warning">Help</Link>
      </div>
      {/* Charts and Analytics */}
      <div style={{ width: '100%' }}>
        <SuperAdminCharts />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
