const express = require("express");
const router = express.Router();
const { protect, hasRole } = require("../middleware/authMiddleware");

const {
  getAgentDashboard,
  getAgentPersonalStats
} = require("../controllers/agentController");

// All routes require authentication and agent role
router.use(protect);
router.use(hasRole('student', 'admin', 'super_admin')); // Agents can be students

// Agent dashboard routes
router.get("/dashboard", getAgentDashboard);
router.get("/stats", getAgentPersonalStats);

module.exports = router;
