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
  getCategoryTemplateHandler,
  getAllAttributesHandler,
  getAttributeOptionsHandler,
  getAllSpecificationsHandler,
} from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategorySchema,
  categoryIdParamSchema,
  attributeIdParamSchema,
} from "./category.validation";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";

const router = Router();

// =====================
// === PUBLIC ROUTES ===
// =====================

router.get("/roots", getRootCategoriesHandler);

// Lấy featured categories cho home
// Query params: ?limit=6 (optional)
router.get("/featured", getFeaturedCategoriesHandler);

// Lấy category tree cho menu (nested structure)
router.get("/tree", getCategoryTreeHandler);

router.get("/slug/:slug", getCategoryBySlugHandler);

// ========================
// === ADMIN ONLY ROUTES ===
// ========================

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

/**
 * GET /api/v1/categories/:categoryId/template
 * Lấy template (attributes + specifications) cho category
 */
router.get(
  "/:categoryId/template",
  authMiddleware,
  requireRole("ADMIN"),
  validate(categoryIdParamSchema, "params"),
  getCategoryTemplateHandler,
);

/**
 * GET /api/v1/categories/attributes/all
 * Lấy tất cả attributes (cho dropdown "Thêm attribute tuỳ chỉnh")
 */
router.get("/attributes/all", authMiddleware, requireRole("ADMIN"), getAllAttributesHandler);

/**
 * GET /api/v1/categories/attributes/:attributeId/options
 * Lấy options cho một attribute
 */
router.get(
  "/attributes/:attributeId/options",
  authMiddleware,
  requireRole("ADMIN"),
  validate(attributeIdParamSchema, "params"),
  getAttributeOptionsHandler,
);

/**
 * GET /api/v1/categories/specifications/all
 * Lấy tất cả specifications (cho dropdown "Thêm spec tuỳ chỉnh")
 */
router.get(
  "/specifications/all",
  authMiddleware,
  requireRole("ADMIN"),
  getAllSpecificationsHandler,
);

export default router;
