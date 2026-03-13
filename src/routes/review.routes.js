const express = require("express");

const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/review.schema");

const {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  approveReview,
} = require("../controllers/review.controller");

const router = express.Router();

router.get("/", getReviews);

router.post(
  "/",
  requireAuth, // ✅ FIXED (removed ())
  validate(createReviewSchema),
  createReview
);

router.get("/:id", getReview);

router.patch(
  "/:id",
  requireAuth, // ✅ FIXED
  validate(updateReviewSchema),
  updateReview
);

router.delete(
  "/:id",
  requireAuth, // ✅ FIXED
  deleteReview
);

router.patch(
  "/:id/approve",
  requireAuth, // ✅ recommended
  requireRole("admin"),
  approveReview
);

module.exports = router;