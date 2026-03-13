const express = require("express");
const { getAnalyticsSummary, getStoreHighlights } = require("../controllers/analytics.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public storefront highlights (best sellers, new arrivals)
router.get("/storefront", getStoreHighlights);

router.get("/summary", requireAuth, requireRole("admin"), getAnalyticsSummary);

module.exports = router;
