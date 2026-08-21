import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

/**
 * Verifies the JWT (from the Authorization header or the httpOnly cookie)
 * and attaches the authenticated user to `req.user`. Any route behind this
 * middleware can assume `req.user` is a valid, active User document.
 *
 * Rejects with 401 for: missing token, malformed/expired token, or a user
 * that no longer exists / has been deactivated by the admin.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.dms_token) {
    token = req.cookies.dms_token;
  }

  if (!token) {
    throw new ApiError(401, "Not authenticated — no token provided");
  }

  // jwt.verify throws JsonWebTokenError/TokenExpiredError on failure,
  // which the global error handler already normalizes to a clean 401.
  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "The user for this token no longer exists");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated. Contact your admin.");
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Must run AFTER `protect`.
 *
 * Usage:
 *   router.post("/products", protect, authorize("admin"), createProduct);
 */
export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not authorized for this action`);
    }
    next();
  };
