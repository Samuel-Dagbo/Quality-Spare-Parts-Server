const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const CustomerInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerInfo: CustomerInfoSchema,
    items: [OrderItemSchema],
    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
      default: "pending"
    },
    payment: {
      method: { type: String, default: "manual" },
      status: { type: String, default: "unpaid" },
      reference: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
