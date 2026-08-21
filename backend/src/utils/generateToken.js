import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Signs a JWT carrying the user's id and role.
 * Role is embedded in the token itself so `authorize()` middleware can check
 * permissions without a DB lookup on every single request — only `protect()`
 * hits the DB (to confirm the user still exists/is active).
 */
export const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};
