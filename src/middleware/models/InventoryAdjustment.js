const mongoose = require("mongoose");

const InventoryAdjustmentSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["in", "out", "adjust"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryAdjustment", InventoryAdjustmentSchema);
