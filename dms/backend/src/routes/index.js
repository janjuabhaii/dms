import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import workerRoutes from "./worker.routes.js";
import shopRoutes from "./shop.routes.js";
import orderRoutes from "./order.routes.js";
import notificationRoutes from "./notification.routes.js";
import reportRoutes from "./report.routes.js";

/**
 * Central route mounting point.
 * Phase 2 added authentication. Phase 4 added Products. Phase 5 added
 * Workers. Phase 6 added Shops. Phase 7/8 added Orders. Phase 9 added
 * Notifications. Phase 10 adds Reports/Analytics.
 */
const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/workers", workerRoutes);
router.use("/shops", shopRoutes);
router.use("/orders", orderRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);

export default router;
