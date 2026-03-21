const asyncHandler = require("express-async-handler");
const VoterRecord = require("../models/VoterRecord");
const Ballot = require("../models/Ballot");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// Global throttle state for dashboard updates
let lastDashboardUpdate = 0;
const DASHBOARD_UPDATE_INTERVAL = 5000; // 5 seconds

// @desc    Cast a vote
// @route   POST /api/votes
// @access  User
const castVote = asyncHandler(async (req, res) => {
  try {
    const { electionId, position, candidateId, abstain } = req.body;

    if (!electionId || !position) {
      console.log({ message: "Missing electionId or position" });
      return res.status(400).json({ message: "electionId and position are required" });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      console.log({ message: "Election not found" });
      return res.status(400).json({ message: "Election not found" });
    }

    // Enforce voting time window on the server (use server time)
    const now = new Date();
    const start = election.startDate ? new Date(election.startDate) : null;
    const end = election.endDate ? new Date(election.endDate) : null;

    if (start && now < start) {
      console.log({ message: 'Voting has not started yet', now, start });
      return res.status(403).json({ message: 'Voting has not started yet' });
    }

    if (end && now > end) {
      console.log({ message: 'Voting has ended', now, end });
      return res.status(403).json({ message: 'Voting has ended' });
    }

    // Check if user's faculty is allowed to vote (if allowedFaculties is specified)
    if (election.allowedFaculties && election.allowedFaculties.length > 0) {
      const userFaculty = req.user.faculty;
      if (!userFaculty) {
        return res.status(403).json({ message: 'Your faculty information is missing. Please update your profile.' });
      }
      if (!election.allowedFaculties.includes(userFaculty)) {
        return res.status(403).json({ message: 'Your faculty is not eligible to participate in this election.' });
      }
    }

    // If not abstain, check candidate
    let candidate = null;
    if (!abstain) {
      if (!candidateId) {
        return res.status(400).json({ message: "candidateId is required unless abstaining" });
      }
      candidate = await Candidate.findOne({ _id: candidateId, election: electionId, position });
      if (!candidate) {
        console.log({ message: "Candidate not found for this position/election" });
        return res.status(400).json({ message: "Candidate not found for this position/election" });
      }
    }

    // Check if user has already voted for this position in this election
    const existingRecord = await VoterRecord.findOne({ user: req.user._id, election: electionId, position });
    if (existingRecord) {
      console.log({ message: "User has already voted for this position in this election" });
      return res.status(400).json({ message: "You have already voted for this position in this election" });
    }

    // 1. Create Voter Record (Claims the spot, prevents double voting)
    await VoterRecord.create({
      user: req.user._id,
      election: electionId,
      position
    });

    // 2. Cast Ballot (Anonymous vote)
    const ballot = await Ballot.create({
      election: electionId,
      position,
      candidate: abstain ? undefined : candidateId,
      // Store anonymous demographics snapshot
      faculty: req.user.faculty,
      department: req.user.department,
      yearOfStudy: req.user.yearOfStudy,
      gender: req.user.gender
    });

    // Log student voting activity
    await logActivity({
      userId: req.user._id,
      action: 'vote',
      entityType: 'Ballot',
      entityId: ballot._id.toString(),
      details: abstain 
        ? `Abstained from voting for ${position} in ${election.title}`
        : `Voted for ${candidate?.name || 'candidate'} for ${position} in ${election.title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // Optionally increment candidate's vote count
    if (candidate) {
      // Use atomic $inc to avoid race conditions in high concurrency
      await Candidate.updateOne({ _id: candidate._id }, { $inc: { votes: 1 } });
    }

    // Send response immediately to user so they don't wait for dashboard stats
    console.log({ message: "Vote cast successfully" });
    res.status(201).json({ message: "Vote cast successfully" });

    // Emit realtime update to connected clients
    try {
      const io = req.app.get('io');
      if (io) {
        // Emit to room for this election
        io.to(`election_${electionId}`).emit('vote:update', {
          electionId,
          candidateId: candidateId || null,
          position,
          abstain: !!abstain,
        });

        // THROTTLING: Only perform heavy dashboard aggregation if interval has passed
        const now = Date.now();
        if (now - lastDashboardUpdate > DASHBOARD_UPDATE_INTERVAL) {
          lastDashboardUpdate = now;

          // Compute aggregate counts for dashboard (votes per election and candidate votes)
          // Build structured votes per election including titles
          const votesPerElectionAgg = await Ballot.aggregate([
            { $group: { _id: '$election', count: { $sum: 1 } } },
            { $lookup: { from: 'elections', localField: '_id', foreignField: '_id', as: 'election' } },
            { $unwind: { path: '$election', preserveNullAndEmptyArrays: true } },
            { $project: { election: '$_id', title: '$election.title', count: 1 } }
          ]);

          // Ensure all elections are present with zero counts if missing
          const allElections = await Election.find().select('title').lean();
          const votesPerElection = allElections.map(e => {
            const found = votesPerElectionAgg.find(v => String(v.election) === String(e._id));
            return { election: e._id, title: e.title, count: found ? found.count : 0 };
          });

          const candidateVotesAgg = await Candidate.find({ election: electionId })
            .select('name votes')
            .lean();

          io.emit('dashboard:update', {
            votesPerElection,
            candidateVotes: candidateVotesAgg
          });
        }
      }
    } catch (emitError) {
      console.error('Error emitting socket update:', emitError.message);
    }
  } catch (error) {
    console.log({ message: "Error casting vote", error: error.message });
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// @desc    Get own voting history
// @route   GET /api/votes/me
// @access  User
const getMyVotes = asyncHandler(async (req, res) => {
  try {
    // We can only show THAT they voted, not WHO they voted for (Anonymity)
    const votes = await VoterRecord.find({ user: req.user._id })
      .populate("election", "title");
    
    console.log({ message: "Fetched user's voting history" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching voting history", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for an election
// @route   GET /api/votes/election/:electionId
// @access  Admin
const getVotesByElection = asyncHandler(async (req, res) => {
  try {
    // Admins can see ballots, but NO USER INFO attached
    const votes = await Ballot.find({ election: req.params.electionId })
      .populate("candidate", "name position party");
    console.log({ message: "Fetched votes for election" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching votes by election", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for a candidate
// @route   GET /api/votes/candidate/:candidateId
// @access  Admin
const getVotesByCandidate = asyncHandler(async (req, res) => {
  try {
    // Admins can see ballots for a candidate, but NO USER INFO
    const votes = await Ballot.find({ candidate: req.params.candidateId })
      .populate("election", "title");
    console.log({ message: "Fetched votes for candidate" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching votes by candidate", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes (system-wide)
// @route   GET /api/votes
// @access  Admin
const getAllVotes = asyncHandler(async (req, res) => {
  try {
    const votes = await Ballot.find()
      .populate("election", "title")
      .populate("candidate", "name position party");
    console.log({ message: "Fetched all votes" });
    res.json(votes);
  } catch (error) {
    console.log({ message: "Error fetching all votes", error: error.message });
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  castVote,
  getMyVotes,
  getVotesByElection,
  getVotesByCandidate,
  getAllVotes
};