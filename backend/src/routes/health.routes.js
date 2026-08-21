import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

/**
 * GET /api/v1/health
 * Simple liveness check — confirms the API + response envelope work
 * end-to-end before any real features are built on top.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.status(200).json(
      new ApiResponse(
        200,
        { uptime: process.uptime(), timestamp: new Date().toISOString() },
        "DMS API is healthy"
      )
    );
  })
);

export default router;
