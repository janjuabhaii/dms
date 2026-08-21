import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

// Worker-facing routes. Registered before the admin "/:id" wildcard below —
// Express matches routes in registration order, and "/mine"/"/mine/:id" are
// literal paths that would otherwise get shadowed by "/:id" matching id="mine".
router.post("/", authorize("worker"), createOrder);
router.get("/mine", authorize("worker"), getMyOrders);
router.get("/mine/:id", authorize("worker"), getMyOrderById);

// Admin-facing routes (Phase 8) — view all orders, order detail, status changes.
router.get("/", authorize("admin"), getAllOrders);
router.get("/:id", authorize("admin"), getOrderById);
router.patch("/:id/status", authorize("admin"), updateOrderStatus);

export default router;
