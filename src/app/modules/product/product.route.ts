import { Router } from "express";
import * as productController from "./product.controller";

const router = Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Admin routes
router.post("/", productController.createProduct);
router.patch("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
