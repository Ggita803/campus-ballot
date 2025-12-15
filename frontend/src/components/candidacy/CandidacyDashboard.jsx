import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaTrophy, 
  FaChartLine, 
  FaUsers, 
  FaCalendar, 
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUserFriends,
  FaBullhorn,
  FaTasks
} from 'react-icons/fa';

const CandidacyDashboard = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    elections: [],
    stats: {
      totalElections: 0,
      activeElections: 0,
      wonElections: 0,
      totalVotes: 0,
      pendingTasks: 0,
      activeAgents: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to dummy data
      setDashboardData({
        elections: [
          {
            _id: '1',
            title: 'Student Council President 2025',
            status: 'active',
            startDate: '2025-01-15',
            endDate: '2025-01-20',
            currentVotes: 245,
            totalVoters: 500,
            position: 'President',
            ranking: 2
          },
          {
            _id: '2',
            title: 'Faculty Representative',
            status: 'upcoming',
            startDate: '2025-02-01',
            endDate: '2025-02-05',
            currentVotes: 0,
            totalVoters: 300,
            position: 'Representative',
            ranking: null
          }
        ],
        stats: {
          totalElections: 5,
          activeElections: 1,
          wonElections: 2,
          totalVotes: 892,
          pendingTasks: 4,
          activeAgents: 3
        }
      });
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Elections',
      value: dashboardData.stats.totalElections,
      icon: FaTrophy,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Active Campaigns',
      value: dashboardData.stats.activeElections,
      icon: FaBullhorn,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Elections Won',
      value: dashboardData.stats.wonElections,
      icon: FaCheckCircle,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Total Votes',
      value: dashboardData.stats.totalVotes,
      icon: FaUsers,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Active Agents',
      value: dashboardData.stats.activeAgents,
      icon: FaUserFriends,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: 'Pending Tasks',
      value: dashboardData.stats.pendingTasks,
      icon: FaTasks,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Active', color: '#10b981', icon: FaHourglassHalf },
      upcoming: { text: 'Upcoming', color: '#3b82f6', icon: FaCalendar },
      completed: { text: 'Completed', color: '#6b7280', icon: FaCheckCircle },
      won: { text: 'Won', color: '#f59e0b', icon: FaTrophy },
      lost: { text: 'Lost', color: '#ef4444', icon: FaTimesCircle }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <span
        className="badge d-inline-flex align-items-center gap-1"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2" style={{ color: colors.text }}>
          <FaTrophy className="me-2" style={{ color: '#f59e0b' }} />
          Candidacy Dashboard
        </h2>
        <p className="text-muted mb-0">Manage your campaigns and track your performance</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl-2">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '12px',
                        backgroundColor: stat.bgColor
                      }}
                    >
                      <Icon size={22} color={stat.color} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-1" style={{ color: stat.color, fontSize: '1.8rem' }}>
                    {stat.value}
                  </h3>
                  <p className="text-muted mb-0 small">{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <Link to="/candidacy/profile" className="btn btn-primary w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaUserFriends size={24} className="mb-2" />
                    <span>Edit Profile</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/candidacy/materials" className="btn btn-success w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaBullhorn size={24} className="mb-2" />
                    <span>Campaign Materials</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/candidacy/agents" className="btn btn-info w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaUsers size={24} className="mb-2" />
                    <span>Manage Agents</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/candidacy/stats" className="btn btn-warning w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaChartLine size={24} className="mb-2" />
                    <span>View Statistics</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="row">
        <div className="col-12">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>My Elections</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                    <tr>
                      <th style={{ color: colors.text, padding: '1rem' }}>Election Title</th>
                      <th style={{ color: colors.text }}>Position</th>
                      <th style={{ color: colors.text }}>Status</th>
                      <th style={{ color: colors.text }}>Votes</th>
                      <th style={{ color: colors.text }}>Ranking</th>
                      <th style={{ color: colors.text }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.elections.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4" style={{ color: colors.textMuted }}>
                          No elections found. Apply for candidacy to get started!
                        </td>
                      </tr>
                    ) : (
                      dashboardData.elections.map((election) => (
                        <tr key={election._id}>
                          <td style={{ color: colors.text, padding: '1rem' }}>
                            <div className="fw-semibold">{election.title}</div>
                            <small className="text-muted">
                              {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                            </small>
                          </td>
                          <td style={{ color: colors.text }}>
                            <span className="badge bg-secondary">{election.position}</span>
                          </td>
                          <td>{getStatusBadge(election.status)}</td>
                          <td style={{ color: colors.text }}>
                            <div className="fw-semibold">{election.currentVotes}</div>
                            <small className="text-muted">of {election.totalVoters}</small>
                          </td>
                          <td style={{ color: colors.text }}>
                            {election.ranking ? (
                              <span className="badge bg-primary">#{election.ranking}</span>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <Link
                              to={`/candidacy/election/${election._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidacyDashboard;
