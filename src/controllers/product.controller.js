const ApiError = require("../utils/ApiError");
const { getPagination } = require("../utils/paginate");
const Product = require("../middleware/models/Product");

const buildSort = (sort) => {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "stock_desc":
      return { stockQty: -1 };
    case "newest":
      return { createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
};

const normalizePayload = (payload) => {
  const data = { ...payload };

  if (data.partNumber && !data.sku) data.sku = data.partNumber;
  if (data.sku && !data.partNumber) data.partNumber = data.sku;

  if (typeof data.sellingPrice === "number" && typeof data.price !== "number") {
    data.price = data.sellingPrice;
  }
  if (typeof data.price === "number" && typeof data.sellingPrice !== "number") {
    data.sellingPrice = data.price;
  }

  if (typeof data.buyingPrice === "number" && typeof data.costPrice !== "number") {
    data.costPrice = data.buyingPrice;
  }
  if (typeof data.costPrice === "number" && typeof data.buyingPrice !== "number") {
    data.buyingPrice = data.costPrice;
  }

  if (typeof data.quantity === "number" && typeof data.stockQty !== "number") {
    data.stockQty = data.quantity;
  }
  if (typeof data.stockQty === "number" && typeof data.quantity !== "number") {
    data.quantity = data.stockQty;
  }

  if (!data.dateAdded) data.dateAdded = new Date();
  return data;
};

const listProducts = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    q,
    category,
    brand,
    supplier,
    minPrice,
    maxPrice,
    inStock,
    isActive,
    sort
  } = req.query;

  const query = {};
  if (q) {
    query.$text = { $search: q };
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (supplier) query.supplier = supplier;
  if (typeof isActive !== "undefined") query.isActive = isActive === "true";
  if (inStock === "true") query.stockQty = { $gt: 0 };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const [items, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("supplier", "name")
      .sort(buildSort(sort))
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query)
  ]);

  res.json({
    data: items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
};

const getProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("brand", "name slug")
    .populate("supplier", "name");
  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }
  return res.json({ data: product });
};

const createProduct = async (req, res, next) => {
  try {
    const data = normalizePayload(req.validated.body);
    const product = await Product.create(data);
    return res.status(201).json({ data: product });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Duplicate SKU"));
    }
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = normalizePayload(req.validated.body);
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true
    });
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.json({ data: product });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Duplicate SKU"));
    }
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }
  return res.status(204).send();
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
