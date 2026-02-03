import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaTasks, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaExclamationTriangle,
  FaFilter,
  FaSort,
  FaUserTie,
  FaFlag
} from 'react-icons/fa';

const TaskManagement = () => {
  const { isDarkMode, colors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all'); // New filter for task source
  const [sortBy, setSortBy] = useState('dueDate');
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    category: 'general',
    notes: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchAgents();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch tasks assigned to this agent with cache busting
      const response = await axios.get(`/api/tasks/agent?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Agent tasks response:', response.data);
      console.log('Number of tasks found:', response.data?.length || 0);

      // For now, mark all tasks as candidate-assigned since agents primarily work on tasks from candidates
      // This can be refined later when we have better task source tracking in the backend
      const processedTasks = (response.data || []).map(task => ({
        ...task,
        source: 'candidate-assigned' // Default to candidate-assigned for agent tasks
      }));

      setTasks(processedTasks);
    } catch (error) {
      console.error('Error fetching agent tasks:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // For agents, we should get fellow agents from the agent dashboard or a different endpoint
      console.log('Fetching agents...');
      
      let response;
      let agentsList = [];
      
      try {
        // Try getting agent dashboard info first
        response = await axios.get('/api/agent/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Agent dashboard response:', response.data);
        
        // If we get agent info, we can try to find other agents working for the same candidate
        if (response.data.agent) {
          const candidateId = response.data.agent.candidateId;
          
          if (candidateId) {
            // Now try to get other agents for this candidate
            try {
              const agentsResponse = await axios.get(`/api/candidates/${candidateId}/agents`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log('Candidate agents response:', agentsResponse.data);
              
              if (Array.isArray(agentsResponse.data)) {
                agentsList = agentsResponse.data;
              } else if (agentsResponse.data.agents) {
                agentsList = agentsResponse.data.agents;
              }
            } catch (candidateAgentError) {
              console.log('Failed to get candidate agents, using current agent only');
              // Fallback: at least include the current agent
              agentsList = [{
                _id: response.data.agent.userId,
                name: response.data.agent.candidateName,
                email: response.data.agent.candidateEmail,
                status: 'active'
              }];
            }
          }
        }
        
      } catch (dashboardError) {
        console.log('Dashboard endpoint failed, trying direct agents endpoint');
        
        // Fallback: try the original endpoint
        try {
          response = await axios.get('/api/candidates/agents', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (Array.isArray(response.data)) {
            agentsList = response.data;
          } else if (response.data.agents) {
            agentsList = response.data.agents;
          }
        } catch (originalError) {
          console.error('All endpoints failed:', originalError);
          // Last resort: create a dummy agent list from current user
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          agentsList = [{
            _id: currentUser._id,
            name: currentUser.name || 'Current User',
            email: currentUser.email,
            status: 'active'
          }];
        }
      }

      // Process the agents list
      const processedAgents = agentsList
        .filter(agent => agent && (agent.status === 'active' || !agent.status))
        .map(agent => ({
          _id: agent._id || agent.user?._id || agent.userId,
          name: agent.name || agent.user?.name || agent.candidateName || 'Unknown Agent',
          email: agent.email || agent.user?.email || agent.candidateEmail || '',
          status: agent.status || 'active'
        }))
        .filter(agent => agent._id && agent.name);

      console.log('Final processed agents:', processedAgents);
      setAgents(processedAgents);
      
      if (processedAgents.length === 0) {
        console.warn('No agents found. This might be a permissions or data issue.');
      }
      
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      setAgents([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/agent/tasks', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Task created successfully!', 'success');
      fetchTasks();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating task:', error);
      Swal.fire('Error', 'Failed to create task. Please try again.', 'error');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/agent/tasks/${selectedTask._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Task updated successfully!', 'success');
      fetchTasks();
      setShowAddModal(false);
      setSelectedTask(null);
      resetForm();
    } catch (error) {
      console.error('Error updating task:', error);
      Swal.fire('Error', 'Failed to update task. Please try again.', 'error');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo._id,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.category,
      notes: task.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This task will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/agent/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('Deleted!', 'Task has been deleted.', 'success');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire('Error', 'Failed to delete task.', 'error');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/agent/tasks/${taskId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire('Success', 'Task status updated!', 'success');
      fetchTasks();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      category: 'general',
      notes: ''
    });
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      high: { color: '#ef4444', text: 'High', icon: FaExclamationTriangle },
      medium: { color: '#f59e0b', text: 'Medium', icon: FaFlag },
      low: { color: '#10b981', text: 'Low', icon: FaFlag }
    };
    const config = priorities[priority] || priorities.medium;
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

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { color: '#6b7280', text: 'Pending', icon: FaClock },
      'in-progress': { color: '#3b82f6', text: 'In Progress', icon: FaClock },
      completed: { color: '#10b981', text: 'Completed', icon: FaCheckCircle },
      overdue: { color: '#ef4444', text: 'Overdue', icon: FaExclamationTriangle }
    };
    const config = statuses[status] || statuses.pending;
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

  const getCategoryBadge = (category) => {
    const categories = {
      outreach: { color: '#3b82f6', text: 'Outreach' },
      'social-media': { color: '#8b5cf6', text: 'Social Media' },
      research: { color: '#06b6d4', text: 'Research' },
      materials: { color: '#f59e0b', text: 'Materials' },
      general: { color: '#6b7280', text: 'General' }
    };
    const config = categories[category] || categories.general;

    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '0.3rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem'
        }}
      >
        {config.text}
      </span>
    );
  };

  const getSourceBadge = (source) => {
    const sources = {
      'candidate-assigned': { color: '#dc2626', text: 'From Candidate', icon: FaUserTie },
      'self-created': { color: '#059669', text: 'Self Created', icon: FaTasks }
    };
    const config = sources[source] || sources['self-created'];
    const Icon = config.icon;

    return (
      <span
        className="badge d-inline-flex align-items-center gap-1"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.75rem'
        }}
      >
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  // Filter and sort tasks
  let filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterSource !== 'all' && task.source !== filterSource) return false;
    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
    candidateAssigned: tasks.filter(t => t.source === 'candidate-assigned').length,
    selfCreated: tasks.filter(t => t.source === 'self-created').length
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
              <FaTasks className="me-2" style={{ color: '#3b82f6' }} />
              Task Management
            </h2>
            <p className="text-muted mb-0">Assign and track campaign tasks</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedTask(null);
              resetForm();
              setShowAddModal(true);
            }}
          >
            <FaPlus className="me-2" />
            Create Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaTasks size={20} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#3b82f6', fontSize: '1.5rem' }}>
                    {taskStats.total}
                  </h3>
                  <p className="text-muted mb-0 small">Total Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(107, 114, 128, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaClock size={20} color="#6b7280" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#6b7280', fontSize: '1.5rem' }}>
                    {taskStats.pending}
                  </h3>
                  <p className="text-muted mb-0 small">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaClock size={20} color="#3b82f6" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#3b82f6', fontSize: '1.5rem' }}>
                    {taskStats.inProgress}
                  </h3>
                  <p className="text-muted mb-0 small">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaCheckCircle size={20} color="#10b981" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#10b981', fontSize: '1.5rem' }}>
                    {taskStats.completed}
                  </h3>
                  <p className="text-muted mb-0 small">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg">
          <div
            className="card"
            style={{
              background: isDarkMode ? colors.surface : '#fff',
              border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
              borderRadius: '12px'
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaExclamationTriangle size={20} color="#ef4444" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{ color: '#ef4444', fontSize: '1.5rem' }}>
                    {taskStats.overdue}
                  </h3>
                  <p className="text-muted mb-0 small">Overdue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text" style={{ background: isDarkMode ? colors.surface : '#fff', border: `1px solid ${colors.border}` }}>
                <FaFilter color={colors.textMuted} />
              </span>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text" style={{ background: isDarkMode ? colors.surface : '#fff', border: `1px solid ${colors.border}` }}>
                <FaFilter color={colors.textMuted} />
              </span>
              <select
                className="form-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text" style={{ background: isDarkMode ? colors.surface : '#fff', border: `1px solid ${colors.border}` }}>
                <FaUserTie color={colors.textMuted} />
              </span>
              <select
                className="form-select"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Tasks</option>
                <option value="candidate-assigned">Assigned by Candidate</option>
                <option value="self-created">Self Created</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text" style={{ background: isDarkMode ? colors.surface : '#fff', border: `1px solid ${colors.border}` }}>
                <FaSort color={colors.textMuted} />
              </span>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: isDarkMode ? colors.surface : '#fff',
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Assigned Tasks Summary */}
      {tasks.filter(task => task.source === 'candidate-assigned').length > 0 && (
        <div className="alert alert-info d-flex align-items-center gap-3 mb-4" style={{
          background: isDarkMode ? `${colors.primary}15` : '#e3f2fd',
          border: `1px solid ${isDarkMode ? colors.primary : '#2196f3'}`,
          borderRadius: '12px',
          color: isDarkMode ? colors.text : '#1565c0'
        }}>
          <FaUserTie size={20} />
          <div>
            <strong>Candidate Assigned Tasks</strong>
            <p className="mb-0 small">
              You have {tasks.filter(task => task.source === 'candidate-assigned' && task.status !== 'completed').length} pending tasks 
              assigned by your candidate out of {tasks.filter(task => task.source === 'candidate-assigned').length} total.
            </p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div
        className="card"
        style={{
          background: isDarkMode ? colors.surface : '#fff',
          border: `1px solid ${isDarkMode ? colors.border : '#e9ecef'}`,
          borderRadius: '12px'
        }}
      >
        <div className="card-body p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaTasks size={48} className="text-muted mb-3 opacity-50" />
              <p className="text-muted mb-0">No tasks found. Create your first task!</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="list-group-item"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${colors.border}`,
                    padding: '1.25rem'
                  }}
                >
                  <div className="row align-items-center">
                    <div className="col-12 col-lg-6">
                      <div className="mb-2">
                        <h6 className="fw-bold mb-1" style={{ color: colors.text }}>{task.title}</h6>
                        <p className="text-muted small mb-2">{task.description}</p>
                        <div className="d-flex flex-wrap gap-2">
                          {getPriorityBadge(task.priority)}
                          {getCategoryBadge(task.category)}
                          {getStatusBadge(task.status)}
                          {getSourceBadge(task.source)}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-3">
                      <div className="small" style={{ color: colors.text }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FaUserTie size={12} />
                          <span>{task.assignedTo.name}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FaCalendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-3 text-lg-end mt-3 mt-lg-0">
                      <div className="d-flex gap-2 justify-content-lg-end">
                        {task.status !== 'completed' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(task._id, task.status === 'pending' ? 'in-progress' : 'completed')}
                              title={task.status === 'pending' ? 'Start Task' : 'Complete Task'}
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditTask(task)}
                            >
                              <FaEdit />
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                  {task.notes && (
                    <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${colors.border}` }}>
                      <small className="text-muted">
                        <strong>Notes:</strong> {task.notes}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
            setSelectedTask(null);
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
                  {selectedTask ? 'Edit Task' : 'Create New Task'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedTask(null);
                  }}
                ></button>
              </div>
              <form onSubmit={selectedTask ? handleUpdateTask : handleAddTask}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Task Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Description *</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Assign To *</label>
                      <select
                        className="form-select"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        <option value="">Select Agent</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                        {agents.length === 0 && (
                          <option value="" disabled>No agents available</option>
                        )}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Due Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dueDate"
                        value={formData.dueDate}
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
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Priority *</label>
                      <select
                        className="form-select"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Category *</label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        <option value="general">General</option>
                        <option value="outreach">Outreach</option>
                        <option value="social-media">Social Media</option>
                        <option value="research">Research</option>
                        <option value="materials">Materials</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold" style={{ color: colors.text }}>Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Additional notes or instructions..."
                        style={{
                          background: isDarkMode ? colors.surfaceHover : '#fff',
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
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedTask(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedTask ? 'Update Task' : 'Create Task'}
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

export default TaskManagement;
