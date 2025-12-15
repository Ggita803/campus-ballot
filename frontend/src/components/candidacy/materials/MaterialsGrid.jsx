import React from 'react';
import { FaImages, FaPlus } from 'react-icons/fa';
import MaterialCard from './MaterialCard';

const MaterialsGrid = ({ 
  materials, 
  onDownload, 
  onPreview, 
  onDelete,
  onUploadClick 
}) => {
  if (materials.length === 0) {
    return (
      <div className="col-12">
        <div className="text-center py-5">
          <FaImages size={64} className="text-muted mb-3 opacity-50" />
          <h5 className="text-muted mb-2">No materials found</h5>
          <p className="text-muted">Upload your first campaign material to get started!</p>
          <button
            className="btn btn-primary mt-3"
            onClick={onUploadClick}
          >
            <FaPlus className="me-2" />
            Upload Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {materials.map((material) => (
        <div key={material._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <MaterialCard
            material={material}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        </div>
      ))}
    </>
  );
};

export default MaterialsGrid;
