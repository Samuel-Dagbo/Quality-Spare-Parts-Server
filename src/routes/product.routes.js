const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");
const { validate } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { productSchema, productUpdateSchema } = require("../validators/product.schema");

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", requireAuth, requireRole("admin", "staff"), validate(productSchema), createProduct);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "staff"),
  validate(productUpdateSchema),
  updateProduct
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);

module.exports = router;
