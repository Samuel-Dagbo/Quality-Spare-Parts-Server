const Review = require("../middleware/models/Review");
const User = require("../middleware/models/User");
const Product = require("../middleware/models/Product");
const ApiError = require("../utils/ApiError");

const createReview = async (req, res) => {
  const { product, rating, comment } = req.validated.body;
  const userId = req.user._id || req.user.id;

  const productDoc = await Product.findById(product);
  if (!productDoc) throw new ApiError(404, "Product not found");

  const existing = await Review.findOne({ user: userId, product });
  if (existing) throw new ApiError(400, "You already reviewed this product");

  const review = await Review.create({ user: userId, product, rating, comment });
  res.status(201).json(review);
};

const getReviews = async (req, res) => {
  const { page = 1, limit = 10, product, approved } = req.query;
  const options = { page: parseInt(page), limit: parseInt(limit) };

  const filter = { approved: approved ? approved === "true" : true };
  if (product) filter.product = product;

  const reviews = await Review.paginate(filter, options);
  res.json(reviews);
};

const getReview = async (req, res) => {
  const review = await Review.findById(req.params.id).populate("user", "name email").populate("product", "name");
  if (!review) throw new ApiError(404, "Review not found");
  res.json(review);
};

const updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const userId = req.user._id || req.user.id;
  if (review.user.toString() !== userId.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized");
  }

  Object.assign(review, req.validated.body);
  await review.save();
  res.json(review);
};

const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const userId = req.user._id || req.user.id;
  if (review.user.toString() !== userId.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized");
  }

  await review.deleteOne();
  res.json({ message: "Review deleted" });
};

const approveReview = async (req, res) => {
  if (req.user.role !== "admin") throw new ApiError(403, "Admin only");

  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  review.approved = true;
  await review.save();
  res.json(review);
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  approveReview
};
