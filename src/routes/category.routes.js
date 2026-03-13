const express = require("express");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/category.controller");
const { validate } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { categorySchema, categoryUpdateSchema } = require("../validators/category.schema");

const router = express.Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireRole("admin", "staff"), validate(categorySchema), createCategory);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "staff"),
  validate(categoryUpdateSchema),
  updateCategory
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCategory);

module.exports = router;
