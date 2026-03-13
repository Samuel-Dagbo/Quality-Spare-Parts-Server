const express = require("express");
const {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require("../controllers/supplier.controller");
const { validate } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { supplierSchema, supplierUpdateSchema } = require("../validators/supplier.schema");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "staff"), listSuppliers);
router.post("/", requireAuth, requireRole("admin", "staff"), validate(supplierSchema), createSupplier);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "staff"),
  validate(supplierUpdateSchema),
  updateSupplier
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteSupplier);

module.exports = router;
