import { Router } from "express";
import rateLimit from "express-rate-limit";

import { login, register, getMe, logout } from "../controllers/auth.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Login gets its own tighter limiter than the general API limiter in app.js —
// brute-forcing passwords is the main risk on this specific endpoint.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

router.post("/login", loginLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Only an existing admin can create new login accounts (admin or worker).
// There is intentionally no public self-registration in this system.
router.post("/register", protect, authorize("admin"), register);

export default router;
