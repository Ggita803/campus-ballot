const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get real stats from database
    const totalUsers = await User.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalElections = await Election.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalLogs = await Log.countDocuments();
    
    // Get active elections (status = 'active' or based on current date)
    const now = new Date();
    const activeElections = await Election.countDocuments({
      $and: [
        { startDate: { $lte: now } },
        { endDate: { $gte: now } }
      ]
    });
    
    // Get pending approvals (candidates with status pending)
    const pendingApprovals = await Candidate.countDocuments({ 
      status: 'pending' 
    });
    
    // Get elections for chart data (include id and title)
    const elections = await Election.find().select('title');

    // Get votes per election for chart as structured objects { election, title, count }
    const votesPerElectionAgg = await Vote.aggregate([
      { $group: { _id: '$election', count: { $sum: 1 } } },
      { $lookup: { from: 'elections', localField: '_id', foreignField: '_id', as: 'election' } },
      { $unwind: { path: '$election', preserveNullAndEmptyArrays: true } },
      { $project: { election: '$_id', title: '$election.title', count: 1 } }
    ]);

    // Ensure every election appears in the result, even if zero votes
    const votesPerElection = elections.map(e => {
      const found = votesPerElectionAgg.find(v => String(v.election) === String(e._id));
      return {
        election: e._id,
        title: e.title,
        count: found ? found.count : 0
      };
    });
    
    // Get user role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roles = roleStats.map(r => r._id);
    const roleCounts = roleStats.map(r => r.count);
    
    res.json({
      totalUsers,
      totalVotes,
      totalElections,
      totalCandidates,
      activeElections,
      pendingApprovals,
      totalNotifications,
      totalLogs,
      elections: elections.map(e => ({ id: e._id, title: e.title })),
      electionNames: elections.map(e => e.title),
      votesPerElection,
      roles,
      roleCounts,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
});

module.exports = router;