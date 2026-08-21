import { Router } from "express";

import { createShop, getShops, getShopById, updateShop, deleteShop } from "../controllers/shop.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Both roles can read (workers need their assigned shops to create orders);
// writes are admin-only.
router.use(protect);

router.get("/", getShops);
router.get("/:id", getShopById);
router.post("/", authorize("admin"), createShop);
router.put("/:id", authorize("admin"), updateShop);
router.delete("/:id", authorize("admin"), deleteShop);

export default router;
