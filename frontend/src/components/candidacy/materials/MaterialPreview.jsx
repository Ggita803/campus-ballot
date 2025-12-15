import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const MaterialPreview = ({ material, onClose }) => {
  const { isDarkMode, colors } = useTheme();

  if (!material) return null;

  return (
    <div
      className="modal d-block"
      style={{
        background: 'rgba(0,0,0,0.8)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050,
        overflow: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content"
          style={{
            background: isDarkMode ? colors.surface : '#fff',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px'
          }}
        >
          <div className="modal-header" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <h5 className="modal-title fw-bold" style={{ color: colors.text }}>
              {material.title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body text-center">
            {material.fileType.startsWith('image/') && (
              <img
                src={material.url}
                alt={material.title}
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            )}
            {material.fileType.startsWith('video/') && (
              <video controls style={{ maxWidth: '100%', maxHeight: '70vh' }}>
                <source src={material.url} type={material.fileType} />
              </video>
            )}
            {material.fileType === 'application/pdf' && (
              <iframe
                src={material.url}
                style={{ width: '100%', height: '70vh', border: 'none' }}
                title={material.title}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialPreview;
