const ApiError = require("../utils/ApiError");
const Brand = require("../middleware/models/Brand");

const listBrands = async (req, res) => {
  const items = await Brand.find().sort({ name: 1 });
  res.json({ data: items });
};

const createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.validated.body);
    res.status(201).json({ data: brand });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Duplicate slug"));
    }
    return next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.validated.body, {
      new: true
    });
    if (!brand) {
      return next(new ApiError(404, "Brand not found"));
    }
    return res.json({ data: brand });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(409, "Duplicate slug"));
    }
    return next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    return next(new ApiError(404, "Brand not found"));
  }
  return res.status(204).send();
};

module.exports = {
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand
};
