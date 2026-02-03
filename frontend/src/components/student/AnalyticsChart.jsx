import React from 'react';
import { FaChartLine, FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const AnalyticsChart = ({ myVotes, electionStats }) => {
  const { isDarkMode, colors } = useTheme();

  // Calculate monthly participation
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const votesInMonth = myVotes.filter(vote => {
        const voteDate = new Date(vote.createdAt);
        return voteDate.getMonth() === monthIndex;
      }).length;
      
      last6Months.push({
        month: months[monthIndex],
        votes: votesInMonth
      });
    }
    
    return last6Months;
  };

  const monthlyData = getMonthlyData();
  const maxVotes = Math.max(...monthlyData.map(d => d.votes), 1);
  const participationRate = electionStats.total > 0 
    ? Math.round((electionStats.participated / electionStats.total) * 100) 
    : 0;

  return (
    <div className="row g-3 mb-4">
      {/* Participation Chart */}
      <div className="col-md-8">
        <div
          className="card shadow-sm h-100"
          style={{
            background: isDarkMode ? colors.surface : '#fff',
            border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
            borderRadius: '12px'
          }}
        >
          <div className="card-header border-0 py-3" style={{
            background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
            borderBottom: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`
          }}>
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: isDarkMode ? colors.text : '#212529' }}>
              <FaChartLine className="text-primary" /> Voting Activity (Last 6 Months)
            </h6>
          </div>
          <div className="card-body p-4">
            <div style={{ height: '200px', position: 'relative' }}>
              <svg width="100%" height="160" viewBox="0 0 400 160" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[...Array(5)].map((_, i) => {
                  const y = (i * 160) / 4;
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1={y}
                      x2="400"
                      y2={y}
                      stroke={isDarkMode ? colors.border : '#e9ecef'}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  );
                })}
                
                {/* Smooth curved line chart */}
                <path
                  d={(() => {
                    if (monthlyData.length === 0) return '';
                    
                    const points = monthlyData.map((data, index) => {
                      const x = (index * 400) / Math.max(monthlyData.length - 1, 1);
                      const y = maxVotes > 0 ? 160 - (data.votes / maxVotes) * 140 : 160;
                      return { x, y };
                    });
                    
                    if (points.length === 1) {
                      return `M ${points[0].x} ${points[0].y}`;
                    }
                    
                    let path = `M ${points[0].x} ${points[0].y}`;
                    
                    for (let i = 1; i < points.length; i++) {
                      const prevPoint = points[i - 1];
                      const currentPoint = points[i];
                      const nextPoint = points[i + 1];
                      
                      // Calculate control points for smooth curves
                      const controlPoint1 = {
                        x: prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3,
                        y: prevPoint.y
                      };
                      const controlPoint2 = {
                        x: currentPoint.x - (currentPoint.x - prevPoint.x) * 0.3,
                        y: currentPoint.y
                      };
                      
                      path += ` C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${currentPoint.x} ${currentPoint.y}`;
                    }
                    
                    return path;
                  })()}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {monthlyData.map((data, index) => {
                  const x = (index * 400) / Math.max(monthlyData.length - 1, 1);
                  const y = maxVotes > 0 ? 160 - (data.votes / maxVotes) * 140 : 160;
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill={colors.primary}
                        stroke={isDarkMode ? colors.surface : '#fff'}
                        strokeWidth="2"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill={isDarkMode ? '#1d4ed8' : '#1d4ed8'}
                      />
                      <title>{`${data.month}: ${data.votes} votes`}</title>
                    </g>
                  );
                })}
              </svg>
              
              {/* X-axis labels */}
              <div className="d-flex justify-content-between mt-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="text-center">
                    <div className="fw-bold small" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                      {data.votes}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {data.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="col-md-4">
        <div className="d-flex flex-column gap-3 h-100">
          {/* Participation Rate */}
          <div
            className="card shadow-sm flex-fill"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center text-center">
              <FaTrophy className="text-warning mb-2" size={32} />
              <h3 className="fw-bold mb-1" style={{ color: isDarkMode ? colors.text : '#212529' }}>
                {participationRate}%
              </h3>
              <p className="text-muted small mb-0">Participation Rate</p>
              <div className="progress w-100 mt-2" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{ width: `${participationRate}%` }}
                  aria-valuenow={participationRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>

          {/* Total Votes */}
          <div
            className="card shadow-sm flex-fill"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${isDarkMode ? '#1d4ed8' : '#1d4ed8'} 100%)`,
              border: 'none',
              borderRadius: '12px',
              color: '#fff'
            }}
          >
            <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center text-center">
              <FaCalendarAlt className="mb-2" size={28} />
              <h3 className="fw-bold mb-1">{myVotes.length}</h3>
              <p className="opacity-90 small mb-0">Total Votes Cast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
