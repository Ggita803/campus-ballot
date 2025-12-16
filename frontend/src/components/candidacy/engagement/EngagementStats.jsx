import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaQuestionCircle, FaCheckCircle, FaClock, FaEye, FaHeart, FaCommentDots } from 'react-icons/fa';

const EngagementStats = ({ stats }) => {
  const { isDarkMode, colors } = useTheme();

  const statsConfig = [
    {
      label: 'Total Questions',
      value: stats.totalQuestions,
      icon: FaQuestionCircle,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Answered',
      value: stats.answeredQuestions,
      icon: FaCheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Pending',
      value: stats.pendingQuestions,
      icon: FaClock,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: FaEye,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes,
      icon: FaHeart,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    {
      label: 'Comments',
      value: stats.totalComments,
      icon: FaCommentDots,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    }
  ];

  return (
    <div className="row g-3 mb-4" style={{ margin: '0', width: '100%' }}>
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="col-6 col-sm-4 col-lg-3 col-xl-2">
            <div
              className="card h-100"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <div className="card-body" style={{ padding: '0.875rem' }}>
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} color={stat.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 className="fw-bold mb-0" style={{ color: stat.color }}>
                      {stat.value}
                    </h4>
                    <p className="text-muted mb-0 small text-truncate">{stat.label}</p>
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

export default EngagementStats;
