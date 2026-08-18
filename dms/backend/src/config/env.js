import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized environment configuration.
 * Every other file in the app should import `env` from here instead of
 * reading `process.env` directly. This makes it obvious what config the
 * app depends on, and gives us one place to validate required variables.
 */
const requiredVars = ["MONGODB_URI", "JWT_SECRET"];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line no-console
  console.warn(
    `[env] Warning: missing environment variables: ${missing.join(", ")}. ` +
      "Copy .env.example to .env and fill in the values."
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongoUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "7", 10),

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "200", 10),
  },

  isProduction: process.env.NODE_ENV === "production",
};
