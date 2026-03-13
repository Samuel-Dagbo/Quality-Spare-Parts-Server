const express = require("express");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cart.controller");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { cartItemSchema } = require("../validators/cart.schema");

const router = express.Router();

router.get("/", requireAuth, getCart);
router.post("/items", requireAuth, validate(cartItemSchema), addItem);
router.patch("/items/:productId", requireAuth, validate(cartItemSchema), updateItem);
router.delete("/items/:productId", requireAuth, removeItem);
router.delete("/clear", requireAuth, clearCart);

module.exports = router;
