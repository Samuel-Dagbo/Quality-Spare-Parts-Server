const ApiError = require("../utils/ApiError");
const Cart = require("../middleware/models/Cart");
const Product = require("../middleware/models/Product");

const calculateSubTotal = (items) =>
  items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name sku price stockQty images"
  );

  if (!cart) {
    return res.json({ data: { user: req.user._id, items: [], subTotal: 0 } });
  }

  return res.json({ data: cart });
};

const addItem = async (req, res, next) => {
  const { productId, quantity } = req.validated.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ApiError(404, "Product not found"));
  }
  if (product.stockQty < quantity) {
    return next(new ApiError(400, "Insufficient stock"));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    const newCart = await Cart.create({
      user: req.user._id,
      items: [{ product: product._id, quantity, priceSnapshot: product.price }],
      subTotal: product.price * quantity
    });
    return res.status(201).json({ data: newCart });
  }

  const existing = cart.items.find((item) => item.product.toString() === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (product.stockQty < newQty) {
      return next(new ApiError(400, "Insufficient stock"));
    }
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: product._id, quantity, priceSnapshot: product.price });
  }

  cart.subTotal = calculateSubTotal(cart.items);
  cart.updatedAt = new Date();
  await cart.save();

  return res.json({ data: cart });
};

const updateItem = async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.validated.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, "Cart not found"));
  }

  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (!item) {
    return next(new ApiError(404, "Item not found"));
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ApiError(404, "Product not found"));
  }
  if (product.stockQty < quantity) {
    return next(new ApiError(400, "Insufficient stock"));
  }

  item.quantity = quantity;
  item.priceSnapshot = product.price;
  cart.subTotal = calculateSubTotal(cart.items);
  cart.updatedAt = new Date();
  await cart.save();

  return res.json({ data: cart });
};

const removeItem = async (req, res, next) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, "Cart not found"));
  }

  cart.items = cart.items.filter((entry) => entry.product.toString() !== productId);
  cart.subTotal = calculateSubTotal(cart.items);
  cart.updatedAt = new Date();
  await cart.save();

  return res.json({ data: cart });
};

const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], subTotal: 0, updatedAt: new Date() },
    { new: true }
  );
  return res.status(204).send();
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
