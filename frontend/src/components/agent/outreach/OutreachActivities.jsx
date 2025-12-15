import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  FaPlus, 
  FaMapMarkerAlt, 
  FaUser, 
  FaCalendar, 
  FaThumbsUp, 
  FaThumbsDown,
  FaMinus,
  FaTrash,
  FaEdit
} from 'react-icons/fa';

const OutreachActivities = ({ activities, onRefresh }) => {
  const { isDarkMode, colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'door-to-door',
    location: '',
    contactsReached: 0,
    positiveResponses: 0,
    neutralResponses: 0,
    negativeResponses: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const activityTypes = [
    { value: 'door-to-door', label: 'Door-to-Door', color: '#3b82f6' },
    { value: 'event', label: 'Event', color: '#10b981' },
    { value: 'phone-banking', label: 'Phone Banking', color: '#f59e0b' },
    { value: 'social-media', label: 'Social Media', color: '#8b5cf6' },
    { value: 'flyering', label: 'Flyering', color: '#06b6d4' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/agent/outreach/activities', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Activity logged successfully!', 'success');
      setShowModal(false);
      setFormData({
        type: 'door-to-door',
        location: '',
        contactsReached: 0,
        positiveResponses: 0,
        neutralResponses: 0,
        negativeResponses: 0,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Error logging activity:', error);
      Swal.fire('Error', 'Failed to log activity.', 'error');
    }
  };

  const getTypeColor = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.color : '#6b7280';
  };

  const getResponsePercentage = (activity) => {
    const total = activity.contactsReached;
    if (total === 0) return { positive: 0, neutral: 0, negative: 0 };
    return {
      positive: Math.round((activity.positiveResponses / total) * 100),
      neutral: Math.round((activity.neutralResponses / total) * 100),
      negative: Math.round((activity.negativeResponses / total) * 100)
    };
  };

  return (
    <>
      {/* Add Button */}
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="me-2" /> Log Activity
        </button>
      </div>

      {/* Activities List */}
      <div className="row g-3">
        {activities.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FaRoute size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">No activities logged yet</h5>
              <p className="text-muted">Start logging your outreach activities!</p>
            </div>
          </div>
        ) : (
          activities.map((activity) => {
            const percentages = getResponsePercentage(activity);
            return (
              <div key={activity._id} className="col-12">
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
                        <span
                          className="badge mb-2"
                          style={{
                            background: getTypeColor(activity.type),
                            color: '#fff'
                          }}
                        >
                          {activity.type.replace('-', ' ').toUpperCase()}
                        </span>
                        <div className="d-flex gap-3 text-muted small">
                          <span>
                            <FaMapMarkerAlt className="me-1" />
                            {activity.location}
                          </span>
                          <span>
                            <FaCalendar className="me-1" />
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                          <span>
                            <FaUser className="me-1" />
                            {activity.agentName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-3">
                        <div className="text-center">
                          <h4 className="fw-bold mb-0" style={{ color: colors.text }}>
                            {activity.contactsReached}
                          </h4>
                          <small className="text-muted">Contacts Reached</small>
                        </div>
                      </div>
                      <div className="col-12 col-md-3">
                        <div className="text-center">
                          <h4 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                            {activity.positiveResponses}
                          </h4>
                          <small className="text-muted">
                            <FaThumbsUp size={12} className="me-1" />
                            Positive ({percentages.positive}%)
                          </small>
                        </div>
                      </div>
                      <div className="col-12 col-md-3">
                        <div className="text-center">
                          <h4 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                            {activity.neutralResponses}
                          </h4>
                          <small className="text-muted">
                            <FaMinus size={12} className="me-1" />
                            Neutral ({percentages.neutral}%)
                          </small>
                        </div>
                      </div>
                      <div className="col-12 col-md-3">
                        <div className="text-center">
                          <h4 className="fw-bold mb-0" style={{ color: '#ef4444' }}>
                            {activity.negativeResponses}
                          </h4>
                          <small className="text-muted">
                            <FaThumbsDown size={12} className="me-1" />
                            Negative ({percentages.negative}%)
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress mb-3" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${percentages.positive}%` }}
                      ></div>
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: `${percentages.neutral}%` }}
                      ></div>
                      <div
                        className="progress-bar bg-danger"
                        style={{ width: `${percentages.negative}%` }}
                      ></div>
                    </div>

                    {/* Notes */}
                    {activity.notes && (
                      <div
                        className="p-3"
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#f8f9fa',
                          borderRadius: '8px'
                        }}
                      >
                        <small className="fw-semibold text-muted d-block mb-1">Notes:</small>
                        <p className="mb-0 small" style={{ color: colors.text }}>
                          {activity.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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
            className="modal-dialog modal-dialog-centered modal-lg"
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
                  Log Outreach Activity
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Activity Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        {activityTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Contacts Reached</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.contactsReached}
                        onChange={(e) => setFormData({ ...formData, contactsReached: parseInt(e.target.value) })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Positive Responses</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.positiveResponses}
                        onChange={(e) => setFormData({ ...formData, positiveResponses: parseInt(e.target.value) })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Neutral Responses</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.neutralResponses}
                        onChange={(e) => setFormData({ ...formData, neutralResponses: parseInt(e.target.value) })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Negative Responses</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.negativeResponses}
                        onChange={(e) => setFormData({ ...formData, negativeResponses: parseInt(e.target.value) })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Log Activity
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

export default OutreachActivities;
