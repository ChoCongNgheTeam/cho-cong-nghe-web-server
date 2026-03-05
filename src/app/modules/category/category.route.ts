import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { categoryUpload } from "@/app/middlewares/upload/categoryUpload";
import {
  getCategoriesPublicHandler,
  getCategoriesAdminHandler,
  getRootCategoriesHandler,
  getFeaturedCategoriesHandler,
  getCategoryTreeHandler,
  getCategoryBySlugHandler,
  getRootCategoriesForAdminHandler,
  getCategoryDetailHandler,
  createCategoryHandler,
  updateCategoryHandler,
  softDeleteCategoryHandler,
  restoreCategoryHandler,
  hardDeleteCategoryHandler,
  getDeletedCategoriesHandler,
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
  categoryParamsSchema,
  categorySlugParamsSchema,
  listCategoriesQuerySchema,
  featuredCategoriesQuerySchema,
} from "./category.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// ==================== PUBLIC ====================
router.get("/", validate(listCategoriesQuerySchema, "query"), asyncHandler(getCategoriesPublicHandler));
router.get("/roots", validate(listCategoriesQuerySchema, "query"), asyncHandler(getRootCategoriesHandler));
router.get("/featured", validate(featuredCategoriesQuerySchema, "query"), asyncHandler(getFeaturedCategoriesHandler));
router.get("/tree", asyncHandler(getCategoryTreeHandler));
router.get("/slug/:slug", authMiddleware(false), validate(categorySlugParamsSchema, "params"), asyncHandler(getCategoryBySlugHandler));

// ==================== STAFF & ADMIN ====================
router.use("/admin", authMiddleware(true));

// Xem danh sách và chi tiết (Staff + Admin)
router.get("/admin/all", requireRole("STAFF", "ADMIN"), validate(listCategoriesQuerySchema, "query"), asyncHandler(getCategoriesAdminHandler));
router.get("/admin/roots", requireRole("STAFF", "ADMIN"), asyncHandler(getRootCategoriesForAdminHandler));
router.get("/admin/:id", requireRole("STAFF", "ADMIN"), validate(categoryParamsSchema, "params"), asyncHandler(getCategoryDetailHandler));

// Xem cấu hình Attributes/Specs (Staff + Admin)
router.get("/admin/attributes/all", requireRole("STAFF", "ADMIN"), asyncHandler(getAllAttributesHandler));
router.get("/admin/attributes/:attributeId/options", requireRole("STAFF", "ADMIN"), validate(attributeIdParamSchema, "params"), asyncHandler(getAttributeOptionsHandler));
router.get("/admin/specifications/all", requireRole("STAFF", "ADMIN"), asyncHandler(getAllSpecificationsHandler));
router.get("/admin/:categoryId/template", requireRole("STAFF", "ADMIN"), validate(categoryIdParamSchema, "params"), asyncHandler(getCategoryTemplateHandler));

// Sắp xếp (Admin Only)
router.post("/admin/reorder", requireRole("ADMIN"), validate(reorderCategorySchema, "body"), asyncHandler(reorderCategoryHandler));

// Tạo và Cập nhật (Admin Only)
router.post("/admin", requireRole("ADMIN"), categoryUpload.single("imageUrl"), validate(createCategorySchema, "body"), asyncHandler(createCategoryHandler));
router.patch("/admin/:id", requireRole("ADMIN"), categoryUpload.single("imageUrl"), validate(categoryParamsSchema, "params"), validate(updateCategorySchema, "body"), asyncHandler(updateCategoryHandler));

// Soft Delete (Staff + Admin)
router.delete("/admin/:id", requireRole("STAFF", "ADMIN"), validate(categoryParamsSchema, "params"), asyncHandler(softDeleteCategoryHandler));

// Thùng rác & Xóa vĩnh viễn (Admin Only)
router.get("/admin/trash/categories", requireRole("ADMIN"), validate(listCategoriesQuerySchema, "query"), asyncHandler(getDeletedCategoriesHandler));
router.post("/admin/:id/restore", requireRole("ADMIN"), validate(categoryParamsSchema, "params"), asyncHandler(restoreCategoryHandler));
router.delete("/admin/:id/permanent", requireRole("ADMIN"), validate(categoryParamsSchema, "params"), asyncHandler(hardDeleteCategoryHandler));

export default router;