const asyncHandler = require("express-async-handler");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Log = require("../models/Log");

// Helper: Check if observer has access to election
const hasElectionAccess = (observer, electionId) => {
  if (observer.observerInfo?.accessLevel === 'full') {
    return true;
  }
  
  return observer.observerInfo?.assignedElections?.some(
    id => id.toString() === electionId.toString()
  );
};

// @desc    Get observer dashboard overview
// @route   GET /api/observer/dashboard
// @access  Private (Observer)
const getObserverDashboard = asyncHandler(async (req, res) => {
  const observer = req.user;

  // Get assigned elections or all if full access
  let electionsQuery = {};
  if (observer.observerInfo?.accessLevel === 'election-specific') {
    electionsQuery = {
      _id: { $in: observer.observerInfo.assignedElections || [] }
    };
  }

  const elections = await Election.find(electionsQuery)
    .select('title description status startDate endDate positions')
    .sort('-createdAt')
    .populate('positions.candidates', 'name status');

  // Get counts
  const activeElections = elections.filter(e => e.status === 'active').length;
  const upcomingElections = elections.filter(e => e.status === 'upcoming').length;
  const completedElections = elections.filter(e => e.status === 'completed').length;

  // Get voting statistics for all assigned elections
  const assignedElectionIds = elections.map(e => e._id);

  // Get voting activity by hour for today (all assigned elections) in EAT (UTC+3)
  const now = new Date();
  // Calculate EAT offset
  const eatOffsetMs = 3 * 60 * 60 * 1000;
  const eatToday = new Date(now.getTime() + eatOffsetMs);
  eatToday.setHours(0, 0, 0, 0);
  // Get UTC start of EAT day
  const utcStartOfEatDay = new Date(eatToday.getTime() - eatOffsetMs);

  const hourlyActivity = await Vote.aggregate([
    {
      $match: {
        election: { $in: assignedElectionIds },
        createdAt: { $gte: utcStartOfEatDay }
      }
    },
    {
      $addFields: {
        eatHour: {
          $mod: [
            { $add: [ { $hour: '$createdAt' }, 3 ] },
            24
          ]
        }
      }
    },
    {
      $group: {
        _id: { hour: '$eatHour' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);

  // Format hourly activity data (create array for all hours 0-23 in EAT)
  const formattedHourlyActivity = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourData = hourlyActivity.find(item => item._id.hour === hour);
    formattedHourlyActivity.push({
      hour: hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      count: hourData ? hourData.count : 0
    });
  }

  // Get position statistics (candidates per position)
  const positionStatsMap = new Map();
  
  // Aggregate candidates per position using correct schema fields
  for (const election of elections) {
    if (Array.isArray(election.positions) && election.positions.length > 0) {
      for (const positionName of election.positions) {
        // Count candidates for this position in this election
        const candidateCount = await Candidate.countDocuments({
          election: election._id,
          position: positionName
        });
        if (candidateCount > 0) {
          if (positionStatsMap.has(positionName)) {
            positionStatsMap.get(positionName).candidateCount += candidateCount;
          } else {
            positionStatsMap.set(positionName, {
              positionName,
              candidateCount
            });
          }
        }
      }
    }
  }
  
  const positionStats = Array.from(positionStatsMap.values());

  // Calculate total votes cast
  const totalVotes = await Vote.countDocuments({
    electionId: { $in: elections.map(e => e._id) }
  });

  // Get unique voters across all elections
  const uniqueVoters = await Vote.distinct('userId', {
    electionId: { $in: elections.map(e => e._id) }
  });

  res.json({
    success: true,
    data: {
      overview: {
        totalElections: elections.length,
        activeElections,
        upcomingElections,
        completedElections,
        accessLevel: observer.observerInfo?.accessLevel || 'election-specific',
        assignedElectionsCount: observer.observerInfo?.assignedElections?.length || 0,
        totalVotes: totalVotes,
        totalUniqueVoters: uniqueVoters.length
      },
      elections: elections.map(e => ({
        id: e._id,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
        endDate: e.endDate,
        positionsCount: e.positions?.length || 0
      })),
      votingStats: {
        hourlyActivity: formattedHourlyActivity,
        totalVotesToday: formattedHourlyActivity.reduce((sum, item) => sum + item.count, 0),
        peakHour: formattedHourlyActivity.reduce((max, item) => 
          item.count > max.count ? item : max, 
          { hour: 0, time: '00:00', count: 0 }
        )
      },
      positionStats: positionStats.slice(0, 10) // Limit to top 10 positions for chart
    }
  });
});

// @desc    Get real-time election statistics
// @route   GET /api/observer/elections/:electionId/statistics
// @access  Private (Observer)
const getElectionStatistics = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const election = await Election.findById(electionId)
    .populate('positions.candidates');

  if (!election) {
    res.status(404);
    throw new Error("Election not found");
  }

  // Get eligible voters count
  const eligibleVotersQuery = { role: 'student', isVerified: true };
  
  if (election.eligibilityCriteria) {
    if (election.eligibilityCriteria.faculty) {
      eligibleVotersQuery.faculty = { $in: election.eligibilityCriteria.faculty };
    }
    if (election.eligibilityCriteria.yearOfStudy) {
      eligibleVotersQuery.yearOfStudy = { $in: election.eligibilityCriteria.yearOfStudy };
    }
  }

  const eligibleVotersCount = await User.countDocuments(eligibleVotersQuery);

  // Get votes count (without revealing individual votes)
  const votesCount = await Vote.countDocuments({ electionId });

  // Get unique voters count
  const uniqueVoters = await Vote.distinct('voterId', { electionId });
  const uniqueVotersCount = uniqueVoters.length;

  // Calculate turnout
  const turnoutPercentage = eligibleVotersCount > 0 
    ? ((uniqueVotersCount / eligibleVotersCount) * 100).toFixed(2)
    : 0;

  // Get votes by position (aggregated, no individual data)
  const votesByPosition = await Vote.aggregate([
    { $match: { electionId: election._id } },
    { $group: { 
      _id: '$positionId',
      totalVotes: { $sum: 1 }
    }}
  ]);

  // Get candidate count
  const candidatesCount = election.positions.reduce(
    (total, pos) => total + (pos.candidates?.length || 0), 
    0
  );

  res.json({
    success: true,
    data: {
      election: {
        id: election._id,
        title: election.title,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate
      },
      statistics: {
        eligibleVoters: eligibleVotersCount,
        totalVotesCast: votesCount,
        uniqueVoters: uniqueVotersCount,
        turnoutPercentage: parseFloat(turnoutPercentage),
        candidatesCount,
        positionsCount: election.positions.length,
        votesByPosition: votesByPosition.map(v => ({
          positionId: v._id,
          totalVotes: v.totalVotes
        }))
      }
    }
  });
});

// @desc    Get audit logs for election
// @route   GET /api/observer/elections/:electionId/audit-logs
// @access  Private (Observer)
const getElectionAuditLogs = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;
  const { page = 1, limit = 50, action, userId } = req.query;

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const query = {
    $or: [
      { 'metadata.electionId': electionId },
      { relatedEntity: electionId }
    ]
  };

  if (action) {
    query.action = action;
  }

  if (userId) {
    query.userId = userId;
  }

  const logs = await Log.find(query)
    .populate('userId', 'name email role')
    .sort('-timestamp')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Log.countDocuments(query);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get voter turnout trends (time-based, anonymized)
// @route   GET /api/observer/elections/:electionId/turnout-trends
// @access  Private (Observer)
const getTurnoutTrends = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;
  const { interval = 'hourly' } = req.query; // hourly, daily

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const election = await Election.findById(electionId);
  
  if (!election) {
    res.status(404);
    throw new Error("Election not found");
  }

  // Group votes by time interval
  let dateFormat;
  if (interval === 'hourly') {
    dateFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' },
      hour: { $hour: '$timestamp' }
    };
  } else {
    dateFormat = {
      year: { $year: '$timestamp' },
      month: { $month: '$timestamp' },
      day: { $dayOfMonth: '$timestamp' }
    };
  }

  const trends = await Vote.aggregate([
    { $match: { electionId: election._id } },
    {
      $group: {
        _id: dateFormat,
        count: { $sum: 1 },
        uniqueVoters: { $addToSet: '$voterId' }
      }
    },
    {
      $project: {
        _id: 1,
        votesCount: '$count',
        uniqueVotersCount: { $size: '$uniqueVoters' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      interval,
      trends
    }
  });
});

