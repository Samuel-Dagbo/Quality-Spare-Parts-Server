const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../middleware/models/User");

const createToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const register = async (req, res, next) => {
  const { name, email, password, phone } = req.validated.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ApiError(409, "Email already in use"));
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role: "customer"
  });
  const token = createToken(user._id);
  res.status(201).json({
    user: user.toJSON(),
    token
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return next(new ApiError(401, "Invalid credentials"));
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return next(new ApiError(401, "Invalid credentials"));
  }
  const token = createToken(user._id);
  res.json({ user: user.toJSON(), token });
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
