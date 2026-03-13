const ApiError = require("../utils/ApiError");
const Supplier = require("../middleware/models/Supplier");

const listSuppliers = async (req, res) => {
  const items = await Supplier.find().sort({ name: 1 });
  res.json({ data: items });
};

const createSupplier = async (req, res, next) => {
  const supplier = await Supplier.create(req.validated.body);
  res.status(201).json({ data: supplier });
};

const updateSupplier = async (req, res, next) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.validated.body, {
    new: true
  });
  if (!supplier) {
    return next(new ApiError(404, "Supplier not found"));
  }
  return res.json({ data: supplier });
};

const deleteSupplier = async (req, res, next) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) {
    return next(new ApiError(404, "Supplier not found"));
  }
  return res.status(204).send();
};

module.exports = {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
