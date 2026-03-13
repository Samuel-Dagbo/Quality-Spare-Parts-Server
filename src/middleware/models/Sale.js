const mongoose = require("mongoose");

const SaleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    partNumber: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const SaleSchema = new mongoose.Schema(
  {
    items: [SaleItemSchema],
    customerName: { type: String, required: true },
    customerContact: { type: String },
    paymentMethod: { type: String, enum: ["cash", "momo", "card"], required: true },
    totalAmount: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
