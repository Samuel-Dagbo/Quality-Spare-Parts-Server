const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const User = require("../middleware/models/User");

const listUsers = async (req, res) => {
  const items = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ data: items });
};

const createUser = async (req, res, next) => {
  const { name, email, password, role, phone, address, isActive } = req.validated.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ApiError(409, "Email already in use"));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    phone,
    address,
    isActive: typeof isActive === "boolean" ? isActive : true
  });

  return res.status(201).json({ data: user.toJSON() });
};

const updateUserRole = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.validated.body.role },
    { new: true }
  ).select("-passwordHash");
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }
  return res.json({ data: user });
};

const updateUserStatus = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.validated.body.isActive },
    { new: true }
  ).select("-passwordHash");
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }
  return res.json({ data: user });
};

module.exports = { listUsers, createUser, updateUserRole, updateUserStatus };
