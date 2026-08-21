import { Router } from "express";

import {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getMyWorkerProfile,
} from "../controllers/worker.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

// Worker self-service — must be registered before "/:id" or Express would
// match "me" as an :id param instead. The only non-admin route in this file.
router.get("/me", authorize("worker"), getMyWorkerProfile);

// Everything else is admin-only worker management
router.get("/", authorize("admin"), getWorkers);
router.get("/:id", authorize("admin"), getWorkerById);
router.post("/", authorize("admin"), createWorker);
router.put("/:id", authorize("admin"), updateWorker);
router.delete("/:id", authorize("admin"), deleteWorker);

export default router;
