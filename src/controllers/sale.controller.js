const ApiError = require("../utils/ApiError");
const Sale = require("../middleware/models/Sale");
const Product = require("../middleware/models/Product");
const InventoryLog = require("../middleware/models/InventoryLog");

const listSales = async (req, res) => {
  const { from, to } = req.query;
  const query = {};
  if (from || to) {
    query.saleDate = {};
    if (from) query.saleDate.$gte = new Date(from);
    if (to) query.saleDate.$lte = new Date(to);
  }

  const items = await Sale.find(query)
    .populate("createdBy", "name")
    .sort({ saleDate: -1 })
    .limit(200);

  res.json({ data: items });
};

const createSale = async (req, res, next) => {
  const { customerName, customerContact, paymentMethod, items } = req.validated.body;

  const saleItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      return next(new ApiError(404, "Product not found"));
    }
    if (product.stockQty < item.quantity) {
      return next(new ApiError(400, `Insufficient stock for ${product.name}`));
    }

    saleItems.push({
      product: product._id,
      name: product.name,
      partNumber: product.partNumber || product.sku,
      sellingPrice: product.price,
      quantity: item.quantity
    });
    totalAmount += product.price * item.quantity;
  }

  const sale = await Sale.create({
    customerName,
    customerContact,
    paymentMethod,
    items: saleItems,
    totalAmount,
    createdBy: req.user?._id
  });

  for (const item of saleItems) {
    const product = await Product.findById(item.product);
    const beforeQty = product.stockQty;
    const afterQty = beforeQty - item.quantity;

    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQty: -item.quantity, quantity: -item.quantity }
    });

    await InventoryLog.create({
      product: item.product,
      type: "sale",
      quantity: item.quantity,
      beforeQty,
      afterQty,
      source: "sale",
      referenceId: sale._id,
      createdBy: req.user?._id
    });
  }

  res.status(201).json({ data: sale });
};

module.exports = { listSales, createSale };
