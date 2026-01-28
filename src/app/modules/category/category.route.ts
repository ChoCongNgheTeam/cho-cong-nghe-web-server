import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  getRootCategoriesHandler,
  getFeaturedCategoriesHandler,
  getCategoryTreeHandler,
  getCategoryBySlugHandler,
  getAllCategoriesHandler,
  getRootCategoriesForAdminHandler,
  getCategoryDetailHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  reorderCategoryHandler,
} from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategorySchema,
} from "./category.validation";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";

const router = Router();

// Public

router.get("/roots", getRootCategoriesHandler);

// Lấy featured categories cho home (orchestrator sẽ dùng)
// Query params: ?limit=6 (optional)
router.get("/featured", getFeaturedCategoriesHandler);

// Lấy category tree cho menu (nested structure)
router.get("/tree", getCategoryTreeHandler);

router.get("/slug/:slug", getCategoryBySlugHandler);

// Admin only
router.get("/admin/all", authMiddleware, requireRole("ADMIN"), getAllCategoriesHandler);

router.get("/admin/roots", authMiddleware, requireRole("ADMIN"), getRootCategoriesForAdminHandler);

router.get("/admin/:id", authMiddleware, requireRole("ADMIN"), getCategoryDetailHandler);

router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createCategorySchema),
  createCategoryHandler,
);

router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateCategorySchema),
  updateCategoryHandler,
);

router.delete("/admin/:id", authMiddleware, requireRole("ADMIN"), deleteCategoryHandler);

router.post(
  "/admin/reorder",
  authMiddleware,
  requireRole("ADMIN"),
  validate(reorderCategorySchema),
  reorderCategoryHandler,
);

export default router;
