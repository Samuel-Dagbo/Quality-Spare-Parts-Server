const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err instanceof ApiError ? err.message : "Internal server error";
  const details = err instanceof ApiError ? err.details : null;

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large";
  }

  if (err.message === "Only image files are allowed") {
    statusCode = 400;
    message = err.message;
  }

  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      details
    }
  });
};

module.exports = { errorHandler };
