const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);
