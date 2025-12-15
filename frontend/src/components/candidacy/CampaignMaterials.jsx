import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaImages, 
  FaPlus,
  FaTrash,
  FaDownload,
  FaEye,
  FaUpload,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaEdit,
  FaFolder,
  FaSearch
} from 'react-icons/fa';

const CampaignMaterials = () => {
  const { isDarkMode, colors } = useTheme();
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(null);

  const categories = [
    { id: 'all', name: 'All Materials', icon: FaFolder, color: '#6b7280' },
    { id: 'posters', name: 'Posters', icon: FaFileImage, color: '#3b82f6' },
    { id: 'flyers', name: 'Flyers', icon: FaFile, color: '#10b981' },
    { id: 'manifestos', name: 'Manifestos', icon: FaFilePdf, color: '#f59e0b' },
    { id: 'videos', name: 'Videos', icon: FaFileVideo, color: '#8b5cf6' },
    { id: 'photos', name: 'Photos', icon: FaImages, color: '#06b6d4' }
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching materials:', error);
      // Fallback dummy data
      setMaterials([
        {
          _id: '1',
          title: 'Campaign Poster 2025',
          category: 'posters',
          fileType: 'image/png',
          fileSize: 2.5,
          url: '/uploads/poster1.png',
          uploadDate: '2025-01-10',
          downloads: 45,
          views: 123
        },
        {
          _id: '2',
          title: 'Election Manifesto',
          category: 'manifestos',
          fileType: 'application/pdf',
          fileSize: 1.2,
          url: '/uploads/manifesto.pdf',
          uploadDate: '2025-01-12',
          downloads: 67,
          views: 234
        },
        {
          _id: '3',
          title: 'Campaign Video - Introduction',
          category: 'videos',
          fileType: 'video/mp4',
          fileSize: 15.6,
          url: '/uploads/intro.mp4',
          uploadDate: '2025-01-11',
          downloads: 23,
          views: 156
        },
        {
          _id: '4',
          title: 'Event Flyer',
          category: 'flyers',
          fileType: 'image/jpeg',
          fileSize: 1.8,
          url: '/uploads/flyer1.jpg',
          uploadDate: '2025-01-13',
          downloads: 89,
          views: 201
        },
        {
          _id: '5',
          title: 'Campaign Team Photo',
          category: 'photos',
          fileType: 'image/jpeg',
          fileSize: 3.2,
          url: '/uploads/team.jpg',
          uploadDate: '2025-01-14',
          downloads: 34,
          views: 98
        }
      ]);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const result = await Swal.fire({
      title: 'Upload Materials',
      html: `
        <div class="mb-3">
          <label class="form-label fw-semibold">Category</label>
          <select id="category" class="form-select">
            <option value="posters">Poster</option>
            <option value="flyers">Flyer</option>
            <option value="manifestos">Manifesto</option>
            <option value="videos">Video</option>
            <option value="photos">Photo</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Title</label>
          <input id="title" class="form-control" placeholder="Material title" />
        </div>
        <div class="small text-muted">
          ${files.length} file(s) selected
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      preConfirm: () => {
        const category = document.getElementById('category').value;
        const title = document.getElementById('title').value;
        if (!title) {
          Swal.showValidationMessage('Please enter a title');
          return false;
        }
        return { category, title };
      }
    });

    if (result.isConfirmed) {
      const { category, title } = result.value;
      
      try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('category', category);
        formData.append('title', title);

        const token = localStorage.getItem('token');
        await axios.post('/api/candidate/materials', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        Swal.fire('Success', 'Materials uploaded successfully!', 'success');
        fetchMaterials();
        setUploadProgress(0);
      } catch (error) {
        console.error('Error uploading materials:', error);
        Swal.fire('Error', 'Failed to upload materials. Please try again.', 'error');
        setUploadProgress(0);
      }
    }
  };

  const handleDelete = async (materialId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This material will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/candidate/materials/${materialId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('Deleted!', 'Material has been deleted.', 'success');
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        Swal.fire('Error', 'Failed to delete material.', 'error');
      }
    }
  };

  const handleDownload = async (material) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidate/materials/${material._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading material:', error);
      Swal.fire('Error', 'Failed to download material.', 'error');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaFileImage size={40} color="#3b82f6" />;
    if (fileType.startsWith('video/')) return <FaFileVideo size={40} color="#8b5cf6" />;
    if (fileType === 'application/pdf') return <FaFilePdf size={40} color="#ef4444" />;
    return <FaFile size={40} color="#6b7280" />;
  };

  const formatFileSize = (mb) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: materials.length,
    totalSize: materials.reduce((sum, m) => sum + m.fileSize, 0),
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
    totalViews: materials.reduce((sum, m) => sum + m.views, 0)
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: colors.text }}>
              <FaImages className="me-2" style={{ color: '#3b82f6' }} />
              Campaign Materials
            </h2>
            <p className="text-muted mb-0">Upload and manage your campaign content</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaPlus className="me-2" />
            Upload Materials
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
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
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaFolder size={24} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#3b82f6' }}>
                    {stats.total}
                  </h3>
                  <p className="text-muted mb-0 small">Total Files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
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
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaUpload size={24} color="#10b981" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                    {formatFileSize(stats.totalSize)}
                  </h3>
                  <p className="text-muted mb-0 small">Total Size</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
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
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaDownload size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                    {stats.totalDownloads}
                  </h3>
                  <p className="text-muted mb-0 small">Downloads</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
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
                    background: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaEye size={24} color="#8b5cf6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#8b5cf6' }}>
                    {stats.totalViews}
                  </h3>
                  <p className="text-muted mb-0 small">Views</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <div className="progress" style={{ height: '25px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
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
                {category.id !== 'all' && (
                  <span className="ms-2 badge bg-secondary">
                    {materials.filter(m => m.category === category.id).length}
                  </span>
                )}
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

      {/* Materials Grid */}
      <div className="row g-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FaImages size={64} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted mb-2">No materials found</h5>
              <p className="text-muted">Upload your first campaign material to get started!</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaPlus className="me-2" />
                Upload Now
              </button>
            </div>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div
                className="card h-100"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="card-body p-3">
                  {/* File Icon/Preview */}
                  <div
                    className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                      height: '120px',
                      background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                      borderRadius: '8px'
                    }}
                  >
                    {material.fileType.startsWith('image/') ? (
                      <img
                        src={material.url}
                        alt={material.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      getFileIcon(material.fileType)
                    )}
                  </div>

                  {/* Material Info */}
                  <h6 className="fw-bold mb-2" style={{ color: colors.text }}>
                    {material.title}
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary">{material.category}</span>
                    <small className="text-muted">{formatFileSize(material.fileSize)}</small>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mb-3">
                    <span>
                      <FaEye size={12} className="me-1" />
                      {material.views}
                    </span>
                    <span>
                      <FaDownload size={12} className="me-1" />
                      {material.downloads}
                    </span>
                    <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleDownload(material)}
                    >
                      <FaDownload size={12} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-info flex-fill"
                      onClick={() => setShowPreview(material)}
                    >
                      <FaEye size={12} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDelete(material._id)}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
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
          onClick={() => setShowPreview(null)}
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
                  {showPreview.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPreview(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                {showPreview.fileType.startsWith('image/') && (
                  <img
                    src={showPreview.url}
                    alt={showPreview.title}
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  />
                )}
                {showPreview.fileType.startsWith('video/') && (
                  <video controls style={{ maxWidth: '100%', maxHeight: '70vh' }}>
                    <source src={showPreview.url} type={showPreview.fileType} />
                  </video>
                )}
                {showPreview.fileType === 'application/pdf' && (
                  <iframe
                    src={showPreview.url}
                    style={{ width: '100%', height: '70vh', border: 'none' }}
                    title={showPreview.title}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignMaterials;
