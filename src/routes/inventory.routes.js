const express = require("express");
const {
  listAdjustments,
  listLogs,
  createAdjustment,
  lowStock
} = require("../controllers/inventory.controller");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { adjustmentSchema } = require("../validators/inventory.schema");

const router = express.Router();

router.get("/adjustments", requireAuth, requireRole("admin", "staff"), listAdjustments);
router.get("/logs", requireAuth, requireRole("admin", "staff"), listLogs);
router.post(
  "/adjustments",
  requireAuth,
  requireRole("admin", "staff"),
  validate(adjustmentSchema),
  createAdjustment
);
router.get("/low-stock", requireAuth, requireRole("admin", "staff"), lowStock);

module.exports = router;
