const express = require("express");
const { getStats, getReports } = require("../controllers/dashboard.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAuth, requireRole("admin", "staff"), getStats);
router.get("/reports", requireAuth, requireRole("admin", "staff"), getReports);

module.exports = router;
