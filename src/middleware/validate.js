const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!result.success) {
    const details = result.error.flatten();
    return next(new ApiError(400, "Validation error", details));
  }

  req.validated = result.data;
  return next();
};

module.exports = { validate };