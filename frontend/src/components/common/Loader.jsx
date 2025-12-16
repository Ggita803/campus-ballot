import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Loader = ({ message = 'Loading...', size = 'medium' }) => {
  const { isDarkMode, colors } = useTheme();

  const sizeConfig = {
    small: { spinner: '1rem', padding: '1rem' },
    medium: { spinner: '1.5rem', padding: '2rem' },
    large: { spinner: '2rem', padding: '3rem' }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center" 
      style={{ 
        minHeight: '200px',
        padding: config.padding,
        color: colors.text
      }}
    >
      <div 
        className="spinner-border text-primary mb-3" 
        role="status"
        style={{
          width: config.spinner,
          height: config.spinner
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mb-0" style={{ 
        color: colors.textSecondary,
        fontSize: '0.9rem'
      }}>
        {message}
      </p>
    </div>
  );
};

export default Loader;