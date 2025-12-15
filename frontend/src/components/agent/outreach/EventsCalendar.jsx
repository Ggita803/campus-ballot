import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers,
  FaTrash,
  FaEdit,
  FaCheckCircle
} from 'react-icons/fa';

const EventsCalendar = ({ events, onRefresh }) => {
  const { isDarkMode, colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    expectedAttendance: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/agent/outreach/events/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Success', 'Event updated successfully!', 'success');
      } else {
        await axios.post('/api/agent/outreach/events', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Success', 'Event created successfully!', 'success');
      }
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        expectedAttendance: 0
      });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving event:', error);
      Swal.fire('Error', 'Failed to save event.', 'error');
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
      time: event.time,
      expectedAttendance: event.expectedAttendance
    });
    setEditingId(event._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Event?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/agent/outreach/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Event has been deleted.', 'success');
        onRefresh();
      } catch (error) {
        console.error('Error deleting event:', error);
        Swal.fire('Error', 'Failed to delete event.', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { color: '#3b82f6', label: 'Upcoming' },
      ongoing: { color: '#10b981', label: 'Ongoing' },
      completed: { color: '#6b7280', label: 'Completed' }
    };
    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <span className="badge" style={{ background: config.color, color: '#fff' }}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Add Button */}
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              location: '',
              date: '',
              time: '',
              expectedAttendance: 0
            });
            setEditingId(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" /> Schedule Event
        </button>
      </div>

      {/* Events List */}
      <div className="row g-3">
        {events.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FaCalendarAlt size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">No events scheduled</h5>
              <p className="text-muted">Schedule your first campaign event!</p>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="col-12 col-lg-6">
              <div
                className="card h-100"
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
                        {event.title}
                      </h5>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(event)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(event._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted mb-3">{event.description}</p>

                  {/* Details */}
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center text-muted small">
                      <FaCalendarAlt className="me-2" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                      <FaClock className="me-2" />
                      {event.time}
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                      <FaMapMarkerAlt className="me-2" />
                      {event.location}
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                      <FaUsers className="me-2" />
                      Expected: {event.expectedAttendance} attendees
                    </div>
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
                  {editingId ? 'Edit Event' : 'Schedule Event'}
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
                    <div className="col-12">
                      <label className="form-label fw-semibold">Event Title</label>
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
                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      ></textarea>
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
                      <label className="form-label fw-semibold">Expected Attendance</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.expectedAttendance}
                        onChange={(e) => setFormData({ ...formData, expectedAttendance: parseInt(e.target.value) })}
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
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                        style={{
                          background: isDarkMode ? colors.surface : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
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
                    {editingId ? 'Update' : 'Schedule'}
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

export default EventsCalendar;