// @desc    Get candidates overview for election
// @route   GET /api/observer/elections/:electionId/candidates
// @access  Private (Observer)
const getElectionCandidates = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const observer = req.user;

  // Check access
  if (!hasElectionAccess(observer, electionId)) {
    res.status(403);
    throw new Error("Access denied: Not assigned to this election");
  }

  const election = await Election.findById(electionId)
    .populate({
      path: 'positions.candidates',
      populate: { path: 'userId', select: 'name email faculty course yearOfStudy' }
    });

  if (!election) {
    res.status(404);
    throw new Error("Election not found");
  }

  const candidatesData = election.positions.map(position => ({
    positionId: position._id,
    positionTitle: position.title,
    candidates: position.candidates.map(candidate => ({
      id: candidate._id,
      name: candidate.userId?.name,
      email: candidate.userId?.email,
      faculty: candidate.userId?.faculty,
      course: candidate.userId?.course,
      yearOfStudy: candidate.userId?.yearOfStudy,
      status: candidate.status,
      submittedAt: candidate.createdAt
    }))
  }));

  res.json({
    success: true,
    data: {
      election: {
        id: election._id,
        title: election.title
      },
      positions: candidatesData
    }
  });
});

// @desc    Get assigned elections for observer
// @route   GET /api/observer/assigned-elections
// @access  Private (Observer)
const getAssignedElections = asyncHandler(async (req, res) => {
  const observer = req.user;

  let electionsQuery = {};
  if (observer.observerInfo?.accessLevel === 'election-specific') {
    electionsQuery = {
      _id: { $in: observer.observerInfo.assignedElections || [] }
    };
  }

  const elections = await Election.find(electionsQuery)
    .select('title description status startDate endDate positions')
    .sort('-startDate');

  res.json({
    success: true,
    data: {
      accessLevel: observer.observerInfo?.accessLevel || 'election-specific',
      elections
    }
  });
});

module.exports = {
  getObserverDashboard,
  getElectionStatistics,
  getElectionAuditLogs,
  getTurnoutTrends,
  getElectionCandidates,
  getAssignedElections
};
