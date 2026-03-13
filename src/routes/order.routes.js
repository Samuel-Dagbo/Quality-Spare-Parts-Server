const express = require("express");
const {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  createQuickSale
} = require("../controllers/order.controller");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { orderSchema, quickSaleSchema, orderStatusSchema } = require("../validators/order.schema");

const router = express.Router();

router.get("/", requireAuth, listOrders);
router.get("/:id", requireAuth, getOrder);
router.post("/", requireAuth, validate(orderSchema), createOrder);
router.post("/quick-sale", requireAuth, requireRole("staff", "admin"), validate(quickSaleSchema), createQuickSale);
router.get("/admin/all", requireAuth, requireRole("admin", "staff"), listOrders);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin", "staff"),
  validate(orderStatusSchema),
  updateOrderStatus
);

module.exports = router;
