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
    <div className="row g-3 mb-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="col-12 col-sm-6 col-lg-3">
            <div
              className="card"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px'
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} color={stat.color} />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ color: stat.color }}>
                      {stat.value}
                    </h3>
                    <p className="text-muted mb-0 small">{stat.label}</p>
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
