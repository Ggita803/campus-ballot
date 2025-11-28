import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: 'fa-solid fa-gauge', to: '/super-admin/dashboard' },
  { label: 'Manage Admins', icon: 'fa-solid fa-user-shield', to: '/super-admin/manage-admins' },
  { label: 'Global Settings', icon: 'fa-solid fa-sliders', to: '/super-admin/global-settings' },
  { label: 'Audit Logs', icon: 'fa-solid fa-clipboard-list', to: '/super-admin/audit-logs' },
  { label: 'Election Oversight', icon: 'fa-solid fa-check-to-slot', to: '/super-admin/election-oversight' },
  { label: 'Data Maintenance', icon: 'fa-solid fa-database', to: '/super-admin/data-maintenance' },
  { label: 'Reporting', icon: 'fa-solid fa-chart-line', to: '/super-admin/reporting' },
  { label: 'Help', icon: 'fa-solid fa-circle-question', to: '/super-admin/help' },
];

export default function SuperAdminSidebar({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SA';

  // Responsive sidebar toggle logic
  // Show sidebar if screen is wide or not collapsed
  const isMobile = typeof window !== "undefined" && window.innerWidth < 992;

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && !collapsed && (
        <div
          className="superadmin-sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.08)',
            zIndex: 99,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <aside
        className={`superadmin-sidebar bg-white shadow-sm${collapsed ? ' collapsed' : ''}`}
        style={{
          minWidth: collapsed ? 64 : 280,
          width: collapsed ? 64 : 280,
          height: '100vh',
          position: 'fixed',
          left: (!isMobile || !collapsed) ? 0 : -280,
          top: 0,
          zIndex: 100,
          transition: 'left 0.2s, min-width 0.2s, width 0.2s',
          boxShadow: '0 0 12px rgba(37,99,235,0.07)'
        }}
      >
        <div className="sidebar-header text-center py-4" style={{ padding: collapsed ? '1rem 0' : '2rem 0', position: 'relative' }}>
          <div
            className="avatar bg-primary text-white mx-auto mb-2"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: collapsed ? 0 : 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            {initials}
          </div>
          {!collapsed && (
            <>
              <span className="fw-bold" style={{ fontSize: '1.45rem', color: '#2563eb', letterSpacing: '-1px' }}>Super Admin</span>
              <div className="mt-2 mb-2">
                <span className="badge bg-danger" style={{ fontSize: '0.95rem', fontWeight: 600 }}>super_admin</span>
              </div>
              <div className="text-muted small mb-2" style={{ fontWeight: 500 }}>
                {user?.name || 'Super Admin'}
              </div>
              <div className="text-muted small" style={{ fontSize: '0.93rem' }}>
                {user?.email}
              </div>
            </>
          )}
          {/* Move toggle button to top right for better UX */}
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{
              position: 'absolute',
              top: 12,
              right: collapsed ? 8 : 16,
              width: collapsed ? 32 : 40,
              zIndex: 101
            }}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
        <nav className="nav flex-column px-2">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link d-flex align-items-center mb-2 ${location.pathname === item.to ? 'active fw-bold text-primary' : 'text-dark'}`}
              style={{
                fontSize: '1.08rem',
                gap: '1.1rem',
                padding: collapsed ? '0.85rem 0.5rem' : '0.85rem 1.5rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12,
                fontWeight: location.pathname === item.to ? 700 : 500,
                background: location.pathname === item.to ? '#f0f4ff' : 'transparent',
                boxShadow: location.pathname === item.to ? '0 2px 8px rgba(37,99,235,0.07)' : 'none',
                transition: 'all 0.18s',
                minWidth: collapsed ? 0 : 220
              }}
              aria-current={location.pathname === item.to ? 'page' : undefined}
              onClick={() => isMobile && setCollapsed(true)}
            >
              <i className={item.icon} style={{ fontSize: '1.2rem' }}></i>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <style>{`
          .superadmin-sidebar { background: #fff; border-right: 1px solid #eee; }
          .superadmin-sidebar .nav-link.active { background: #f0f4ff; border-radius: 12px; }
          .superadmin-sidebar .nav-link:hover { background: #f8f9fa; border-radius: 12px; }
          .superadmin-sidebar.collapsed .sidebar-header .fw-bold,
          .superadmin-sidebar.collapsed .sidebar-header .badge,
          .superadmin-sidebar.collapsed .sidebar-header .mb-2,
          .superadmin-sidebar.collapsed .sidebar-header .small {
            display: none !important;
          }
          @media (max-width: 992px) {
            .superadmin-sidebar {
              left: ${collapsed ? '-280px' : '0'} !important;
              min-width: ${collapsed ? '64px' : '280px'} !important;
              width: ${collapsed ? '64px' : '280px'} !important;
              transition: left 0.2s, min-width 0.2s, width 0.2s;
            }
            .superadmin-sidebar-overlay {
              display: ${collapsed ? 'none' : 'block'};
            }
          }
        `}</style>
      </aside>
      {/* Show a floating button to open sidebar when collapsed on mobile */}
      {isMobile && collapsed && (
        <button
          className="btn btn-primary"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 102,
            borderRadius: '50%',
            width: 48,
            height: 48,
            boxShadow: '0 2px 8px rgba(37,99,235,0.15)'
          }}
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      )}
    </>
  );
}
