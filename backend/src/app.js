import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ---- Security & core middleware ---------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // JSON body parsing
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging: concise in prod, verbose (dev) locally
app.use(morgan(env.isProduction ? "combined" : "dev"));

// Basic API-wide rate limiting (tightened per-route later for auth endpoints)
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// ---- Routes --------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "DMS API root. See /api/v1/health for status." });
});

app.use("/api/v1", apiRoutes);

// ---- 404 + error handling (must be last, in this order) -------------------
app.use(notFound);
app.use(errorHandler);

export default app;
