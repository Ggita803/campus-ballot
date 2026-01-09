const asyncHandler = require("express-async-handler");
const Question = require("../models/Question");
const Announcement = require("../models/Announcement");
const Candidate = require("../models/Candidate");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");

// @desc    Get candidate's engagement data (questions & announcements)
// @route   GET /api/candidate/engagement
// @access  Protected (Candidate only)
const getCandidateEngagement = asyncHandler(async (req, res) => {
  try {
    // Find the candidate record for this user
    const candidate = await Candidate.findOne({ user: req.user._id });

    if (!candidate) {
      return res.status(404).json({ 
        message: "Candidate profile not found",
        questions: [],
        announcements: []
      });
    }

    // Fetch questions for this candidate
    const questions = await Question.find({ candidate: candidate._id })
      .populate('voter', 'name email')
      .sort({ createdAt: -1 });

    // Fetch announcements for this candidate
    const announcements = await Announcement.find({ candidate: candidate._id })
      .sort({ createdAt: -1 });

    // Format the data
    const formattedQuestions = questions.map(q => ({
      _id: q._id,
      voterName: q.voterName,
      question: q.question,
      answer: q.answer,
      status: q.status,
      likes: q.likes,
      createdAt: q.createdAt,
      answeredAt: q.answeredAt
    }));

    const formattedAnnouncements = announcements.map(a => ({
      _id: a._id,
      title: a.title,
      message: a.message,
      views: a.views,
      likes: a.likes,
      comments: a.comments.length,
      createdAt: a.createdAt
    }));

    res.json({
      questions: formattedQuestions,
      announcements: formattedAnnouncements
    });
  } catch (error) {
    console.error('Error fetching engagement data:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Answer a question
// @route   PUT /api/candidate/engagement/questions/:id/answer
// @access  Protected (Candidate only)
const answerQuestion = asyncHandler(async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer is required" });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Verify the question belongs to this candidate
    const candidate = await Candidate.findOne({ user: req.user._id });
    if (!candidate || question.candidate.toString() !== candidate._id.toString()) {
      return res.status(403).json({ message: "You can only answer questions directed to you" });
    }

    question.answer = answer.trim();
    question.status = 'answered';
    question.answeredAt = new Date();
    await question.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'Question',
      entityId: question._id.toString(),
      details: `Answered question from ${question.voterName}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    res.json({
      message: "Question answered successfully",
      question
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new announcement
// @route   POST /api/candidate/engagement/announcements
// @access  Protected (Candidate only)
const createAnnouncement = asyncHandler(async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    // Find the candidate record for this user
    const candidate = await Candidate.findOne({ user: req.user._id });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    const announcement = await Announcement.create({
      candidate: candidate._id,
      title: title.trim(),
      message: message.trim()
    });

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'create',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      details: `Created announcement: ${title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update an announcement
// @route   PUT /api/candidate/engagement/announcements/:id
// @access  Protected (Candidate only)
const updateAnnouncement = asyncHandler(async (req, res) => {
  try {
    const { title, message } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Verify the announcement belongs to this candidate
    const candidate = await Candidate.findOne({ user: req.user._id });
    if (!candidate || announcement.candidate.toString() !== candidate._id.toString()) {
      return res.status(403).json({ message: "You can only update your own announcements" });
    }

    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();

    await announcement.save();

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'update',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      details: `Updated announcement: ${announcement.title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    res.json({
      message: "Announcement updated successfully",
      announcement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete an announcement
// @route   DELETE /api/candidate/engagement/announcements/:id
// @access  Protected (Candidate only)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Verify the announcement belongs to this candidate
    const candidate = await Candidate.findOne({ user: req.user._id });
    if (!candidate || announcement.candidate.toString() !== candidate._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own announcements" });
    }

    await announcement.deleteOne();

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'delete',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      details: `Deleted announcement: ${announcement.title}`,
      status: 'success',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Submit a question to a candidate (Public/Voter)
// @route   POST /api/public/candidates/:candidateId/questions
// @access  Protected (Student only)
const submitQuestion = asyncHandler(async (req, res) => {
  try {
    const { question } = req.body;
    const { candidateId } = req.params;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newQuestion = await Question.create({
      candidate: candidateId,
      voter: req.user._id,
      voterName: req.user.name,
      question: question.trim()
    });

    res.status(201).json({
      message: "Question submitted successfully",
      question: newQuestion
    });
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get public Q&A for a candidate
// @route   GET /api/public/candidates/:candidateId/questions
// @access  Public
const getCandidateQuestions = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;
    const userId = req.user?._id; // May be undefined if not logged in

    const questions = await Question.find({ 
      candidate: candidateId,
      isPublic: true 
    })
      .select('-voter')
      .sort({ likes: -1, createdAt: -1 });

    // Add isLiked flag for each question
    const questionsWithLikes = questions.map(q => ({
      ...q.toObject(),
      isLiked: userId ? q.likedBy.includes(userId) : false
    }));

    res.json(questionsWithLikes);
  } catch (error) {
    console.error('Error fetching candidate questions:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get public announcements for a candidate
// @route   GET /api/public/candidates/:candidateId/announcements
// @access  Public
const getCandidateAnnouncements = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;
    const userId = req.user?._id; // May be undefined if not logged in

    const announcements = await Announcement.find({ 
      candidate: candidateId,
      isPublished: true 
    })
      .sort({ createdAt: -1 });

    // Add isLiked flag for each announcement
    const announcementsWithLikes = announcements.map(a => ({
      ...a.toObject(),
      isLiked: userId ? a.likedBy.includes(userId) : false
    }));

    res.json(announcementsWithLikes);
  } catch (error) {
    console.error('Error fetching candidate announcements:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle like on a question
// @route   POST /api/public/questions/:questionId/like
// @access  Protected
const toggleQuestionLike = asyncHandler(async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user already liked
    const likedIndex = question.likedBy.indexOf(userId);

    if (likedIndex > -1) {
      // Unlike
      question.likedBy.splice(likedIndex, 1);
      question.likes = Math.max(0, question.likes - 1);
    } else {
      // Like
      question.likedBy.push(userId);
      question.likes += 1;
    }

    await question.save();

    res.json({
      message: likedIndex > -1 ? "Question unliked" : "Question liked",
      likes: question.likes,
      isLiked: likedIndex === -1
    });
  } catch (error) {
    console.error('Error toggling question like:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle like on an announcement
// @route   POST /api/public/announcements/:announcementId/like
// @access  Protected
const toggleAnnouncementLike = asyncHandler(async (req, res) => {
  try {
    const { announcementId } = req.params;
    const userId = req.user._id;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user already liked
    const likedIndex = announcement.likedBy.indexOf(userId);

    if (likedIndex > -1) {
      // Unlike
      announcement.likedBy.splice(likedIndex, 1);
      announcement.likes = Math.max(0, announcement.likes - 1);
    } else {
      // Like
      announcement.likedBy.push(userId);
      announcement.likes += 1;
    }

    await announcement.save();

    res.json({
      message: likedIndex > -1 ? "Announcement unliked" : "Announcement liked",
      likes: announcement.likes,
      isLiked: likedIndex === -1
    });
  } catch (error) {
    console.error('Error toggling announcement like:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add comment to announcement
// @route   POST /api/public/announcements/:announcementId/comments
// @access  Protected
const addAnnouncementComment = asyncHandler(async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.comments.push({
      user: userId,
      userName: req.user.name,
      comment: comment.trim(),
      createdAt: new Date()
    });

    await announcement.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: announcement.comments[announcement.comments.length - 1],
      totalComments: announcement.comments.length
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Track announcement view
// @route   POST /api/public/announcements/:announcementId/view
// @access  Protected
const trackAnnouncementView = asyncHandler(async (req, res) => {
  try {
    const { announcementId } = req.params;
    const userId = req.user._id;

    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Only count unique views
    if (!announcement.viewedBy.includes(userId)) {
      announcement.viewedBy.push(userId);
      announcement.views += 1;
      await announcement.save();
    }

    res.json({
      message: "View tracked",
      views: announcement.views
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getCandidateEngagement,
  answerQuestion,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  submitQuestion,
  getCandidateQuestions,
  getCandidateAnnouncements,
  toggleQuestionLike,
  toggleAnnouncementLike,
  addAnnouncementComment,
  trackAnnouncementView
};
