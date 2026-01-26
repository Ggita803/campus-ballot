import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaUser, FaCalendar } from 'react-icons/fa';

const OutreachActivities = ({ activities, onRefresh }) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <>
      {/* Activities List - Agent Assignments */}
      <div className="row g-3">
        {activities.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FaUser size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">No agents assigned yet</h5>
              <p className="text-muted">Assign agents to your campaign to get started</p>
            </div>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="col-12">
              <div
                className="card"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px'
                }}
              >
                <div className="card-body p-3 p-md-4">
                  {/* Header */}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1 mb-3 mb-md-0">
                      <div className="d-flex align-items-center gap-2 gap-md-3 mb-2">
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            fontSize: window.innerWidth < 480 ? '0.85rem' : '1rem', 
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}
                        >
                          {activity.agentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h6 
                            className="mb-0 fw-bold" 
                            style={{ 
                              color: colors.text,
                              fontSize: window.innerWidth < 480 ? '0.95rem' : '1rem'
                            }}
                          >
                            {activity.agentName}
                          </h6>
                          <p 
                            className="mb-0 small text-muted"
                            style={{ fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem' }}
                          >
                            {activity.agentRole} - {activity.status}
                          </p>
                        </div>
                      </div>
                      <div 
                        className="d-flex flex-column flex-md-row gap-2 gap-md-3 text-muted mt-2"
                        style={{
                          fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem',
                          marginLeft: window.innerWidth < 480 ? '0' : '3.5rem'
                        }}
                      >
                        {activity.agentEmail && (
                          <span className="text-truncate">
                            <strong>Email:</strong> {activity.agentEmail}
                          </span>
                        )}
                        {activity.agentPhone && (
                          <span className="text-truncate">
                            <strong>Phone:</strong> {activity.agentPhone}
                          </span>
                        )}
                        <span className="text-truncate">
                          <FaCalendar className="me-1" />
                          Joined: {new Date(activity.joinedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: activity.status === 'active' ? '#10b981' : '#6b7280',
                        color: '#fff',
                        fontSize: window.innerWidth < 480 ? '0.7rem' : '0.8rem',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {activity.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="row g-2 g-md-3">
                    <div className="col-6 col-md-4">
                      <div className="text-center">
                        <h4 
                          className="fw-bold mb-0" 
                          style={{ 
                            color: colors.text,
                            fontSize: window.innerWidth < 480 ? '1.25rem' : '1.5rem'
                          }}
                        >
                          {activity.tasksActive}
                        </h4>
                        <small 
                          className="text-muted"
                          style={{ fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem' }}
                        >
                          Active Tasks
                        </small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="text-center">
                        <h4 
                          className="fw-bold mb-0" 
                          style={{ 
                            color: '#10b981',
                            fontSize: window.innerWidth < 480 ? '1.25rem' : '1.5rem'
                          }}
                        >
                          {activity.tasksCompleted}
                        </h4>
                        <small 
                          className="text-muted"
                          style={{ fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem' }}
                        >
                          Completed Tasks
                        </small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="text-center">
                        <h4 
                          className="fw-bold mb-0" 
                          style={{ 
                            color: '#3b82f6',
                            fontSize: window.innerWidth < 480 ? '1.25rem' : '1.5rem'
                          }}
                        >
                          {activity.tasksActive + activity.tasksCompleted}
                        </h4>
                        <small 
                          className="text-muted"
                          style={{ fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem' }}
                        >
                          Total Tasks
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {activity.notes && (
                    <div
                      className="p-3 mt-3"
                      style={{
                        background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                        borderRadius: '8px'
                      }}
                    >
                      <small className="fw-semibold text-muted d-block mb-1">Notes:</small>
                      <p className="mb-0 small" style={{ color: colors.text }}>
                        {activity.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default OutreachActivities;
