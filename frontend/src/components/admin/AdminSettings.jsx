import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faFileImport,
  faDatabase,
  faShieldAlt,
  faEnvelope,
  faBell,
  faClipboardList,
  faHistory,
  faDownload,
  faUpload,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedTable from '../common/ThemedTable';

function SectionCard({ id, title, children, onSave, onSaveDraft, saving }) {
  return (
    <div id={id} className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="mb-3 mt-3">{children}</div>
        <div className="d-flex gap-2">
          {onSaveDraft && (
            <button className="btn btn-outline-secondary" onClick={onSaveDraft} disabled={saving}>{saving ? 'Saving...' : 'Save draft'}</button>
          )}
          {onSave && (
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save & Apply'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings({ user }) {
  const [saving, setSaving] = useState(false);
  const importProgressTimerRef = useRef(null);
  const importFileInputRef = useRef(null);

  // General
  const [siteName, setSiteName] = useState('Campus Ballot');
  const [siteLogo, setSiteLogo] = useState('');
  
  // Profile editing fields
  const [displayName, setDisplayName] = useState(user?.name || 'Admin');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'admin@example.com');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Reason for change (used for audit metadata when persisting)
  const [changeReason, setChangeReason] = useState('');

  // Authentication
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  // Email (placeholder only)
  const [smtpHost, setSmtpHost] = useState('smtp.example.com');
  const [smtpPort, setSmtpPort] = useState(587);

  // Notifications
  const [notifyOnVote, setNotifyOnVote] = useState(true);

  // Backup & retention
  const [backupSchedule, setBackupSchedule] = useState('daily'); // daily|weekly|monthly
  const [retentionDays, setRetentionDays] = useState(30);
  const [lastBackupAt, setLastBackupAt] = useState(null);

  // Bulk User Import
  const [importFile, setImportFile] = useState(null);
  const [importValidation, setImportValidation] = useState(null);
  const [importStep, setImportStep] = useState('upload'); // upload | validate | import | done
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [sendWelcomeEmails, setSendWelcomeEmails] = useState(true);
  const [importResult, setImportResult] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importProgressText, setImportProgressText] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const [isDragOverImport, setIsDragOverImport] = useState(false);

  // RBAC / MFA enforcement
  const [enforceMfa, setEnforceMfa] = useState(false);
  const [mfaGraceDays, setMfaGraceDays] = useState(7);

  const { colors } = useTheme();
  const isImportInProgress = importStep === 'import' && importBusy;
  const mutedTextColor = colors.textSecondary || colors.textMuted || colors.text;
  const surfaceColor = colors.surface || colors.cardBg || colors.inputBg || colors.background;
  const elevatedSurfaceColor = colors.inputBg || colors.cardBg || colors.surface || colors.background;
  const resolvedBorderColor = colors.border || colors.inputBorder || 'rgba(13, 110, 253, 0.16)';

  const openImportFilePicker = async () => {
    console.log('[IMPORT DEBUG] Choose File clicked', {
      importStep,
      saving,
      importBusy,
      isImportInProgress,
      hasInputRef: Boolean(importFileInputRef.current)
    });

    if (!importFileInputRef.current) {
      console.warn('[IMPORT DEBUG] File input ref is not available');
      return;
    }

    try {
      if (typeof importFileInputRef.current.showPicker === 'function') {
        await importFileInputRef.current.showPicker();
        console.log('[IMPORT DEBUG] showPicker() opened file picker');
      } else {
        importFileInputRef.current.click();
        console.log('[IMPORT DEBUG] Programmatic click fired on file input');
      }
    } catch (err) {
      console.error('[IMPORT DEBUG] Programmatic file input click failed', err);
      Swal.fire(
        'File picker blocked',
        'Your browser/preview may be blocking file dialogs. You can drag and drop the file into the upload box instead.',
        'warning'
      );
    }
  };

  // load settings from backend when available
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
        const s = res.data || {};
        if (!mounted) return;
        if (s.general) {
          setSiteName(s.general.siteName || siteName);
          setSiteLogo(s.general.siteLogo || siteLogo);
        }
        if (s.email) {
          setSmtpHost(s.email.smtpHost || smtpHost);
          setSmtpPort(s.email.smtpPort || smtpPort);
        }
        if (s.notifications) setNotifyOnVote(Boolean(s.notifications.notifyOnVote));
        if (s.security) {
          setEnforceMfa(Boolean(s.security.enforceMfa));
          setMfaGraceDays(Number(s.security.mfaGraceDays) || mfaGraceDays);
        }
      } catch (err) {
        // silently ignore; frontend has fallbacks
        console.log('Could not load settings from backend', err?.message || err);
      }
    };
    load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup import progress timer on unmount
  useEffect(() => {
    return () => {
      if (importProgressTimerRef.current) {
        clearInterval(importProgressTimerRef.current);
        importProgressTimerRef.current = null;
      }
    };
  }, []);

  // Debug important import states when troubleshooting file picker issues
  useEffect(() => {
    console.log('[IMPORT DEBUG] State changed', {
      importStep,
      saving,
      importBusy,
      isImportInProgress,
      selectedFile: importFile?.name || null
    });
  }, [importStep, saving, importBusy, isImportInProgress, importFile]);

  const stopImportAnimation = (reset = false) => {
    if (importProgressTimerRef.current) {
      clearInterval(importProgressTimerRef.current);
      importProgressTimerRef.current = null;
    }
    if (reset) {
      setImportProgress(0);
      setImportProgressText('');
    }
  };

  const startImportAnimation = () => {
    stopImportAnimation();
    let progress = 8;
    setImportProgress(progress);
    setImportProgressText('Uploading file to server...');

    importProgressTimerRef.current = setInterval(() => {
      progress = Math.min(progress + Math.floor(Math.random() * 8) + 2, 92);
      setImportProgress(progress);

      if (progress < 35) {
        setImportProgressText('Uploading file to server...');
      } else if (progress < 70) {
        setImportProgressText('Validating and preparing records...');
      } else {
        setImportProgressText('Creating user accounts...');
      }
    }, 320);
  };

  const completeImportAnimation = async () => {
    stopImportAnimation();
    setImportProgress(100);
    setImportProgressText('Finalizing import...');
    await new Promise((r) => setTimeout(r, 450));
  };

  // scroll + flash helper + toast
  const scrollToSection = (id, label) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // flash highlight
    el.classList.add('cb-flash');
    setTimeout(() => el.classList.remove('cb-flash'), 1400);
    // show small toast with the section name
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: label || id,
      showConfirmButton: false,
      timer: 1200,
      timerProgressBar: true
    });
  };

  const saveGeneral = async () => {
    setSaving(true);
    try {
      // attach reason metadata to the request in future
      console.log('Save general', { siteName, siteLogo, reason: changeReason });
      // Try to call backend; fall back to simulated save if endpoint missing
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/general', { siteName, siteLogo, meta: { reason: changeReason } }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'General settings saved.', 'success');
      } catch {
        // graceful fallback: simulate save
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'General settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save general settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveAuth = async () => {
    setSaving(true);
    try {
      console.log('Save auth', { allowRegistration, requireEmailVerification });
      await new Promise(r => setTimeout(r, 600));
      Swal.fire('Saved', 'Authentication settings saved (local only).', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save authentication settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    setSaving(true);
    try {
      console.log('Save email', { smtpHost, smtpPort, reason: changeReason });
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/email', { smtpHost, smtpPort, meta: { reason: changeReason } }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'Email settings saved.', 'success');
      } catch {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'Email settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save email settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      console.log('Save notifications', { notifyOnVote, reason: changeReason });
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/notifications', { notifyOnVote, meta: { reason: changeReason } }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'Notification settings saved.', 'success');
      } catch {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'Notification settings saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save profile edits (client-side with backend attempt)
  const saveProfile = async () => {
    setSaving(true);
    try {
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/profile', { name: displayName, email: profileEmail, phone: phoneNumber, avatar: avatarUrl }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'Profile updated.', 'success');
      } catch {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'Profile saved locally. Backend persistence not available.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP connection (best-effort)
  const testSmtp = async () => {
    setSaving(true);
    try {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/admin/settings/test-smtp', { host: smtpHost, port: smtpPort }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('SMTP Test', `Result: ${res.data?.message || 'OK'}`, 'success');
      } catch {
        // fallback: simulate a test with explanation
        await new Promise(r => setTimeout(r, 700));
        Swal.fire('SMTP Test (simulated)', 'No backend test endpoint; please connect backend to run live tests.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'SMTP test failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Backup actions
  const runBackupNow = async () => {
    setSaving(true);
    try {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/admin/backup', { type: 'manual' }, { headers: { Authorization: `Bearer ${token}` } });
        setLastBackupAt(new Date().toISOString());
        Swal.fire('Backup started', res.data?.message || 'Backup job queued', 'success');
      } catch {
        // simulate
        await new Promise(r => setTimeout(r, 700));
        setLastBackupAt(new Date().toISOString());
        Swal.fire('Backup (simulated)', 'Backup simulated locally. Connect backend for real backups.', 'info');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to start backup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testRestore = async () => {
    const confirmed = await Swal.fire({
      title: 'Test restore',
      html: 'This will simulate a restore to an isolated sandbox. No production data will be affected.',
      showCancelButton: true,
      confirmButtonText: 'Run test'
    });
    if (!confirmed.isConfirmed) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      Swal.fire('Restore test', 'Restore simulation completed (no changes made).', 'success');
    } catch {
      Swal.fire('Error', 'Restore test failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Download import template
  const downloadTemplate = async (format = 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/users/bulk-template?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_import_template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download error:', err);
      Swal.fire('Error', 'Failed to download template', 'error');
    }
  };

  // Handle file selection for bulk import
  const handleImportFile = (file) => {
    console.log('[IMPORT DEBUG] handleImportFile called', {
      hasFile: Boolean(file),
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    if (!file) return;
    setImportFile(file);
    setImportValidation(null);
    setImportResult(null);
    setImportStep('upload');
  };

  const handleImportDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverImport(false);

    if (isImportInProgress) return;

    const droppedFile = e.dataTransfer?.files?.[0];
    console.log('[IMPORT DEBUG] File dropped', {
      hasFile: Boolean(droppedFile),
      fileName: droppedFile?.name || null,
      fileType: droppedFile?.type || null,
      fileSize: droppedFile?.size || null
    });

    if (!droppedFile) return;

    const validExt = /\.(csv|xlsx|xls)$/i.test(droppedFile.name || '');
    if (!validExt) {
      Swal.fire('Invalid file', 'Please drop a CSV or Excel file (.csv, .xlsx, .xls).', 'warning');
      return;
    }

    handleImportFile(droppedFile);
  };

  // Validate the uploaded file
  const validateImportFile = async () => {
    if (!importFile) {
      Swal.fire('No file', 'Please choose a CSV or Excel file first', 'warning');
      return;
    }
    setSaving(true);
    setImportBusy(true);
    setImportStep('validate');
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', importFile);
      const res = await axios.post('/api/admin/users/bulk-validate', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setImportValidation(res.data);
      if (res.data.validRows > 0) {
        Swal.fire('Validation Complete', `${res.data.validRows} valid rows, ${res.data.invalidRows} invalid rows`, res.data.invalidRows > 0 ? 'warning' : 'success');
      } else {
        Swal.fire('Validation Failed', 'No valid rows found in the file', 'error');
      }
    } catch (err) {
      console.error('Validation error:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to validate file', 'error');
      setImportStep('upload');
    } finally {
      setImportBusy(false);
      setSaving(false);
    }
  };

  // Import users from validated file
  const importUsers = async () => {
    if (!importFile) {
      Swal.fire('No file', 'Please upload and validate a file first', 'warning');
      return;
    }
    
    const confirmed = await Swal.fire({
      title: 'Confirm Import',
      html: `<p>You are about to import <strong>${importValidation?.validRows || 0}</strong> users.</p>
             <p>${skipDuplicates ? 'Duplicates will be skipped.' : 'Duplicates will cause errors.'}</p>
             <p>${sendWelcomeEmails ? '<strong>Welcome emails with credentials will be sent.</strong>' : 'No welcome emails will be sent.'}</p>
             <p>This action cannot be undone. Continue?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Import Users',
      cancelButtonText: 'Cancel'
    });
    
    if (!confirmed.isConfirmed) return;
    
    setSaving(true);
    setImportBusy(true);
    setImportStep('import');
    startImportAnimation();
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', importFile);
      form.append('skipDuplicates', String(skipDuplicates));
      form.append('sendWelcomeEmail', String(sendWelcomeEmails));
      
      const res = await axios.post('/api/admin/users/bulk-import', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      await completeImportAnimation();
      
      setImportResult(res.data);
      setImportStep('done');
      
      const emailInfo = res.data.emailsSent > 0 
        ? `<p>📧 ${res.data.emailsSent} welcome emails sent${res.data.emailsFailed > 0 ? `, ${res.data.emailsFailed} failed` : ''}</p>`
        : '';
      
      // Show error details if any failures
      const errorDetails = res.data.errors?.length > 0
        ? `<details style="text-align:left;margin-top:10px"><summary style="cursor:pointer;color:#dc3545">View ${res.data.errors.length} error(s)</summary><ul style="max-height:200px;overflow-y:auto;font-size:0.85em">${res.data.errors.slice(0, 20).map(e => `<li style="color:#dc3545">${e}</li>`).join('')}${res.data.errors.length > 20 ? '<li>...and more</li>' : ''}</ul></details>`
        : '';
      
      Swal.fire({
        title: 'Import Complete!',
        html: `<p><strong>${res.data.imported}</strong> users imported successfully</p>
               <p>${res.data.skipped > 0 ? `${res.data.skipped} skipped (duplicates)` : ''}</p>
               <p>${res.data.failed > 0 ? `<span style="color:#dc3545">${res.data.failed} failed</span>` : ''}</p>
               ${emailInfo}
               ${errorDetails}`,
        icon: res.data.failed > 0 ? 'warning' : 'success',
        width: res.data.errors?.length > 0 ? '600px' : undefined
      });
    } catch (err) {
      console.error('Import error:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to import users', 'error');
      stopImportAnimation(true);
      setImportStep('validate');
    } finally {
      stopImportAnimation();
      setImportBusy(false);
      setSaving(false);
    }
  };

  // Reset import state
  const resetImport = () => {
    stopImportAnimation(true);
    setImportFile(null);
    setImportValidation(null);
    setImportResult(null);
    setImportStep('upload');
    setImportBusy(false);
  };

  // RBAC / MFA enforcement
  const saveRbacMfa = async () => {
    setSaving(true);
    try {
      // backend stub
      try {
        const token = localStorage.getItem('token');
        await axios.put('/api/admin/settings/security', { enforceMfa, mfaGraceDays }, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Saved', 'RBAC/MFA settings saved.', 'success');
      } catch {
        await new Promise(r => setTimeout(r, 500));
        Swal.fire('Saved (local)', 'RBAC/MFA settings saved locally. Backend persistence not available.', 'info');
      }
    } catch {
      Swal.fire('Error', 'Failed to save RBAC/MFA settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const stepState = {
    upload: importStep === 'upload',
    validate: importStep === 'validate',
    import: importStep === 'import',
    done: importStep === 'done'
  };

  const bulkImportPanel = (
    <div id="bulk-import" className="card mb-4 border-0 bulk-import-shell">
      <div className="card-body p-0">
        <div className="bulk-import-hero p-4 p-lg-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-start">
            <div className="d-flex gap-3 align-items-start">
              <div className="bulk-import-icon-wrap">
                <FontAwesomeIcon icon={faFileImport} />
              </div>
              <div>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                  <h5 className="mb-0">Bulk User Import</h5>
                  <span className="badge bulk-import-badge">Priority Workflow</span>
                </div>
                <p className="mb-2 text-muted">
                  Import multiple students from CSV or Excel, validate them before creation, and review failures in one place.
                </p>
                <div className="small d-flex flex-wrap gap-3 text-muted">
                  <span><strong>Required:</strong> email, studentId, organization</span>
                  <span><strong>Formats:</strong> .csv, .xlsx, .xls</span>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-light btn-sm bulk-download-btn" onClick={() => downloadTemplate('csv')} title="Download CSV Template">
                <FontAwesomeIcon icon={faDownload} className="me-1" />CSV Template
              </button>
              <button className="btn btn-light btn-sm bulk-download-btn" onClick={() => downloadTemplate('xlsx')} title="Download Excel Template">
                <FontAwesomeIcon icon={faDownload} className="me-1" />Excel Template
              </button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <span className={`bulk-step-pill ${stepState.upload ? 'active' : importFile ? 'complete' : ''}`}>1. Choose file</span>
            <span className={`bulk-step-pill ${stepState.validate ? 'active' : importValidation ? 'complete' : ''}`}>2. Validate</span>
            <span className={`bulk-step-pill ${stepState.import ? 'active' : importResult ? 'complete' : ''}`}>3. Import</span>
            <span className={`bulk-step-pill ${stepState.done ? 'active complete' : ''}`}>4. Review</span>
          </div>
        </div>

        <div className="p-4">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-xl-7">
              <label className="form-label fw-semibold">Upload CSV or Excel file</label>
              <div
                className={`bulk-dropzone ${isDragOverImport ? 'dragover' : ''} ${isImportInProgress ? 'disabled' : ''}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (!isImportInProgress) setIsDragOverImport(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isImportInProgress) setIsDragOverImport(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOverImport(false);
                }}
                onDrop={handleImportDrop}
              >
                <div className="bulk-dropzone-inner">
                  <div className="bulk-import-icon-wrap bulk-import-icon-wrap-large">
                    <FontAwesomeIcon icon={faFileImport} />
                  </div>
                  <div>
                    <div className="fw-semibold mb-1">Drop file here or choose one manually</div>
                    <div className="small text-muted mb-3">Chrome can block file dialogs in embedded previews, so drag and drop remains available.</div>
                  </div>
                  <div className="d-flex gap-2 align-items-center flex-wrap justify-content-center">
                    <button
                      type="button"
                      className="btn btn-primary bulk-primary-btn"
                      onClick={openImportFilePicker}
                      disabled={isImportInProgress}
                    >
                      <FontAwesomeIcon icon={faUpload} className="me-2" />Choose File
                    </button>
                    <small className="text-muted">Accepted: .csv, .xlsx, .xls</small>
                  </div>
                </div>
              </div>

              <input
                ref={importFileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="form-control mt-3"
                onClick={() => {
                  console.log(
                    '[IMPORT DEBUG] Native file input clicked',
                    `disabled=${isImportInProgress}`,
                    `importStep=${importStep}`,
                    `saving=${saving}`,
                    `importBusy=${importBusy}`
                  );
                }}
                onFocus={() => {
                  console.log('[IMPORT DEBUG] File input focused');
                }}
                onChange={(e) => {
                  const selected = e.target.files && e.target.files[0];
                  console.log('[IMPORT DEBUG] Native file input changed', {
                    selected: Boolean(selected),
                    fileName: selected?.name || null
                  });
                  handleImportFile(selected);
                }}
                disabled={isImportInProgress}
              />

              {importFile && (
                <div className="bulk-selected-file mt-3">
                  <div>
                    <div className="fw-semibold">{importFile.name}</div>
                    <div className="small text-muted">{(importFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">Ready</span>
                </div>
              )}

              {importStep === 'import' && !saving && (
                <div className="small mt-3 text-warning">
                  Import state is still marked as running. Click <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={resetImport}>reset import</button> to unlock file selection.
                </div>
              )}
            </div>

            <div className="col-12 col-xl-5">
              <div className="bulk-side-panel">
                <div className="fw-semibold mb-3">Import Options</div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={skipDuplicates}
                    id="skipDuplicates"
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    disabled={isImportInProgress}
                  />
                  <label className="form-check-label" htmlFor="skipDuplicates">
                    Skip duplicate emails and student IDs
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={sendWelcomeEmails}
                    id="sendWelcomeEmails"
                    onChange={(e) => setSendWelcomeEmails(e.target.checked)}
                    disabled={isImportInProgress}
                  />
                  <label className="form-check-label" htmlFor="sendWelcomeEmails">
                    Send welcome emails with login credentials
                  </label>
                </div>

                <div className="bulk-help-copy small text-muted">
                  <div><strong>Required columns:</strong> name, email, role</div>
                  <div><strong>For students:</strong> studentId, faculty, course, yearOfStudy, gender</div>
                  <div><strong>Optional:</strong> phone, department, password</div>
                </div>

                <div className="d-flex gap-2 flex-wrap mt-4">
                  {importStep === 'upload' && (
                    <button
                      className="btn btn-primary bulk-primary-btn"
                      onClick={validateImportFile}
                      disabled={!importFile || saving}
                    >
                      {saving ? 'Validating...' : 'Validate File'}
                    </button>
                  )}
                  {importStep === 'validate' && importValidation?.validRows > 0 && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={importUsers}
                        disabled={saving}
                      >
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        {saving ? 'Importing...' : `Import ${importValidation.validRows} Users`}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={resetImport}
                        disabled={saving}
                      >
                        Reset
                      </button>
                    </>
                  )}
                  {importStep === 'done' && (
                    <button className="btn btn-outline-primary" onClick={resetImport}>
                      Import More Users
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {importStep === 'import' && (
            <div className="mb-3 mt-4 p-3 rounded import-progress-card" role="status" aria-live="polite">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="import-spinner" aria-hidden="true" />
                  <div>
                    <div className="fw-bold" style={{ color: '#0d6efd' }}>Importing users...</div>
                    <div className="small text-muted">{importProgressText || 'Working on your upload...'}</div>
                  </div>
                </div>
                <div className="fw-bold" style={{ color: '#0d6efd' }}>{importProgress}%</div>
              </div>
              <div className="import-progress-track mt-3">
                <div className="import-progress-fill" style={{ width: `${importProgress}%` }} />
              </div>
            </div>
          )}

          {importValidation && (
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: surfaceColor, border: `1px solid ${resolvedBorderColor}` }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Validation Results</span>
                <span className="badge bg-secondary">{importValidation.totalRows} rows</span>
              </div>
              <div className="d-flex gap-4 mb-2 flex-wrap">
                <span className="text-success">
                  <FontAwesomeIcon icon={faCheck} className="me-1" />
                  {importValidation.validRows} valid
                </span>
                <span className={importValidation.invalidRows > 0 ? 'text-danger' : 'text-muted'}>
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  {importValidation.invalidRows} invalid
                </span>
                {importValidation.duplicateEmails?.length > 0 && (
                  <span className="text-warning">
                    {importValidation.duplicateEmails.length} duplicate emails
                  </span>
                )}
              </div>

              {importValidation.preview && importValidation.preview.length > 0 && (
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  <ThemedTable size="sm" striped hover bordered>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: surfaceColor, zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Row</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Email</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Student ID</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Name</th>
                        <th style={{ padding: '0.4rem', color: colors.text }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importValidation.preview.slice(0, 20).map(p => (
                        <tr key={p.row}>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.row}</td>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.email}</td>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.studentId || '-'}</td>
                          <td style={{ padding: '0.4rem', color: colors.text }}>{p.name || <span className="text-muted">(auto)</span>}</td>
                          <td style={{ padding: '0.4rem' }}>
                            {p.valid ? (
                              <span className="badge bg-success">Valid</span>
                            ) : (
                              <span className="badge bg-danger" title={p.errors?.join(', ')}>Invalid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ThemedTable>
                </div>
              )}

              {importValidation.errors && importValidation.errors.length > 0 && (
                <div className="mt-2">
                  <details>
                    <summary className="text-danger small" style={{ cursor: 'pointer' }}>
                      View {importValidation.errors.length} error(s)
                    </summary>
                    <ul className="small mt-1 mb-0" style={{ maxHeight: 150, overflowY: 'auto' }}>
                      {importValidation.errors.slice(0, 20).map((err, i) => (
                        <li key={i} className="text-danger">{err}</li>
                      ))}
                      {importValidation.errors.length > 20 && (
                        <li className="text-muted">...and {importValidation.errors.length - 20} more</li>
                      )}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className={`mb-3 p-3 rounded border ${importResult.failed > 0 ? 'border-warning' : 'border-success'}`} style={{ backgroundColor: importResult.failed > 0 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(25, 135, 84, 0.1)' }}>
              <div className={`fw-bold ${importResult.failed > 0 ? 'text-warning' : 'text-success'} mb-2`}>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Import Completed
              </div>
              <div className="d-flex gap-4 mb-2 flex-wrap">
                <span><strong>{importResult.imported}</strong> imported</span>
                {importResult.skipped > 0 && <span className="text-warning"><strong>{importResult.skipped}</strong> skipped</span>}
                {importResult.failed > 0 && <span className="text-danger"><strong>{importResult.failed}</strong> failed</span>}
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-danger small" style={{ cursor: 'pointer' }}>
                    View {importResult.errors.length} error(s)
                  </summary>
                  <ul className="small mt-1 mb-0" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {importResult.errors.slice(0, 30).map((err, i) => (
                      <li key={i} className="text-danger">{err}</li>
                    ))}
                    {importResult.errors.length > 30 && (
                      <li className="text-muted">...and {importResult.errors.length - 30} more</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="container-fluid py-4 px-2 px-md-3"
      style={{
        background: colors.background,
        color: colors.text,
        '--bulk-text': colors.text,
        '--bulk-muted': mutedTextColor,
        '--bulk-surface': surfaceColor,
        '--bulk-surface-elevated': elevatedSurfaceColor,
        '--bulk-border': resolvedBorderColor,
        '--bulk-drop-bg': elevatedSurfaceColor,
        '--bulk-drop-bg-active': surfaceColor,
        '--bulk-success-soft': 'rgba(25, 135, 84, 0.10)'
      }}
    >
      <style>{`
        /* Quick visual flash when navigating via quick actions */
        .cb-flash{ animation: cbFlash 1.4s ease-in-out; }
        @keyframes cbFlash{ 0%{ box-shadow: 0 0 0 0 rgba(59,130,246,0.0); } 10%{ box-shadow: 0 0 0 6px rgba(59,130,246,0.12); } 60%{ box-shadow: 0 0 0 6px rgba(59,130,246,0.06); } 100%{ box-shadow: none; } }

        /* Quick actions layout & button variants */
        .admin-quick-actions { gap: .5rem; }
        /* make quick actions start from left rather than right */
        .admin-quick-actions.justify-start { justify-content: flex-start; }

        .qa-btn { transition: transform .12s ease, box-shadow .12s ease; border-width:1px; }
        .qa-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
        .qa-btn:hover { transform: translateY(-3px); }

        /* color variants (outline buttons with colored accents) */
        .qa-primary { color: #0d6efd; border-color: rgba(13,110,253,0.22); background: rgba(13,110,253,0.03); }
        .qa-success { color: #198754; border-color: rgba(25,135,84,0.16); background: rgba(25,135,84,0.03); }
        .qa-warning { color: #ff8800; border-color: rgba(255,136,0,0.12); background: rgba(255,136,0,0.02); }
        .qa-danger { color: #dc3545; border-color: rgba(220,53,69,0.12); background: rgba(220,53,69,0.02); }
        .qa-info { color: #0dcaf0; border-color: rgba(13,202,240,0.12); background: rgba(13,202,240,0.02); }
        .qa-muted { color: #6c757d; border-color: rgba(108,117,125,0.06); background: rgba(108,117,125,0.01); }
        .qa-indigo { color: #6f42c1; border-color: rgba(111,66,193,0.08); background: rgba(111,66,193,0.02); }

        /* ensure icons align and consistent width */
        .qa-btn .svg-inline--fa { width: 16px; height: 16px; }

        /* Make quick-actions sticky on tall screens (handled by layout right column) */
        @media (min-width: 992px){
          .admin-quick-actions { position: sticky; top: 120px; }
        }

        /* Bulk import progress animation (solid primary blue) */
        .import-progress-card {
          border: 1px solid #0d6efd;
          background: rgba(13, 110, 253, 0.06);
        }
        .import-spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(13, 110, 253, 0.24);
          border-top-color: #0d6efd;
          border-radius: 50%;
          animation: importSpin 0.8s linear infinite;
        }
        .import-progress-track {
          width: 100%;
          height: 10px;
          border-radius: 999px;
          background: rgba(13, 110, 253, 0.18);
          overflow: hidden;
        }
        .import-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: #0d6efd;
          box-shadow: 0 0 10px rgba(13, 110, 253, 0.45);
          transition: width 0.28s ease;
        }
        .bulk-import-shell {
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(13, 110, 253, 0.08);
          background: var(--bulk-surface);
          color: var(--bulk-text);
        }
        .bulk-import-hero {
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.16), rgba(13, 202, 240, 0.07));
          border-bottom: 1px solid rgba(13, 110, 253, 0.12);
        }
        .bulk-import-icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #0d6efd;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.25);
          flex-shrink: 0;
        }
        .bulk-import-icon-wrap-large {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          margin: 0 auto 1rem;
        }
        .bulk-import-badge {
          background: rgba(13, 110, 253, 0.12);
          color: #0d6efd;
          border: 1px solid rgba(13, 110, 253, 0.18);
        }
        .bulk-download-btn {
          border-color: var(--bulk-border);
          background: var(--bulk-surface-elevated);
          color: var(--bulk-text);
        }
        .bulk-step-pill {
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          background: rgba(13, 110, 253, 0.06);
          color: var(--bulk-muted);
          font-size: 0.84rem;
          border: 1px solid rgba(13, 110, 253, 0.08);
        }
        .bulk-step-pill.active {
          background: #0d6efd;
          color: #fff;
          border-color: #0d6efd;
        }
        .bulk-step-pill.complete {
          box-shadow: inset 0 0 0 1px rgba(25, 135, 84, 0.25);
        }
        .bulk-dropzone {
          border: 1px dashed var(--bulk-border);
          border-radius: 18px;
          background: linear-gradient(180deg, var(--bulk-drop-bg), rgba(13, 110, 253, 0.03));
          padding: 1rem;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }
        .bulk-dropzone.dragover {
          border-color: #0d6efd;
          background: linear-gradient(180deg, var(--bulk-drop-bg-active), rgba(13, 110, 253, 0.09));
          transform: translateY(-1px);
        }
        .bulk-dropzone.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .bulk-dropzone-inner {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .bulk-primary-btn {
          box-shadow: 0 10px 24px rgba(13, 110, 253, 0.2);
        }
        .bulk-side-panel {
          height: 100%;
          border: 1px solid var(--bulk-border);
          border-radius: 18px;
          background: var(--bulk-surface-elevated);
          padding: 1rem;
        }
        .bulk-import-shell h5,
        .bulk-import-shell .form-label,
        .bulk-import-shell .fw-semibold,
        .bulk-import-shell .form-check-label,
        .bulk-import-shell .bulk-download-btn,
        .bulk-import-shell .bulk-dropzone {
          color: var(--bulk-text);
        }
        .bulk-import-shell .text-muted,
        .bulk-import-shell small,
        .bulk-help-copy {
          color: var(--bulk-muted) !important;
        }
        .bulk-import-shell .form-control,
        .bulk-import-shell .form-select {
          background: var(--bulk-surface-elevated);
          border-color: var(--bulk-border);
          color: var(--bulk-text);
        }
        .bulk-import-shell .form-control:focus,
        .bulk-import-shell .form-select:focus {
          background: var(--bulk-surface-elevated);
          color: var(--bulk-text);
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.18);
        }
        .bulk-import-shell .form-check-input {
          background-color: var(--bulk-surface);
          border-color: var(--bulk-border);
        }
        .bulk-help-copy > div + div {
          margin-top: 0.5rem;
        }
        .bulk-selected-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          border: 1px solid rgba(25, 135, 84, 0.22);
          border-radius: 14px;
          background: var(--bulk-success-soft);
          padding: 0.9rem 1rem;
        }
        @keyframes importSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="mb-3">
        <div>
          <h3 className="mb-1">System Settings</h3>
          <p className="text-muted mb-2">Configure global settings for Campus Ballot. These are local UI controls — connect these to backend endpoints to persist.</p>
        </div>
        <div className="d-flex flex-row flex-wrap gap-2 admin-quick-actions justify-start align-items-center">
          <button className="btn btn-sm qa-btn qa-success d-flex align-items-center" onClick={() => scrollToSection('bulk-import','Bulk Import')} aria-label="Bulk User Import">
            <FontAwesomeIcon icon={faFileImport} className="me-2" />Bulk Import
          </button>
          <button className="btn btn-sm qa-btn qa-primary d-flex align-items-center" onClick={() => scrollToSection('profile','Profile')} aria-label="Edit profile">
            <FontAwesomeIcon icon={faUser} className="me-2" />Profile
          </button>
          <button className="btn btn-sm qa-btn qa-warning d-flex align-items-center" onClick={() => scrollToSection('backup','Backups')} aria-label="Backups">
            <FontAwesomeIcon icon={faDatabase} className="me-2" />Backups
          </button>
          <button className="btn btn-sm qa-btn qa-danger d-flex align-items-center" onClick={() => scrollToSection('rbac','RBAC & MFA')} aria-label="RBAC and MFA">
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />RBAC & MFA
          </button>
          <button className="btn btn-sm qa-btn qa-indigo d-flex align-items-center" onClick={() => scrollToSection('email','SMTP / Email')} aria-label="SMTP and Email">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />SMTP / Email
          </button>
          <button className="btn btn-sm qa-btn qa-info d-flex align-items-center" onClick={() => scrollToSection('notifications','Notifications')} aria-label="Notifications">
            <FontAwesomeIcon icon={faBell} className="me-2" />Notifications
          </button>
          <button className="btn btn-sm qa-btn qa-muted d-flex align-items-center" onClick={() => scrollToSection('audit','Audit Logs')} aria-label="Audit logs">
            <FontAwesomeIcon icon={faClipboardList} className="me-2" />Audit Logs
          </button>
          <button className="btn btn-sm qa-btn qa-muted d-flex align-items-center" onClick={() => scrollToSection('settings-history','Settings History')} aria-label="Settings history">
            <FontAwesomeIcon icon={faHistory} className="me-2" />History
          </button>
        </div>
      </div>

      {bulkImportPanel}

  {/* Profile section */}
  <SectionCard id="profile" title="Profile" onSave={saveProfile} onSaveDraft={async () => { Swal.fire('Saved draft', 'Profile draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label" style={{ color: colors.text }}>Display name</label>
          <input 
            className="form-control" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ color: colors.text }}>Email</label>
          <input 
            className="form-control" 
            value={profileEmail} 
            onChange={(e) => setProfileEmail(e.target.value)}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Optional" />
        </div>
        <div className="mb-3">
          <label className="form-label">Avatar URL</label>
          <input className="form-control" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="/uploads/avatar.png" />
        </div>
      </SectionCard>

  <SectionCard id="general" title="General" onSave={saveGeneral} onSaveDraft={async () => { Swal.fire('Saved draft', 'General draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">Site name</label>
          <input className="form-control" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Site logo URL</label>
          <input className="form-control" value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} placeholder="/uploads/logo.png" />
        </div>
        <div className="mb-2">
          <label className="form-label small">Reason for change (required for audit)</label>
          <input className="form-control form-control-sm" value={changeReason} onChange={(e) => setChangeReason(e.target.value)} placeholder="Explain why you're changing this" />
        </div>
      </SectionCard>

  <SectionCard id="auth" title="Authentication" onSave={saveAuth} onSaveDraft={async () => { Swal.fire('Saved draft', 'Auth draft saved locally.', 'info'); }} saving={saving}>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={allowRegistration} id="allowRegistration" onChange={(e) => setAllowRegistration(e.target.checked)} />
          <label className="form-check-label" htmlFor="allowRegistration">Allow user self-registration</label>
        </div>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={requireEmailVerification} id="requireEmailVerification" onChange={(e) => setRequireEmailVerification(e.target.checked)} />
          <label className="form-check-label" htmlFor="requireEmailVerification">Require email verification</label>
        </div>
      </SectionCard>

  <SectionCard id="email" title="Email / SMTP" onSave={saveEmail} onSaveDraft={async () => { Swal.fire('Saved draft', 'Email draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">SMTP Host</label>
          <input className="form-control" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
        </div>
        <div className="mb-3 d-flex gap-2">
          <div style={{ flex: 1 }}>
            <label className="form-label">SMTP Port</label>
            <input className="form-control" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
          </div>
          <div className="align-self-end">
            <button className="btn btn-outline-secondary mt-2" onClick={testSmtp} disabled={saving}>Test SMTP</button>
          </div>
        </div>
      </SectionCard>

  <SectionCard id="notifications" title="Notifications" onSave={saveNotifications} onSaveDraft={async () => { Swal.fire('Saved draft', 'Notifications draft saved locally.', 'info'); }} saving={saving}>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={notifyOnVote} id="notifyOnVote" onChange={(e) => setNotifyOnVote(e.target.checked)} />
          <label className="form-check-label" htmlFor="notifyOnVote">Notify admins on each vote</label>
        </div>
      </SectionCard>

  <SectionCard id="backup" title="Backup & Restore" onSave={runBackupNow} onSaveDraft={async () => { Swal.fire('Saved draft', 'Backup draft saved locally.', 'info'); }} saving={saving}>
        <div className="mb-3">
          <label className="form-label">Backup schedule</label>
          <select className="form-select" value={backupSchedule} onChange={(e) => setBackupSchedule(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="mb-3 d-flex gap-2 align-items-end">
          <div style={{ flex: 1 }}>
            <label className="form-label">Retention (days)</label>
            <input type="number" className="form-control" value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} />
          </div>
          <div>
            <button className="btn btn-outline-primary" onClick={runBackupNow} disabled={saving}>Backup now</button>
          </div>
          <div>
            <button className="btn btn-outline-secondary" onClick={testRestore} disabled={saving}>Test restore</button>
          </div>
        </div>
        <div className="small text-muted">Last backup: {lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'Never'}</div>
      </SectionCard>

  <SectionCard id="rbac" title="RBAC & MFA" onSave={saveRbacMfa} onSaveDraft={async () => { Swal.fire('Saved draft', 'Security draft saved locally.', 'info'); }} saving={saving}>
        <div className="form-check mb-2">
          <input className="form-check-input" type="checkbox" checked={enforceMfa} id="enforceMfa" onChange={(e) => setEnforceMfa(e.target.checked)} />
          <label className="form-check-label" htmlFor="enforceMfa">Enforce MFA for all admin accounts</label>
        </div>
        {enforceMfa && (
          <div className="mb-3">
            <label className="form-label">Grace period (days)</label>
            <input type="number" className="form-control" value={mfaGraceDays} onChange={(e) => setMfaGraceDays(Number(e.target.value))} />
            <div className="small text-muted">Users will have this many days to enable MFA before enforcement.</div>
          </div>
        )}
      </SectionCard>

      <div className="mt-4 text-muted">
        <h6>What's next</h6>
        <ul>
          <li>Persist these settings server-side with a secure admin API.</li>
          <li>Add role-based permissions so only authorized admins can change critical settings.</li>
          <li>Add audit logging for settings changes (who changed what and when).</li>
          <li>Add scheduled backups and export/import for settings and data.</li>
        </ul>
      </div>
    </div>
  );
}
