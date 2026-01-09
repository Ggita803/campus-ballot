const express = require('express');
const router = express.Router();

const {
  getCandidateEngagement,
  answerQuestion,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/engagementController');

const { protect } = require('../middleware/authMiddleware');

// Candidate routes
router.get('/', protect, getCandidateEngagement);
router.put('/questions/:id/answer', protect, answerQuestion);
router.post('/announcements', protect, createAnnouncement);
router.put('/announcements/:id', protect, updateAnnouncement);
router.delete('/announcements/:id', protect, deleteAnnouncement);

module.exports = router;
