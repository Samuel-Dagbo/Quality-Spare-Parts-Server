const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("./models/User");

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return next(new ApiError(401, "Authentication required"));
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user || !user.isActive) {
      return next(new ApiError(401, "Invalid or inactive user"));
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Insufficient permissions"));
  }
  return next();
};

module.exports = { requireAuth, requireRole };
