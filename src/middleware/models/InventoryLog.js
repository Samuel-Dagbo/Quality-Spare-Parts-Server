const mongoose = require("mongoose");

const InventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["in", "out", "adjust", "sale", "order"], required: true },
    quantity: { type: Number, required: true },
    beforeQty: { type: Number, required: true },
    afterQty: { type: Number, required: true },
    source: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryLog", InventoryLogSchema);
