import { Router } from "express";
import * as categoryController from "./category.controller";

const router = Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes (sẽ thêm middleware auth + admin sau)
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
