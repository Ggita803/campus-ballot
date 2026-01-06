import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';

const statusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'ongoing') return { text: 'Ongoing', cls: 'bg-success' };
  if (s === 'upcoming') return { text: 'Upcoming', cls: 'bg-info' };
  if (s === 'completed') return { text: 'Completed', cls: 'bg-secondary' };
  if (s === 'pending' || s === 'pending_approval') return { text: 'Pending Approval', cls: 'bg-warning text-dark' };
  return { text: status || 'Unknown', cls: 'bg-light text-dark' };
};

const ElectionOversight = () => {
  const { isDarkMode, colors } = useTheme();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/elections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.elections)
          ? res.data.elections
          : [];
      setElections(list);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const approveElection = async (id) => {
    setBusyId(id);
    try {
      const token = localStorage.getItem('token');
      // Backend lacks a dedicated approve endpoint; we move status to ongoing as a placeholder.
      await axios.put(`/api/elections/${id}`, { status: 'ongoing' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchElections();
    } catch (err) {
      setError(err?.response?.data?.message || 'Approval failed');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const s = statusFilter;
    return (elections || []).filter((e) => {
      const titleMatch = !q || (e.title || '').toLowerCase().includes(q);
      const status = (e.status || '').toLowerCase();
      const statusMatch = s === 'all'
        ? true
        : s === 'pending'
          ? ['pending', 'pending_approval'].includes(status)
          : status === s;
      return titleMatch && statusMatch;
    });
  }, [elections, search, statusFilter]);

  const counts = useMemo(() => {
    const base = { total: elections.length, pending: 0, upcoming: 0, ongoing: 0, completed: 0 };
    elections.forEach(e => {
      const s = (e.status || '').toLowerCase();
      if (['pending', 'pending_approval'].includes(s)) base.pending += 1;
      else if (s === 'upcoming') base.upcoming += 1;
      else if (s === 'ongoing') base.ongoing += 1;
      else if (s === 'completed') base.completed += 1;
    });
    return base;
  }, [elections]);

  if (loading) return <div className="p-3">Loading elections...</div>;
  if (error) return <div className="alert alert-danger small mb-3">{error}</div>;

  return (
    <div className="container-fluid" style={{ color: colors.text }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: colors.text }}>Election Oversight</h3>
          <p className="text-muted mb-0 small">Review pending elections and act quickly.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchElections}>
          <i className="fa-solid fa-rotate-right me-1"></i>Refresh
        </button>
      </div>

      <div className="row g-2 mb-3">
        {[{
          label: 'Pending', value: counts.pending, icon: 'fa-hourglass-half', tone: '#f59e0b'
        }, {
          label: 'Upcoming', value: counts.upcoming, icon: 'fa-calendar-day', tone: '#3b82f6'
        }, {
          label: 'Ongoing', value: counts.ongoing, icon: 'fa-play', tone: '#10b981'
        }, {
          label: 'Completed', value: counts.completed, icon: 'fa-flag-checkered', tone: '#6b7280'
        }].map(card => (
          <div key={card.label} className="col-6 col-md-3">
            <div
              className="p-3 d-flex align-items-center gap-3"
              style={{
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fff',
                boxShadow: isDarkMode ? '0 8px 20px rgba(0,0,0,0.25)' : '0 8px 20px rgba(59,130,246,0.08)'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `${card.tone}20`,
                  color: card.tone,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
              <div>
                <div className="small text-muted">{card.label}</div>
                <div className="fw-bold" style={{ fontSize: '1.35rem', color: colors.text }}>{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ borderColor: colors.border, background: isDarkMode ? colors.surface : '#fff' }}>
        <div className="card-body">
          <div className="row g-2 align-items-center mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: isDarkMode ? colors.inputBg : '#fff', color: colors.text, borderColor: colors.border }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ background: isDarkMode ? colors.inputBg : '#fff', color: colors.text, borderColor: colors.border }}
              >
                <option value="pending">Pending Approval</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-muted py-4">No elections match your filters.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ background: isDarkMode ? colors.cardBg : '#f8f9fa' }}>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((election) => {
                    const badge = statusBadge(election.status);
                    return (
                      <tr key={election._id}>
                        <td>{election.title}</td>
                        <td><span className={`badge ${badge.cls}`}>{badge.text}</span></td>
                        <td>{election.startDate ? new Date(election.startDate).toLocaleString() : '—'}</td>
                        <td>{election.endDate ? new Date(election.endDate).toLocaleString() : '—'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              disabled={busyId === election._id}
                              onClick={() => approveElection(election._id)}
                            >
                              {busyId === election._id ? 'Working…' : 'Approve'}
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" disabled>Details</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionOversight;
