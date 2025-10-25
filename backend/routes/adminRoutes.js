const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

// settings controller + auth
const settingsController = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalLogs = await Log.countDocuments();

    // Get active elections based on current date and status
    const now = new Date();
    const activeElections = await Election.countDocuments({
      $or: [
  // match ongoing elections (legacy 'active' may still exist in db)
  { status: { $in: ['ongoing', 'active'] } },
        {
          $and: [
            { startDate: { $lte: now } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    });

    // Get pending approvals (candidates with pending status)
    const pendingApprovals = await Candidate.countDocuments({ 
      status: 'pending' 
    });

    const elections = await Election.find({}, 'title');
    const electionNames = elections.map(e => e.title);

    // Count votes per election
    const votesPerElection = await Promise.all(
      elections.map(async (e) => await Vote.countDocuments({ election: e._id }))
    );

    // User roles distribution
    const roles = ['admin', 'student', 'staff'];
    const roleCounts = await Promise.all(
      roles.map(async (role) => await User.countDocuments({ role }))
    );

    res.json({
      totalUsers,
      totalVotes,
      totalElections,
      totalCandidates,
      activeElections,
      pendingApprovals,
      totalNotifications,
      totalLogs,
      electionNames,
      votesPerElection,
      roles,
      roleCounts,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: "Failed to fetch dashboard stats",
      error: error.message 
    });
  }
});

// --- Admin settings endpoints ---
// Get current settings
router.get('/settings', protect, adminOnly, settingsController.getSettings);

// Update a section of settings (general, email, notifications, security)
router.put('/settings/:section', protect, adminOnly, settingsController.updateSettingsSection);

// Test SMTP connection (best-effort)
router.post('/settings/test-smtp', protect, adminOnly, settingsController.testSmtp);

// Update admin profile (current user)
router.put('/profile', protect, adminOnly, settingsController.updateProfile);

// Settings history
router.get('/settings/history', protect, adminOnly, settingsController.listHistory);

module.exports = router;