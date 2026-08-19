/**
 * Custom application error class.
 *
 * Throw this from controllers/services instead of generic Error so the
 * global error handler can distinguish "expected" operational errors
 * (bad input, not found, unauthorized) from unexpected bugs, and respond
 * with the correct HTTP status + a clean message instead of a stack trace.
 *
 * Usage:
 *   throw new ApiError(404, "Shop not found");
 *   throw new ApiError(400, "Invalid input", [{ field: "email", message: "Required" }]);
 */
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true; // distinguishes known errors from programming bugs

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
