const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ["cash", "momo", "card", "bank"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
    reference: { type: String },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
