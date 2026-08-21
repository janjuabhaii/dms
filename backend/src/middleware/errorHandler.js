import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

/**
 * Global error-handling middleware. Every error in the app (thrown ApiErrors,
 * Mongoose errors, JWT errors, or unexpected bugs) ends up here via
 * asyncHandler/next(err), so the API always returns one consistent JSON shape:
 *
 *   { success: false, statusCode, message, errors: [] }
 *
 * Must be registered LAST in app.js, after all routes.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize known non-ApiError cases into ApiError so the response is consistent
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal server error";

    // Mongoose invalid ObjectId
    if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid value for field: ${error.path}`;
    }

    // Mongoose duplicate key (e.g. unique email)
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = `Duplicate value for field: ${field}`;
    }

    // Mongoose schema validation errors
    if (error.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
    }

    // Multer upload errors (file too large, unexpected field, etc.)
    if (error.name === "MulterError") {
      statusCode = 400;
      message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Image file is too large (max 5MB)"
          : `Upload error: ${error.message}`;
    }

    // JWT errors
    if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid authentication token";
    }
    if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Authentication token has expired";
    }

    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    // Only leak stack traces in non-production environments
    ...(env.isProduction ? {} : { stack: error.stack }),
  };

  if (!env.isProduction && error.statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(error.statusCode).json(response);
};
