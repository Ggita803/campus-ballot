const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { createApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// Candidate self-application
router.post('/', protect, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'symbol', maxCount: 1 }
]), createApplication);

module.exports = router;
