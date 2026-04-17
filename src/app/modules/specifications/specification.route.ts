import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getSpecificationsActiveHandler,
  getSpecificationsAdminHandler,
  getSpecificationDetailHandler,
  createSpecificationHandler,
  updateSpecificationHandler,
  toggleSpecificationActiveHandler,
  getCategorySpecsHandler,
  upsertCategorySpecHandler,
  bulkUpsertCategorySpecsHandler,
  removeCategorySpecHandler,
} from "./specification.controller";

const router = Router();
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", asyncHandler(getSpecificationsActiveHandler));

// Admin
router.get("/admin/all", ...adminAuth, asyncHandler(getSpecificationsAdminHandler));
router.post("/admin", ...adminAuth, asyncHandler(createSpecificationHandler));
router.get("/admin/:id", ...adminAuth, asyncHandler(getSpecificationDetailHandler));
router.patch("/admin/:id", ...adminAuth, asyncHandler(updateSpecificationHandler));
router.patch("/admin/:id/toggle", ...adminAuth, asyncHandler(toggleSpecificationActiveHandler));
router.get("/admin/category-specs/:categoryId", ...adminAuth, asyncHandler(getCategorySpecsHandler));
router.post("/admin/category-specs/:categoryId/upsert", ...adminAuth, asyncHandler(upsertCategorySpecHandler));
router.put("/admin/category-specs/:categoryId/bulk", ...adminAuth, asyncHandler(bulkUpsertCategorySpecsHandler));
router.delete("/admin/category-specs/:categoryId/:specificationId", ...adminAuth, asyncHandler(removeCategorySpecHandler));

export default router;
