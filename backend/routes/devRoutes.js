const express = require('express');
const router = express.Router();

// Dev-only endpoint to emit a sample dashboard:update event
router.post('/emit-dashboard', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Not allowed in non-development environment' });
    }

    const io = req.app.get('io');
    if (!io) return res.status(500).json({ message: 'Socket server not initialized' });

    // Sample payload
    const sample = {
      votesPerElection: [
        { election: '000000000000000000000001', title: 'Sample Election A', count: Math.floor(Math.random() * 200) },
        { election: '000000000000000000000002', title: 'Sample Election B', count: Math.floor(Math.random() * 200) }
      ],
      candidateVotes: [
        { name: 'John Doe', votes: Math.floor(Math.random() * 100) },
        { name: 'Jane Smith', votes: Math.floor(Math.random() * 100) }
      ]
    };

    io.emit('dashboard:update', sample);
    return res.json({ message: 'Emitted sample dashboard:update', sample });
  } catch (err) {
    console.error('Dev emit error:', err);
    return res.status(500).json({ message: 'Failed to emit sample event' });
  }
});

module.exports = router;
