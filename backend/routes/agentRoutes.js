const express = require("express");
const router = express.Router();
const { protect, hasRole } = require("../middleware/authMiddleware");

const {
  getMyAgents,
  searchStudentsForAgent,
  addAgent,
  updateAgent,
  updateAgentStatus,
  removeAgent,
  getAgentStats,
  getAgentDashboard,
  getAgentPersonalStats
} = require("../controllers/agentController");

// All routes require authentication and candidate role
// Include 'student' since candidates have role='student' with additionalRoles=['candidate']
router.use(protect);
router.use(hasRole('student', 'candidate', 'admin', 'super_admin'));

// Agent routes - specific routes before generic ones
router.get("/stats", getAgentStats);
router.get("/search-students", searchStudentsForAgent);
router.get("/", getMyAgents);
router.post("/", addAgent);
router.put("/:id", updateAgent);
router.patch("/:id/status", updateAgentStatus);
router.delete("/:id", removeAgent);

module.exports = router;
