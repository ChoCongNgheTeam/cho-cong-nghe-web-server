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

const router = Router();

// Public
router.get("/", validate(listCategoriesQuerySchema, "query"), getCategoriesPublicHandler);
router.get("/roots", getRootCategoriesHandler);
router.get("/featured", validate(featuredCategoriesQuerySchema, "query"), getFeaturedCategoriesHandler);
router.get("/tree", getCategoryTreeHandler);
router.get("/slug/:slug", validate(categorySlugParamsSchema, "params"), getCategoryBySlugHandler);

// Admin
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listCategoriesQuerySchema, "query"), getCategoriesAdminHandler);

router.get("/admin/roots", authMiddleware(), requireRole("ADMIN"), getRootCategoriesForAdminHandler);

router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(categoryParamsSchema, "params"), getCategoryDetailHandler);

router.post("/admin", authMiddleware(), requireRole("ADMIN"), categoryUpload.single("imageUrl"), validate(createCategorySchema, "body"), createCategoryHandler);

router.patch(
  "/admin/:id",
  authMiddleware(),
  requireRole("ADMIN"),
  categoryUpload.single("imageUrl"),
  validate(categoryParamsSchema, "params"),
  validate(updateCategorySchema, "body"),
  updateCategoryHandler,
);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(categoryParamsSchema, "params"), deleteCategoryHandler);

router.post("/admin/reorder", authMiddleware(), requireRole("ADMIN"), validate(reorderCategorySchema, "body"), reorderCategoryHandler);

router.get("/:categoryId/template", authMiddleware(), requireRole("ADMIN"), validate(categoryIdParamSchema, "params"), getCategoryTemplateHandler);

router.get("/attributes/all", authMiddleware(), requireRole("ADMIN"), getAllAttributesHandler);

router.get("/attributes/:attributeId/options", authMiddleware(), requireRole("ADMIN"), validate(attributeIdParamSchema, "params"), getAttributeOptionsHandler);

router.get("/specifications/all", authMiddleware(), requireRole("ADMIN"), getAllSpecificationsHandler);

export default router;
