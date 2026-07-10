import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as controller from "./specification.controller";
import * as validator from "./specification.validation";

const router = Router();
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", asyncHandler(controller.getSpecificationsActiveHandler));

// Admin
router.get("/admin/all", ...adminAuth, validate(validator.listSpecificationsSchema, "query"), asyncHandler(controller.getSpecificationsAdminHandler));
router.post("/admin", ...adminAuth, validate(validator.createSpecificationSchema, "body"), asyncHandler(controller.createSpecificationHandler));
router.get("/admin/:id", ...adminAuth, validate(validator.specParamsSchema, "params"), asyncHandler(controller.getSpecificationDetailHandler));
router.patch("/admin/:id", ...adminAuth, validate(validator.specParamsSchema, "params"), validate(validator.updateSpecificationSchema, "body"), asyncHandler(controller.updateSpecificationHandler));
router.patch("/admin/:id/toggle", ...adminAuth, validate(validator.specParamsSchema, "params"), asyncHandler(controller.toggleSpecificationActiveHandler));
router.get("/admin/category-specs/:categoryId", ...adminAuth, validate(validator.categorySpecParamsSchema, "params"), asyncHandler(controller.getCategorySpecsHandler));
router.post(
  "/admin/category-specs/:categoryId/upsert",
  ...adminAuth,
  validate(validator.categorySpecParamsSchema, "params"),
  validate(validator.upsertCategorySpecSchema, "body"),
  asyncHandler(controller.upsertCategorySpecHandler),
);
router.put(
  "/admin/category-specs/:categoryId/bulk",
  ...adminAuth,
  validate(validator.categorySpecParamsSchema, "params"),
  validate(validator.bulkUpsertCategorySpecsSchema, "body"),
  asyncHandler(controller.bulkUpsertCategorySpecsHandler),
);
router.delete("/admin/category-specs/:categoryId/:specificationId", ...adminAuth, validate(validator.removeCategorySpecParamsSchema, "params"), asyncHandler(controller.removeCategorySpecHandler));

export default router;
