import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Every product route requires a logged-in user (admin or worker)
router.use(protect);

router.get("/", getProducts);
router.get("/:id", getProductById);

// Writes are admin-only, and carry a single "image" file field
router.post("/", authorize("admin"), upload.single("image"), createProduct);
router.put("/:id", authorize("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authorize("admin"), deleteProduct);

export default router;
