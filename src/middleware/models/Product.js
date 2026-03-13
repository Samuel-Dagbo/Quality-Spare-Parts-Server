const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    partNumber: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    buyingPrice: { type: Number, min: 0 },
    stockQty: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 5, min: 0 },
    images: [{ type: String }],
    tags: [{ type: String, trim: true }],
    dateAdded: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", sku: "text", tags: "text" });

module.exports = mongoose.model("Product", ProductSchema);
