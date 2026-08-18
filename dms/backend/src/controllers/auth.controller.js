import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";
import User from "../models/User.js";

// Shared cookie options for the token, kept in one place so login/logout stay in sync
const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  maxAge: env.jwtCookieExpiresIn * 24 * 60 * 60 * 1000,
};

/**
 * POST /api/v1/auth/login
 * Public. Used by BOTH admin and worker — a single login form; the
 * user's role (stored on the User document) determines what they can
 * access afterwards, not which form they used to log in.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Explicitly select password since the schema hides it by default
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated. Contact your admin.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);

  res
    .status(200)
    .cookie("dms_token", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          token,
        },
        "Logged in successfully"
      )
    );
});

/**
 * POST /api/v1/auth/register
 * Admin-only. This is how worker (and additional admin) LOGIN ACCOUNTS get
 * created. Note: this is distinct from the future "Worker profile" (area,
 * commission %, assigned shops) built in Phase 3 — this endpoint only
 * creates the authentication identity. The Worker CRUD flow in Phase 3 will
 * call this internally when an admin adds a new worker, then create the
 * linked Worker profile document in the same request.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (role && !["admin", "worker"].includes(role)) {
    throw new ApiError(400, "Role must be either 'admin' or 'worker'");
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "worker",
    phone,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { id: user._id, name: user.name, email: user.email, role: user.role },
        "User account created successfully"
      )
    );
});

/**
 * GET /api/v1/auth/me
 * Protected. Returns the currently authenticated user — used by the
 * frontend on app load to validate/refresh the session from a stored token.
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
      },
      "Current user fetched"
    )
  );
});

/**
 * POST /api/v1/auth/logout
 * Protected. JWTs are stateless, so this just clears the httpOnly cookie —
 * the frontend is responsible for discarding its own copy of the token.
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("dms_token", cookieOptions);
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});
