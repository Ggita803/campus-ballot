import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaUserFriends, 
  FaPlus, 
  FaEdit,
  FaTrash,
  FaTasks,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaCrown,
  FaUserShield
} from 'react-icons/fa';

const AgentManagement = () => {
  const { isDarkMode, colors } = useTheme();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'agent', // agent, senior-agent, coordinator
    permissions: {
      updateMaterials: false,
      postUpdates: false,
      respondToQuestions: false,
      viewStatistics: false,
      manageTasks: false
    }
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/agents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Fallback dummy data
      setAgents([
        {
          _id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+254712345678',
          role: 'coordinator',
          status: 'active',
          tasksCompleted: 15,
          tasksActive: 3,
          joinedDate: '2025-01-10',
          permissions: {
            updateMaterials: true,
            postUpdates: true,
            respondToQuestions: true,
            viewStatistics: true,
            manageTasks: true
          }
        },
        {
          _id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          phone: '+254723456789',
          role: 'senior-agent',
          status: 'active',
          tasksCompleted: 12,
          tasksActive: 5,
          joinedDate: '2025-01-11',
          permissions: {
            updateMaterials: true,
            postUpdates: true,
            respondToQuestions: true,
            viewStatistics: false,
            manageTasks: false
          }
        },
        {
          _id: '3',
          name: 'Carol White',
          email: 'carol@example.com',
          phone: '+254734567890',
          role: 'agent',
          status: 'active',
          tasksCompleted: 8,
          tasksActive: 2,
          joinedDate: '2025-01-12',
          permissions: {
            updateMaterials: false,
            postUpdates: false,
            respondToQuestions: true,
            viewStatistics: false,
            manageTasks: false
          }
        }
      ]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/candidate/agents', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Agent added successfully!', 'success');
      fetchAgents();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding agent:', error);
      Swal.fire('Error', 'Failed to add agent. Please try again.', 'error');
    }
  };

  const handleEditAgent = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role,
      permissions: agent.permissions
    });
    setShowAddModal(true);
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/candidate/agents/${selectedAgent._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Agent updated successfully!', 'success');
      fetchAgents();
      setShowAddModal(false);
      setSelectedAgent(null);
      resetForm();
    } catch (error) {
      console.error('Error updating agent:', error);
      Swal.fire('Error', 'Failed to update agent. Please try again.', 'error');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This agent will be removed from your campaign team.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove agent'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/candidate/agents/${agentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('Removed!', 'Agent has been removed.', 'success');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
        Swal.fire('Error', 'Failed to remove agent.', 'error');
      }
    }
  };

  const toggleAgentStatus = async (agentId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/candidate/agents/${agentId}/status`, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Agent status updated!', 'success');
      fetchAgents();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'agent',
      permissions: {
        updateMaterials: false,
        postUpdates: false,
        respondToQuestions: false,
        viewStatistics: false,
        manageTasks: false
      }
    });
  };

  const getRoleBadge = (role) => {
    const roles = {
      coordinator: { color: '#f59e0b', icon: FaCrown, text: 'Coordinator' },
      'senior-agent': { color: '#3b82f6', icon: FaUserShield, text: 'Senior Agent' },
      agent: { color: '#10b981', icon: FaUserFriends, text: 'Agent' }
    };
    const config = roles[role] || roles.agent;
    const Icon = config.icon;

    return (
      <span
        className="badge d-inline-flex align-items-center gap-1"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '0.4rem 0.8rem',
          borderRadius: '20px'
        }}
      >
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <FaUserFriends className="me-2" style={{ color: '#3b82f6' }} />
              Agent Management
            </h2>
            <p className="text-muted mb-0">Manage your campaign team members</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedAgent(null);
              resetForm();
              setShowAddModal(true);
            }}
          >
            <FaPlus className="me-2" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
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
                  <FaUserFriends size={24} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#3b82f6' }}>
                    {agents.length}
                  </h3>
                  <p className="text-muted mb-0 small">Total Agents</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
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
                  <FaCheckCircle size={24} color="#10b981" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                    {agents.filter(a => a.status === 'active').length}
                  </h3>
                  <p className="text-muted mb-0 small">Active Agents</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body">
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
                  <FaTasks size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                    {agents.reduce((sum, a) => sum + (a.tasksActive || 0), 0)}
                  </h3>
                  <p className="text-muted mb-0 small">Active Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
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
            placeholder="Search agents..."
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

      {/* Agents List */}
      <div
        className="card"
        style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
          borderRadius: '12px'
        }}
      >
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ background: isDarkMode ? colors.surfaceHover : '#f8f9fa' }}>
                <tr>
                  <th style={{ color: colors.text, padding: '1rem' }}>Agent</th>
                  <th style={{ color: colors.text }}>Role</th>
                  <th style={{ color: colors.text }}>Contact</th>
                  <th style={{ color: colors.text }}>Tasks</th>
                  <th style={{ color: colors.text }}>Status</th>
                  <th style={{ color: colors.text }}>Joined</th>
                  <th style={{ color: colors.text }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5" style={{ color: colors.textMuted }}>
                      <FaUserFriends size={48} className="mb-3 opacity-50" />
                      <p className="mb-0">No agents found. Add your first campaign agent!</p>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent._id}>
                      <td style={{ padding: '1rem' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px', fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ color: colors.text }}>{agent.name}</div>
                            <small className="text-muted">{agent.email}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {getRoleBadge(agent.role)}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ color: colors.text }}>
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <FaEnvelope size={12} />
                            <small>{agent.email}</small>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <FaPhone size={12} />
                            <small>{agent.phone}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ color: colors.text }}>
                          <div className="small">
                            <span className="text-success">{agent.tasksCompleted} completed</span>
                          </div>
                          <div className="small">
                            <span className="text-primary">{agent.tasksActive} active</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <button
                          className={`btn btn-sm ${agent.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleAgentStatus(agent._id, agent.status)}
                          style={{ minWidth: '80px' }}
                        >
                          {agent.status === 'active' ? (
                            <><FaCheckCircle className="me-1" /> Active</>
                          ) : (
                            <><FaTimesCircle className="me-1" /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td style={{ verticalAlign: 'middle', color: colors.text }}>
                        {new Date(agent.joinedDate).toLocaleDateString()}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditAgent(agent)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAgent(agent._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="modal d-block"
          style={{
            background: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050,
            overflow: 'auto'
          }}
          onClick={() => {
            setShowAddModal(false);
            setSelectedAgent(null);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
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
                  {selectedAgent ? 'Edit Agent' : 'Add New Agent'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedAgent(null);
                  }}
                ></button>
              </div>
              <form onSubmit={selectedAgent ? handleUpdateAgent : handleAddAgent}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Role *</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        <option value="agent">Agent</option>
                        <option value="senior-agent">Senior Agent</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold mb-3" style={{ color: colors.text }}>Permissions</label>
                      <div className="row g-2">
                        {Object.keys(formData.permissions).map((permission) => (
                          <div key={permission} className="col-md-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={permission}
                                checked={formData.permissions[permission]}
                                onChange={() => handlePermissionChange(permission)}
                              />
                              <label className="form-check-label" htmlFor={permission} style={{ color: colors.text }}>
                                {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedAgent(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedAgent ? 'Update Agent' : 'Add Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
