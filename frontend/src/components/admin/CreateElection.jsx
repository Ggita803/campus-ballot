import { useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function CreateElection({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [positions, setPositions] = useState([
    { name: "", seats: 1, method: "fptp" }
  ]);
  const [eligibilityType, setEligibilityType] = useState("all");
  const [faculties, setFaculties] = useState("");
  const [cohorts, setCohorts] = useState("");
  const [whitelistFile, setWhitelistFile] = useState(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [saveDraft, setSaveDraft] = useState(false);
  const [loading, setLoading] = useState(false);

  const timezone = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch(e){ return 'UTC'; }
  }, []);

  const addPosition = () => setPositions(prev => [...prev, { name: "", seats: 1, method: "fptp" }]);
  const removePosition = (idx) => setPositions(prev => prev.filter((_,i) => i !== idx));
  const updatePosition = (idx, field, value) => setPositions(prev => prev.map((p,i) => i===idx ? { ...p, [field]: value } : p));

  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve([]);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          // take first column as identifier (email or id)
          const values = lines.map(l => l.split(',')[0].trim());
          resolve(values);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const validate = async () => {
    if (!title) return 'Title is required';
    if (!startDate || !endDate) return 'Start and end date/time are required';
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e)) return 'Invalid date/time';
    if (e <= s) return 'End date/time must be after start date/time';
    if (!positions || positions.length === 0) return 'At least one position is required';
    const names = positions.map(p => (p.name || '').trim()).filter(Boolean);
    if (names.length !== positions.length) return 'All positions must have a name';
    const unique = new Set(names.map(n => n.toLowerCase()));
    if (unique.size !== names.length) return 'Position names must be unique';
    if (eligibilityType === 'csv' && !whitelistFile) return 'Please upload a whitelist CSV for CSV eligibility';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = await validate();
    if (error) return Swal.fire('Validation', error, 'warning');

    // parse whitelist if provided
    let whitelist = [];
    if (eligibilityType === 'csv' && whitelistFile) {
      try {
        whitelist = await parseCsvFile(whitelistFile);
      } catch (err) {
        console.error('CSV parse error', err);
        return Swal.fire('Error', 'Failed to parse CSV whitelist file', 'error');
      }
    }

    // Prepare summary for confirmation
    const summaryHtml = `
      <strong>${escapeHtml(title)}</strong><br/>
      <small class="text-muted">${escapeHtml(description || '')}</small><hr/>
      <div><strong>When:</strong> ${escapeHtml(startDate)} to ${escapeHtml(endDate)} (${escapeHtml(timezone)})</div>
      <div><strong>Positions:</strong> ${positions.map(p => escapeHtml(p.name)).join(', ')}</div>
      <div><strong>Eligibility:</strong> ${escapeHtml(eligibilityType)}</div>
      <div><strong>Auto-publish:</strong> ${autoPublish ? 'Yes' : 'No'}</div>
    `;

    const confirm = await Swal.fire({
      title: 'Create Election?',
      html: summaryHtml,
      showCancelButton: true,
      confirmButtonText: saveDraft ? 'Save Draft' : (autoPublish ? 'Create & Publish' : 'Create'),
      preConfirm: () => true
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        timezone,
        positions: positions.map(p => ({ name: p.name.trim(), seats: Number(p.seats) || 1, votingMethod: p.method })),
        eligibility: {
          type: eligibilityType,
          faculties: eligibilityType === 'faculty' ? faculties.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          cohorts: eligibilityType === 'cohort' ? cohorts.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          whitelist: whitelist.length ? whitelist : undefined
        },
        autoPublish: !!autoPublish,
        draft: !!saveDraft
      };

      await axios.post('/api/elections', payload, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire('Success', saveDraft ? 'Draft saved' : 'Election created', 'success');
      // reset form
      setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setPositions([{ name: '', seats: 1, method: 'fptp' }]);
      setEligibilityType('all'); setFaculties(''); setCohorts(''); setWhitelistFile(null); setAutoPublish(false); setSaveDraft(false);
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Create election failed', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to create election', 'error');
    } finally {
      setLoading(false);
    }
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3 fw-bold">Create New Election</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Election Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Short Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small">Start Date & Time</label>
            <input type="datetime-local" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label small">End Date & Time</label>
            <input type="datetime-local" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>

          <div className="col-12">
            <label className="form-label small">Positions</label>
            {positions.map((p, idx) => (
              <div key={idx} className="d-flex gap-2 mb-2">
                <input className="form-control" placeholder="Position name" value={p.name} onChange={e => updatePosition(idx, 'name', e.target.value)} />
                <input className="form-control" style={{maxWidth: '110px'}} type="number" min={1} value={p.seats} onChange={e => updatePosition(idx, 'seats', e.target.value)} />
                <select className="form-select" style={{maxWidth: '180px'}} value={p.method} onChange={e => updatePosition(idx, 'method', e.target.value)}>
                  <option value="fptp">First-past-the-post</option>
                  <option value="approval">Approval</option>
                  <option value="ranked">Ranked-choice</option>
                </select>
                <button type="button" className="btn btn-outline-danger" onClick={() => removePosition(idx)} disabled={positions.length === 1}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn btn-link p-0" onClick={addPosition}>+ Add position</button>
          </div>

          <div className="col-md-6">
            <label className="form-label small">Eligibility</label>
            <select className="form-select" value={eligibilityType} onChange={e => setEligibilityType(e.target.value)}>
              <option value="all">All registered students</option>
              <option value="faculty">Faculty / Department</option>
              <option value="cohort">Cohort / Year</option>
              <option value="csv">Whitelist CSV upload</option>
            </select>
          </div>
          {eligibilityType === 'faculty' && (
            <div className="col-md-6">
              <input className="form-control" placeholder="Faculties, comma separated" value={faculties} onChange={e => setFaculties(e.target.value)} />
            </div>
          )}
          {eligibilityType === 'cohort' && (
            <div className="col-md-6">
              <input className="form-control" placeholder="Cohorts (e.g., 2024,2023)" value={cohorts} onChange={e => setCohorts(e.target.value)} />
            </div>
          )}
          {eligibilityType === 'csv' && (
            <div className="col-12">
              <input type="file" accept=".csv,text/csv" className="form-control" onChange={e => setWhitelistFile(e.target.files?.[0] || null)} />
            </div>
          )}

          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check me-3">
              <input id="autoPublish" className="form-check-input" type="checkbox" checked={autoPublish} onChange={e => setAutoPublish(e.target.checked)} />
              <label className="form-check-label" htmlFor="autoPublish">Auto-publish results</label>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <div className="form-check me-3">
              <input id="saveDraft" className="form-check-input" type="checkbox" checked={saveDraft} onChange={e => setSaveDraft(e.target.checked)} />
              <label className="form-check-label" htmlFor="saveDraft">Save as draft</label>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-muted small">Timezone: {timezone}</div>
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => {
                setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setPositions([{ name: '', seats: 1, method: 'fptp' }]);
                setEligibilityType('all'); setFaculties(''); setCohorts(''); setWhitelistFile(null); setAutoPublish(false); setSaveDraft(false);
              }}>Reset</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (saveDraft ? 'Save Draft' : (autoPublish ? 'Create & Publish' : 'Create'))}</button>
            </div>
          </div>
        </form>

        {/* Preview removed per request */}
      </div>
    </div>
  );
}

export default CreateElection;