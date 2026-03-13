const ApiError = require("../utils/ApiError");
const Category = require("../middleware/models/Category");

const listCategories = async (req, res) => {
  const items = await Category.find().sort({ name: 1 });
  res.json({ data: items });
};

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.validated.body);
    res.status(201).json({ data: category });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Duplicate slug"));
    }
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.validated.body, {
      new: true
    });
    if (!category) {
      return next(new ApiError(404, "Category not found"));
    }
    return res.json({ data: category });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Duplicate slug"));
    }
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new ApiError(404, "Category not found"));
  }
  return res.status(204).send();
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
