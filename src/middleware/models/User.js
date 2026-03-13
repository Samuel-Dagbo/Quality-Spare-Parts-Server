const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
    phone: { type: String, trim: true },
    address: AddressSchema,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
