import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { categoryUpload } from "@/app/middlewares/upload/categoryUpload";
import { asyncHandler } from "@/utils/async-handler";
import {
  getCategoriesPublicHandler,
  getRootCategoriesHandler,
  getFeaturedCategoriesHandler,
  getCategoryTreeHandler,
  getCategoryBySlugHandler,
  getCategoriesAdminHandler,
  getAllCategoriesHandler,
  getRootCategoriesForAdminHandler,
  getCategoryDetailHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
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
  listCategoriesQuerySchema,
  featuredCategoriesQuerySchema,
  categoryParamsSchema,
  categorySlugParamsSchema,
  categoryIdParamSchema,
  attributeIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
  reorderCategorySchema,
} from "./category.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — static
router.get("/", validate(listCategoriesQuerySchema, "query"), asyncHandler(getCategoriesPublicHandler));
router.get("/roots", asyncHandler(getRootCategoriesHandler));
router.get("/featured", validate(featuredCategoriesQuerySchema, "query"), asyncHandler(getFeaturedCategoriesHandler));
router.get("/tree", asyncHandler(getCategoryTreeHandler));

// Public — param + suffix
router.get("/slug/:slug", validate(categorySlugParamsSchema, "params"), asyncHandler(getCategoryBySlugHandler));

// Admin — static
router.get("/admin", ...adminAuth, validate(listCategoriesQuerySchema, "query"), asyncHandler(getCategoriesAdminHandler));
router.post("/admin", ...adminAuth, categoryUpload.single("imageUrl"), validate(createCategorySchema, "body"), asyncHandler(createCategoryHandler));
router.get("/admin/all", ...adminAuth, asyncHandler(getAllCategoriesHandler));
router.get("/admin/roots", ...adminAuth, asyncHandler(getRootCategoriesForAdminHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedCategoriesHandler));
router.post("/admin/reorder", ...adminAuth, validate(reorderCategorySchema, "body"), asyncHandler(reorderCategoryHandler));

// Attributes & Specifications — static (trước /:id để tránh conflict)
router.get("/attributes/all", ...adminAuth, asyncHandler(getAllAttributesHandler));
router.get("/specifications/all", ...adminAuth, asyncHandler(getAllSpecificationsHandler));

// Admin — param + suffix
router.post("/admin/:id/restore", ...adminAuth, validate(categoryParamsSchema, "params"), asyncHandler(restoreCategoryHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(categoryParamsSchema, "params"), asyncHandler(hardDeleteCategoryHandler));

// Admin — param only
router.get("/admin/:id", ...adminAuth, validate(categoryParamsSchema, "params"), asyncHandler(getCategoryDetailHandler));
router.patch("/admin/:id", ...adminAuth, categoryUpload.single("imageUrl"), validate(categoryParamsSchema, "params"), validate(updateCategorySchema, "body"), asyncHandler(updateCategoryHandler));
router.delete("/admin/:id", ...adminAuth, validate(categoryParamsSchema, "params"), asyncHandler(deleteCategoryHandler));

// Param + suffix — public (template dùng cho form tạo sản phẩm)
router.get("/:categoryId/template", validate(categoryIdParamSchema, "params"), asyncHandler(getCategoryTemplateHandler));

// Attributes options — param + suffix
router.get("/attributes/:attributeId/options", ...adminAuth, validate(attributeIdParamSchema, "params"), asyncHandler(getAttributeOptionsHandler));

export default router;
