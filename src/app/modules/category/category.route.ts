import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  getRootCategoriesHandler,
  getFeaturedCategoriesHandler, // ✅ MỚI
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

// Lấy root categories cho home page
router.get("/roots", getRootCategoriesHandler);

// Lấy featured categories cho home (orchestrator sẽ dùng)
// Query params: ?limit=6 (optional)
router.get("/featured", getFeaturedCategoriesHandler);

// Lấy category tree cho menu (nested structure)
router.get("/tree", getCategoryTreeHandler);

// Lấy category theo slug (có children)
router.get("/slug/:slug", getCategoryBySlugHandler);

// Admin only
// Lấy tất cả categories (flat list với _count)
router.get("/admin/all", authMiddleware, requireRole("ADMIN"), getAllCategoriesHandler);

// Lấy root categories cho admin (có số lượng sub)
router.get("/admin/roots", authMiddleware, requireRole("ADMIN"), getRootCategoriesForAdminHandler);

// Lấy category detail với children (click vào root)
router.get("/admin/:id", authMiddleware, requireRole("ADMIN"), getCategoryDetailHandler);

// Tạo category
router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createCategorySchema),
  createCategoryHandler,
);

// Update category
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateCategorySchema),
  updateCategoryHandler,
);

// Xóa category
router.delete("/admin/:id", authMiddleware, requireRole("ADMIN"), deleteCategoryHandler);

// Sắp xếp lại position
router.post(
  "/admin/reorder",
  authMiddleware,
  requireRole("ADMIN"),
  validate(reorderCategorySchema),
  reorderCategoryHandler,
);

export default router;
