import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { brandUpload } from "@/app/middlewares/upload/brandUpload";
import {
  getBrandsPublicHandler,
  getBrandsAdminHandler,
  getActiveBrandsHandler,
  getFeaturedBrandsHandler,
  getBrandBySlugHandler,
  getBrandDetailHandler,
  createBrandHandler,
  updateBrandHandler,
  softDeleteBrandHandler,
  restoreBrandHandler,
  hardDeleteBrandHandler,
  getDeletedBrandsHandler
} from "./brand.controller";
import { 
  createBrandSchema, 
  updateBrandSchema, 
  brandParamsSchema, 
  brandSlugParamsSchema, 
  featuredBrandsQuerySchema, 
  listBrandsQuerySchema 
} from "./brand.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// ==================== PUBLIC ====================
router.get("/", validate(listBrandsQuerySchema, "query"), asyncHandler(getBrandsPublicHandler));
router.get("/active", asyncHandler(getActiveBrandsHandler));
router.get("/featured", validate(featuredBrandsQuerySchema, "query"), asyncHandler(getFeaturedBrandsHandler));
router.get("/slug/:slug", authMiddleware(false), validate(brandSlugParamsSchema, "params"), asyncHandler(getBrandBySlugHandler));

// ==================== STAFF & ADMIN ====================
router.use("/admin", authMiddleware(true));

// Xem danh sách và chi tiết (Staff + Admin)
router.get("/admin/all", requireRole("STAFF", "ADMIN"), validate(listBrandsQuerySchema, "query"), asyncHandler(getBrandsAdminHandler));
router.get("/admin/:id", requireRole("STAFF", "ADMIN"), validate(brandParamsSchema, "params"), asyncHandler(getBrandDetailHandler));

// Tạo và Cập nhật (Admin Only)
router.post("/admin", requireRole("ADMIN"), brandUpload.single("imageUrl"), validate(createBrandSchema, "body"), asyncHandler(createBrandHandler));
router.patch("/admin/:id", requireRole("ADMIN"), brandUpload.single("imageUrl"), validate(brandParamsSchema, "params"), validate(updateBrandSchema, "body"), asyncHandler(updateBrandHandler));

// Soft Delete (Staff + Admin)
router.delete("/admin/:id", requireRole("STAFF", "ADMIN"), validate(brandParamsSchema, "params"), asyncHandler(softDeleteBrandHandler));

// Thùng rác & Xóa vĩnh viễn (Admin Only)
router.get("/admin/trash/brands", requireRole("ADMIN"), validate(listBrandsQuerySchema, "query"), asyncHandler(getDeletedBrandsHandler));
router.post("/admin/:id/restore", requireRole("ADMIN"), validate(brandParamsSchema, "params"), asyncHandler(restoreBrandHandler));
router.delete("/admin/:id/permanent", requireRole("ADMIN"), validate(brandParamsSchema, "params"), asyncHandler(hardDeleteBrandHandler));

export default router;