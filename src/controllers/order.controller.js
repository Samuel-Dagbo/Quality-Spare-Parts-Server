const ApiError = require("../utils/ApiError");
const Order = require("../middleware/models/Order");
const Product = require("../middleware/models/Product");
const InventoryAdjustment = require("../middleware/models/InventoryAdjustment");
const InventoryLog = require("../middleware/models/InventoryLog");

const listOrders = async (req, res) => {
  const query = req.user.role === "customer" ? { user: req.user._id } : {};
  const items = await Order.find(query).sort({ createdAt: -1 }).limit(200);
  res.json({ data: items });
};

const getOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(404, "Order not found"));
  }
  if (req.user.role === "customer" && order.user?.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, "Insufficient permissions"));
  }
  return res.json({ data: order });
};

const createOrder = async (req, res, next) => {
  const { customerInfo, items, paymentMethod } = req.validated.body;
  if (!items.length) {
    return next(new ApiError(400, "Order must include at least one item"));
  }

  const orderItems = [];
  let subTotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      return next(new ApiError(404, "Product not found"));
    }
    if (product.stockQty < item.quantity) {
      return next(new ApiError(400, `Insufficient stock for ${product.name}`));
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity
    });
    subTotal += product.price * item.quantity;
  }

  const tax = 0;
  const shipping = subTotal > 500 ? 0 : 25;
  const discount = 0;
  const grandTotal = subTotal + tax + shipping - discount;

  const order = await Order.create({
    user: req.user?._id,
    customerInfo,
    items: orderItems,
    subTotal,
    tax,
    shipping,
    discount,
    grandTotal,
    status: "pending",
    payment: {
      method: paymentMethod || "manual",
      status: "unpaid"
    }
  });

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    const beforeQty = product.stockQty;
    const afterQty = beforeQty - item.quantity;

    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQty: -item.quantity, quantity: -item.quantity }
    });

    await InventoryAdjustment.create({
      product: item.product,
      type: "out",
      quantity: item.quantity,
      reason: `Order ${order._id}`,
      createdBy: req.user?._id
    });

    await InventoryLog.create({
      product: item.product,
      type: "order",
      quantity: item.quantity,
      beforeQty,
      afterQty,
      source: "order",
      referenceId: order._id,
      createdBy: req.user?._id
    });
  }

  res.status(201).json({ data: order });
};

const updateOrderStatus = async (req, res, next) => {
  const { status } = req.validated.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) {
    return next(new ApiError(404, "Order not found"));
  }
  return res.json({ data: order });
};

// Quick sale currently mirrors standard order creation. Having a dedicated handler
// allows future tweaks (e.g., auto-marking as paid) without changing other routes.
const createQuickSale = (req, res, next) => createOrder(req, res, next);

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, createQuickSale };
