const express = require("express");
const {
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand
} = require("../controllers/brand.controller");
const { validate } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { brandSchema, brandUpdateSchema } = require("../validators/brand.schema");

const router = express.Router();

router.get("/", listBrands);
router.post("/", requireAuth, requireRole("admin", "staff"), validate(brandSchema), createBrand);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "staff"),
  validate(brandUpdateSchema),
  updateBrand
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteBrand);

module.exports = router;
