import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  FaFolder, 
  FaFileImage, 
  FaFile, 
  FaFilePdf, 
  FaFileVideo, 
  FaImages,
  FaSearch 
} from 'react-icons/fa';

const MaterialsFilter = ({ 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm,
  materials 
}) => {
  const { isDarkMode, colors } = useTheme();

  const categories = [
    { id: 'all', name: 'All Materials', icon: FaFolder, color: '#6b7280' },
    { id: 'posters', name: 'Posters', icon: FaFileImage, color: '#3b82f6' },
    { id: 'flyers', name: 'Flyers', icon: FaFile, color: '#10b981' },
    { id: 'manifestos', name: 'Manifestos', icon: FaFilePdf, color: '#f59e0b' },
    { id: 'videos', name: 'Videos', icon: FaFileVideo, color: '#8b5cf6' },
    { id: 'photos', name: 'Photos', icon: FaImages, color: '#06b6d4' }
  ];

  return (
    <>
      {/* Category Filters */}
      <div className="mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            const count = category.id === 'all' 
              ? materials.length 
              : materials.filter(m => m.category === category.id).length;
            
            return (
              <button
                key={category.id}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  borderRadius: '20px',
                  padding: '0.5rem 1rem'
                }}
              >
                <Icon className="me-2" size={14} />
                {category.name}
                <span className="ms-2 badge bg-secondary">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <FaSearch
            className="position-absolute"
            style={{
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textMuted
            }}
          />
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default MaterialsFilter;
