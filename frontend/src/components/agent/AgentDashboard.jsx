import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUserTie, 
  FaTasks, 
  FaCheckCircle, 
  FaClock,
  FaBullhorn,
  FaChartLine,
  FaUsers,
  FaCalendar,
  FaExclamationTriangle
} from 'react-icons/fa';

const AgentDashboard = () => {
  const { isDarkMode, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    candidates: [],
    tasks: [],
    stats: {
      totalCandidates: 0,
      activeTasks: 0,
      completedTasks: 0,
      pendingApprovals: 0,
      upcomingDeadlines: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/agent/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to dummy data
      setDashboardData({
        candidates: [
          {
            _id: '1',
            name: 'John Kamau',
            position: 'President',
            election: 'Student Council 2025',
            status: 'active',
            avatar: null,
            currentVotes: 234,
            tasks: 3
          },
          {
            _id: '2',
            name: 'Mary Wanjiku',
            position: 'Secretary',
            election: 'Faculty Representative',
            status: 'upcoming',
            avatar: null,
            currentVotes: 0,
            tasks: 5
          }
        ],
        tasks: [
          {
            _id: '1',
            title: 'Distribute campaign flyers',
            candidateName: 'John Kamau',
            priority: 'high',
            dueDate: '2025-01-18',
            status: 'pending',
            description: 'Distribute 500 flyers in main campus'
          },
          {
            _id: '2',
            title: 'Update social media posts',
            candidateName: 'John Kamau',
            priority: 'medium',
            dueDate: '2025-01-16',
            status: 'in-progress',
            description: 'Post daily campaign updates'
          },
          {
            _id: '3',
            title: 'Organize debate preparation',
            candidateName: 'Mary Wanjiku',
            priority: 'high',
            dueDate: '2025-01-17',
            status: 'pending',
            description: 'Schedule and organize debate prep session'
          }
        ],
        stats: {
          totalCandidates: 2,
          activeTasks: 5,
          completedTasks: 12,
          pendingApprovals: 2,
          upcomingDeadlines: 3
        }
      });
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Candidates',
      value: dashboardData.stats.totalCandidates,
      icon: FaUserTie,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Active Tasks',
      value: dashboardData.stats.activeTasks,
      icon: FaTasks,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Completed',
      value: dashboardData.stats.completedTasks,
      icon: FaCheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.stats.pendingApprovals,
      icon: FaClock,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Deadlines',
      value: dashboardData.stats.upcomingDeadlines,
      icon: FaExclamationTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  const getPriorityBadge = (priority) => {
    const colors = {
      high: { bg: '#ef4444', text: 'High' },
      medium: { bg: '#f59e0b', text: 'Medium' },
      low: { bg: '#10b981', text: 'Low' }
    };
    const config = colors[priority] || colors.medium;
    
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${config.bg}20`,
          color: config.bg,
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#6b7280', text: 'Pending' },
      'in-progress': { bg: '#3b82f6', text: 'In Progress' },
      completed: { bg: '#10b981', text: 'Completed' },
      overdue: { bg: '#ef4444', text: 'Overdue' }
    };
    const config = colors[status] || colors.pending;
    
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${config.bg}20`,
          color: config.bg,
          padding: '0.35rem 0.7rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
      >
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
          <FaUserTie className="me-2" style={{ color: '#3b82f6' }} />
          Campaign Agent Dashboard
        </h2>
        <p className="text-muted mb-0">Support your candidates and manage campaign activities</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl">
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
                  <Link to="/agent/tasks" className="btn btn-primary w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaTasks size={24} className="mb-2" />
                    <span>View Tasks</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/agent/candidates" className="btn btn-success w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaUserTie size={24} className="mb-2" />
                    <span>My Candidates</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/agent/outreach" className="btn btn-info w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaBullhorn size={24} className="mb-2" />
                    <span>Voter Outreach</span>
                  </Link>
                </div>
                <div className="col-6 col-md-3">
                  <Link to="/agent/analytics" className="btn btn-warning w-100 d-flex flex-column align-items-center p-3 text-decoration-none">
                    <FaChartLine size={24} className="mb-2" />
                    <span>Performance</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* My Candidates */}
        <div className="col-12 col-lg-6">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaUsers className="me-2" />
                My Candidates
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.candidates.length === 0 ? (
                <div className="text-center py-5">
                  <FaUserTie size={48} className="text-muted mb-3" />
                  <p className="text-muted">No candidates assigned yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.candidates.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="list-group-item border-0 px-0"
                      style={{ background: 'transparent' }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}
                          >
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold" style={{ color: colors.text }}>{candidate.name}</h6>
                            <p className="mb-0 small text-muted">{candidate.position} - {candidate.election}</p>
                            <div className="mt-1">
                              <span className="badge bg-info me-2">{candidate.tasks} tasks</span>
                              {candidate.status === 'active' && (
                                <span className="badge bg-success">{candidate.currentVotes} votes</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/agent/candidate/${candidate._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="col-12 col-lg-6">
          <div
            className="card h-100"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-header" style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa', borderBottom: `1px solid ${colors.border}` }}>
              <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                <FaTasks className="me-2" />
                Recent Tasks
              </h5>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {dashboardData.tasks.length === 0 ? (
                <div className="text-center py-5">
                  <FaTasks size={48} className="text-muted mb-3" />
                  <p className="text-muted">No tasks assigned</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dashboardData.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="list-group-item border-0 px-0 py-3"
                      style={{ 
                        background: 'transparent',
                        borderBottom: `1px solid ${colors.border} !important`
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-1 fw-semibold" style={{ color: colors.text }}>{task.title}</h6>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-muted small mb-2">{task.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted small me-3">
                            <FaCalendar className="me-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-muted small">
                            <FaUserTie className="me-1" />
                            {task.candidateName}
                          </span>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
