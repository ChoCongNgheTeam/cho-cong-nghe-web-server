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
  categoryParamsSchema,
  categorySlugParamsSchema,
  listCategoriesQuerySchema,
  featuredCategoriesQuerySchema,
} from "./category.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listCategoriesQuerySchema, "query"), asyncHandler(getCategoriesPublicHandler));

// Tĩnh trước, động sau — tránh conflict với /:id hay /:categoryId
router.get("/roots", asyncHandler(getRootCategoriesHandler));
router.get("/featured", validate(featuredCategoriesQuerySchema, "query"), asyncHandler(getFeaturedCategoriesHandler));
router.get("/tree", asyncHandler(getCategoryTreeHandler));
router.get("/slug/:slug", validate(categorySlugParamsSchema, "params"), asyncHandler(getCategoryBySlugHandler));

// Admin
router.get("/admin/all", ...adminAuth, validate(listCategoriesQuerySchema, "query"), asyncHandler(getCategoriesAdminHandler));
router.get("/admin/roots", ...adminAuth, asyncHandler(getRootCategoriesForAdminHandler));

router.post("/admin/reorder", ...adminAuth, validate(reorderCategorySchema, "body"), asyncHandler(reorderCategoryHandler));

router.get("/attributes/all", ...adminAuth, asyncHandler(getAllAttributesHandler));
router.get("/attributes/:attributeId/options", ...adminAuth, validate(attributeIdParamSchema, "params"), asyncHandler(getAttributeOptionsHandler));

router.get("/specifications/all", ...adminAuth, asyncHandler(getAllSpecificationsHandler));

// Admin — động
router.get("/admin/:id", ...adminAuth, validate(categoryParamsSchema, "params"), asyncHandler(getCategoryDetailHandler));

router.post("/admin", ...adminAuth, categoryUpload.single("imageUrl"), validate(createCategorySchema, "body"), asyncHandler(createCategoryHandler));

router.patch("/admin/:id", ...adminAuth, categoryUpload.single("imageUrl"), validate(categoryParamsSchema, "params"), validate(updateCategorySchema, "body"), asyncHandler(updateCategoryHandler));

router.delete("/admin/:id", ...adminAuth, validate(categoryParamsSchema, "params"), asyncHandler(deleteCategoryHandler));

router.get("/:categoryId/template", ...adminAuth, validate(categoryIdParamSchema, "params"), asyncHandler(getCategoryTemplateHandler));

export default router;
