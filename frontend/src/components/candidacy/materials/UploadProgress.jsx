import React from 'react';

const UploadProgress = ({ progress }) => {
  if (progress === 0 || progress === 100) return null;

  return (
    <div className="mb-4">
      <div className="progress" style={{ height: '25px' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;
