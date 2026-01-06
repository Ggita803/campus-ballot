const path = require('path');
const fs = require('fs').promises;
const fscb = require('fs');
const { v4: uuidv4 } = (() => {
  try { return require('uuid'); } catch { return { v4: () => Math.random().toString(36).slice(2) }; }
})();

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const INDEX_FILE = path.join(BACKUP_DIR, 'index.json');
const SCHEDULE_FILE = path.join(BACKUP_DIR, 'schedule.json');

async function ensureDirs() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  try { await fs.access(INDEX_FILE); } catch { await fs.writeFile(INDEX_FILE, '[]'); }
}

async function readIndex() {
  await ensureDirs();
  const raw = await fs.readFile(INDEX_FILE, 'utf8');
  try { return JSON.parse(raw); } catch { return []; }
}

async function writeIndex(list) {
  await ensureDirs();
  await fs.writeFile(INDEX_FILE, JSON.stringify(list, null, 2));
}

exports.listBackups = async (req, res) => {
  try {
    const list = await readIndex();
    res.json(list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (e) {
    res.status(500).json({ message: 'Failed to list backups', error: e.message });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const result = await performBackup({ app: req.app, type: 'manual' });
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({ message: 'Failed to create backup', error: e.message });
  }
};

exports.restoreBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await readIndex();
    const item = list.find(b => b.id === id);
    if (!item) return res.status(404).json({ message: 'Backup not found' });
    // In a real system, trigger restore; here we just acknowledge
    res.json({ message: 'Restore initiated', id });
  } catch (e) {
    res.status(500).json({ message: 'Failed to restore', error: e.message });
  }
};

exports.downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await readIndex();
    const item = list.find(b => b.id === id);
    if (!item) return res.status(404).json({ message: 'Backup not found' });
    const filePath = path.join(BACKUP_DIR, item.filename);
    if (!fscb.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });
    res.download(filePath, item.filename);
  } catch (e) {
    res.status(500).json({ message: 'Failed to download', error: e.message });
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await readIndex();
    const idx = list.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Backup not found' });
    const [item] = list.splice(idx, 1);
    await writeIndex(list);
    try { await fs.unlink(path.join(BACKUP_DIR, item.filename)); } catch {}
    try {
      const io = req.app.get('io');
      if (io) io.emit('backups:deleted', { id });
    } catch {}
    res.json({ message: 'Backup deleted', id });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete', error: e.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const cfg = await getScheduleConfig();
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get schedule', error: e.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const cfg = await saveScheduleConfig(req.body || {});
    try {
      const rescheduler = req.app.get('scheduleBackups');
      if (rescheduler) rescheduler();
    } catch {}
    res.json(cfg);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update schedule', error: e.message });
  }
};

async function performBackup({ app, type = 'scheduled' } = {}) {
  const start = Date.now();
  await ensureDirs();
  const id = uuidv4.v4 ? uuidv4.v4() : uuidv4();
  const timestamp = new Date().toISOString();
  const filename = `backup-${id}.zip`;
  const filePath = path.join(BACKUP_DIR, filename);
  await fs.writeFile(filePath, `Campus Ballot backup placeholder\ncreated: ${timestamp}\n`);
  const stat = await fs.stat(filePath);
  const size = stat.size;
  const durationMs = Date.now() - start;
  const entry = {
    id,
    timestamp,
    size: formatBytes(size),
    type,
    status: 'completed',
    duration: `${Math.max(1, Math.round(durationMs / 1000))} seconds`,
    filename
  };
  const list = await readIndex();
  list.push(entry);
  await writeIndex(list);

  await enforceRetention(list);

  try {
    const io = app?.get ? app.get('io') : null;
    if (io) io.emit('backups:new', entry);
  } catch {}

  return entry;
}

async function enforceRetention(list) {
  try {
    const cfg = await getScheduleConfig();
    const cutoff = Date.now() - (cfg.retention || 30) * 24 * 60 * 60 * 1000;
    const toKeep = [];
    for (const b of list) {
      if (new Date(b.timestamp).getTime() >= cutoff) {
        toKeep.push(b);
      } else {
        try { await fs.unlink(path.join(BACKUP_DIR, b.filename)); } catch {}
      }
    }
    if (toKeep.length !== list.length) {
      await writeIndex(toKeep);
    }
  } catch {
    // best-effort
  }
}

async function getScheduleConfig() {
  await ensureDirs();
  let cfg = { enabled: true, frequency: 'daily', time: '02:00', retention: 30 };
  try { cfg = JSON.parse(await fs.readFile(SCHEDULE_FILE, 'utf8')); } catch {}
  return cfg;
}

async function saveScheduleConfig(body) {
  await ensureDirs();
  const { enabled, frequency, time, retention } = body || {};
  const cfg = {
    enabled: !!enabled,
    frequency: ['daily', 'weekly', 'monthly'].includes(frequency) ? frequency : 'daily',
    time: typeof time === 'string' ? time : '02:00',
    retention: Number.isFinite(retention) ? Math.max(1, Math.min(365, Number(retention))) : 30
  };
  await fs.writeFile(SCHEDULE_FILE, JSON.stringify(cfg, null, 2));
  return cfg;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

exports.performBackup = performBackup;
exports.getScheduleConfig = getScheduleConfig;
