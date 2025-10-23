const express = require('express');
const router = express.Router();
const { getFaculties, getCohorts } = require('../controllers/metaController');
const { protect } = require('../middleware/authMiddleware');

// Public meta endpoints (protected optional)
router.get('/faculties', getFaculties);
router.get('/cohorts', getCohorts);

module.exports = router;
