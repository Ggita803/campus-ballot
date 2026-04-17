import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FaBullhorn, FaPlus, FaEye, FaHeart, FaCommentDots, FaTrash, FaEdit } from 'react-icons/fa';

const AnnouncementsSection = ({ announcements, onRefresh }) => {
  const { isDarkMode, colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/candidate/engagement/announcements/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Success', 'Announcement updated successfully!', 'success');
      } else {
        await axios.post('/api/candidate/engagement/announcements', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Success', 'Announcement created successfully!', 'success');
      }
      setShowModal(false);
      setFormData({ title: '', message: '' });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving announcement:', error);
      Swal.fire('Error', 'Failed to save announcement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({ title: announcement.title, message: announcement.message });
    setEditingId(announcement._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Announcement?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        setIsDeletingId(id);
        const token = localStorage.getItem('token');
        await axios.delete(`/api/candidate/engagement/announcements/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Announcement has been deleted.', 'success');
        onRefresh();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        Swal.fire('Error', 'Failed to delete announcement.', 'error');
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  return (
    <>
      {/* Add Button */}
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({ title: '', message: '' });
            setEditingId(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" /> New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="row g-3">
        {announcements.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FaBullhorn size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">No announcements yet</h5>
              <p className="text-muted">Create your first announcement to engage with voters!</p>
            </div>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement._id} className="col-12">
              <div
                className="card"
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
                  borderRadius: '12px'
                }}
              >
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-2" style={{ color: colors.text }}>
                        {announcement.title}
                      </h5>
                      <small className="text-muted">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(announcement)}
                        disabled={isDeletingId === announcement._id}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(announcement._id)}
                        disabled={isDeletingId === announcement._id}
                        style={{
                          opacity: isDeletingId === announcement._id ? 0.6 : 1,
                          cursor: isDeletingId === announcement._id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isDeletingId === announcement._id ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="mb-3" style={{ color: colors.text }}>
                    {announcement.message}
                  </p>

                  {/* Stats */}
                  <div className="d-flex gap-4 text-muted">
                    <span>
                      <FaEye className="me-1" /> {announcement.views} views
                    </span>
                    <span>
                      <FaHeart className="me-1" /> {announcement.likes} likes
                    </span>
                    <span>
                      <FaCommentDots className="me-1" /> {announcement.comments} comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                background: isDarkMode ? colors.surface : '#fff',
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="modal-header" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h5 className="modal-title" style={{ color: colors.text }}>
                  {editingId ? 'Edit Announcement' : 'New Announcement'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      style={{
                        background: isDarkMode ? colors.surface : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      style={{
                        background: isDarkMode ? colors.surface : '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    style={{
                      opacity: isSubmitting ? 0.6 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        {editingId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingId ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementsSection;
