const express = require("express");
const { listSales, createSale } = require("../controllers/sale.controller");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { saleSchema } = require("../validators/sale.schema");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "staff"), listSales);
router.post("/", requireAuth, requireRole("admin", "staff"), validate(saleSchema), createSale);

module.exports = router;
