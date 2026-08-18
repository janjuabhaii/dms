import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

/**
 * Runs once per socket connection attempt, before "connection" fires.
 * The client sends its JWT via `io(url, { auth: { token } })` (not a header,
 * since the initial Socket.io handshake isn't a normal HTTP request the
 * axios interceptor touches) — verified here the same way `protect` verifies
 * it for REST requests, so a socket connection carries the same identity
 * guarantees as an API call.
 */
export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Not authenticated"));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new Error("Not authenticated"));
    }

    socket.user = { id: user._id.toString(), role: user.role, name: user.name };
    next();
  } catch (err) {
    next(new Error("Not authenticated"));
  }
};
