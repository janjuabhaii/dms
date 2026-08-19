import { Router } from "express";

import {
  getDashboardSummary,
  getSalesReport,
  getWorkerPerformanceReport,
  getPendingPaymentsReport,
  getShopPurchaseHistoryReport,
  getCommissionReport,
} from "../controllers/report.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/dashboard-summary", getDashboardSummary);
router.get("/sales", getSalesReport);
router.get("/worker-performance", getWorkerPerformanceReport);
router.get("/pending-payments", getPendingPaymentsReport);
router.get("/shop-purchase-history", getShopPurchaseHistoryReport);
router.get("/commissions", getCommissionReport);

export default router;
