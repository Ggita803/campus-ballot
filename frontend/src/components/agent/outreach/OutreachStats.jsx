import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaRoute, FaUsers, FaThumbsUp, FaCalendarAlt } from 'react-icons/fa';

const OutreachStats = ({ stats }) => {
  const { isDarkMode, colors } = useTheme();

  const statsConfig = [
    {
      label: 'Total Activities',
      value: stats.totalActivities,
      icon: FaRoute,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Contacts Reached',
      value: stats.totalContacts,
      icon: FaUsers,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Positive Responses',
      value: stats.positiveResponses,
      icon: FaThumbsUp,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: FaCalendarAlt,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  return (
    <div className="row g-2 g-md-3 mb-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="col-6 col-md-6 col-lg-3">
            <div
              className="card"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px',
                height: '100%'
              }}
            >
              <div className="card-body p-2 p-md-3">
                <div className="d-flex flex-column align-items-center align-items-md-start gap-2">
                  <div
                    style={{
                      width: window.innerWidth < 480 ? '45px' : '50px',
                      height: window.innerWidth < 480 ? '45px' : '50px',
                      borderRadius: '12px',
                      background: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={window.innerWidth < 480 ? 20 : 24} color={stat.color} />
                  </div>
                  <div style={{ textAlign: window.innerWidth < 480 ? 'center' : 'left', width: '100%' }}>
                    <h3 
                      className="fw-bold mb-0" 
                      style={{ 
                        color: stat.color,
                        fontSize: window.innerWidth < 480 ? '1.25rem' : '1.5rem'
                      }}
                    >
                      {stat.value}
                    </h3>
                    <p 
                      className="text-muted mb-0" 
                      style={{
                        fontSize: window.innerWidth < 480 ? '0.75rem' : '0.875rem'
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OutreachStats;
