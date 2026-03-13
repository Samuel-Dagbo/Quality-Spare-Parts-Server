const ApiError = require("../utils/ApiError");
const InventoryAdjustment = require("../middleware/models/InventoryAdjustment");
const InventoryLog = require("../middleware/models/InventoryLog");
const Product = require("../middleware/models/Product");

const listAdjustments = async (req, res) => {
  const items = await InventoryAdjustment.find()
    .populate("product", "name sku")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ data: items });
};

const listLogs = async (req, res) => {
  const items = await InventoryLog.find()
    .populate("product", "name sku")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ data: items });
};

const createAdjustment = async (req, res, next) => {
  const { product: productId, type, quantity, reason } = req.validated.body;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }

  const beforeQty = product.stockQty;
  let newQty = product.stockQty;
  if (type === "in") {
    newQty = product.stockQty + quantity;
  } else if (type === "out") {
    if (product.stockQty - quantity < 0) {
      return next(new ApiError(400, "Insufficient stock for this adjustment"));
    }
    newQty = product.stockQty - quantity;
  } else if (type === "adjust") {
    newQty = quantity;
  }

  product.stockQty = newQty;
  product.quantity = newQty;
  await product.save();

  const adjustment = await InventoryAdjustment.create({
    product: product._id,
    type,
    quantity,
    reason,
    createdBy: req.user?._id
  });

  await InventoryLog.create({
    product: product._id,
    type,
    quantity,
    beforeQty,
    afterQty: newQty,
    source: "adjustment",
    referenceId: adjustment._id,
    createdBy: req.user?._id
  });

  res.status(201).json({ data: adjustment, product });
};

const lowStock = async (req, res) => {
  const items = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stockQty", "$reorderLevel"] }
  }).sort({ stockQty: 1 });

  res.json({ data: items });
};

module.exports = { listAdjustments, listLogs, createAdjustment, lowStock };
