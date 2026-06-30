import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { categoryUpload } from "@/app/middlewares/upload/upload.config";
import { asyncHandler } from "@/utils/async-handler";
import * as controller from "./category.controller";
import * as validator from "./category.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — static
router.get("/", validate(validator.listCategoriesQuerySchema, "query"), asyncHandler(controller.getCategoriesPublicHandler));
router.get("/roots", asyncHandler(controller.getRootCategoriesHandler));
router.get("/featured", validate(validator.featuredCategoriesQuerySchema, "query"), asyncHandler(controller.getFeaturedCategoriesHandler));
router.get("/tree", asyncHandler(controller.getCategoryTreeHandler));

router.get("/resolve", validate(validator.resolveCategoryQuerySchema, "query"), asyncHandler(controller.resolveCategoryHandler));

router.get("/:id/children", asyncHandler(controller.getCategoriesChildrenHandler));

// Public — param + suffix
router.get("/slug/:slug", validate(validator.categorySlugParamsSchema, "params"), asyncHandler(controller.getCategoryBySlugHandler));

// Admin — static
router.get("/admin", ...adminAuth, validate(validator.listCategoriesQuerySchema, "query"), asyncHandler(controller.getCategoriesAdminHandler));
router.post("/admin", ...adminAuth, categoryUpload.single("imageUrl"), asyncHandler(controller.createCategoryHandler));
router.get("/admin/all", ...adminAuth, asyncHandler(controller.getAllCategoriesHandler));
router.get("/admin/roots", ...adminAuth, asyncHandler(controller.getRootCategoriesForAdminHandler));
router.get("/admin/trash", ...adminAuth, validate(validator.deletedCategoriesQuerySchema, "query"), asyncHandler(controller.getDeletedCategoriesHandler));
router.post("/admin/reorder", ...adminAuth, validate(validator.reorderCategorySchema, "body"), asyncHandler(controller.reorderCategoryHandler));

// Attributes & Specifications — static (trước /:id để tránh conflict)
router.get("/attributes/all", ...adminAuth, asyncHandler(controller.getAllAttributesHandler));
router.get("/specifications/all", ...adminAuth, asyncHandler(controller.getAllSpecificationsHandler));

// Admin — param + suffix
router.post("/admin/:id/restore", ...adminAuth, validate(validator.categoryParamsSchema, "params"), asyncHandler(controller.restoreCategoryHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(validator.categoryParamsSchema, "params"), asyncHandler(controller.hardDeleteCategoryHandler));

// Admin — param only
router.get("/admin/:id", ...adminAuth, validate(validator.categoryParamsSchema, "params"), asyncHandler(controller.getCategoryDetailHandler));
// Không validate body ở đây vì body là multipart — field data là JSON string
// Controller tự gọi parseMultipartData + updateCategorySchema.parse sau khi giải nén
router.patch("/admin/:id", ...adminAuth, categoryUpload.single("imageUrl"), validate(validator.categoryParamsSchema, "params"), asyncHandler(controller.updateCategoryHandler));
router.delete("/admin/:id", ...adminAuth, validate(validator.categoryParamsSchema, "params"), asyncHandler(controller.deleteCategoryHandler));

// Param + suffix — public (template dùng cho form tạo sản phẩm)
router.get("/:categoryId/template", validate(validator.categoryIdParamSchema, "params"), asyncHandler(controller.getCategoryTemplateHandler));

// Attributes options — param + suffix
router.get("/attributes/:attributeId/options", ...adminAuth, validate(validator.attributeIdParamSchema, "params"), asyncHandler(controller.getAttributeOptionsHandler));

export default router;
