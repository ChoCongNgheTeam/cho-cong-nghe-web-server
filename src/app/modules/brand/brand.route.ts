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
  deleteBrandHandler,
} from "./brand.controller";
import { createBrandSchema, updateBrandSchema, brandParamsSchema, brandSlugParamsSchema, featuredBrandsQuerySchema, listBrandsQuerySchema } from "./brand.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listBrandsQuerySchema, "query"), asyncHandler(getBrandsPublicHandler));
router.get("/active", asyncHandler(getActiveBrandsHandler));
router.get("/featured", validate(featuredBrandsQuerySchema, "query"), asyncHandler(getFeaturedBrandsHandler));
router.get("/slug/:slug", validate(brandSlugParamsSchema, "params"), asyncHandler(getBrandBySlugHandler));

// Admin
router.get("/admin/all", ...adminAuth, validate(listBrandsQuerySchema, "query"), asyncHandler(getBrandsAdminHandler));
router.get("/admin/:id", ...adminAuth, validate(brandParamsSchema, "params"), asyncHandler(getBrandDetailHandler));

router.post("/admin", ...adminAuth, brandUpload.single("imageUrl"), validate(createBrandSchema, "body"), asyncHandler(createBrandHandler));

router.patch("/admin/:id", ...adminAuth, brandUpload.single("imageUrl"), validate(brandParamsSchema, "params"), validate(updateBrandSchema, "body"), asyncHandler(updateBrandHandler));

router.delete("/admin/:id", ...adminAuth, validate(brandParamsSchema, "params"), asyncHandler(deleteBrandHandler));

export default router;
