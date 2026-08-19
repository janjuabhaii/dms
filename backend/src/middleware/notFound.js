import { ApiError } from "../utils/ApiError.js";

/**
 * Catches any request that didn't match a defined route and forwards
 * a clean 404 ApiError to the global error handler, instead of Express's
 * default HTML "Cannot GET /..." response.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};
