import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { brandUpload } from "@/app/middlewares/upload/brandUpload";
import { asyncHandler } from "@/utils/async-handler";
import {
  getBrandsPublicHandler,
  getActiveBrandsHandler,
  getFeaturedBrandsHandler,
  getBrandBySlugHandler,
  getBrandsAdminHandler,
  getBrandDetailHandler,
  createBrandHandler,
  updateBrandHandler,
  deleteBrandHandler,
  restoreBrandHandler,
  hardDeleteBrandHandler,
  getDeletedBrandsHandler,
  getBrandsByCategoryHandler,
} from "./brand.controller";
import { listBrandsQuerySchema, featuredBrandsQuerySchema, brandParamsSchema, brandSlugParamsSchema, createBrandSchema, updateBrandSchema, brandByCategoryQuerySchema } from "./brand.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", validate(listBrandsQuerySchema, "query"), asyncHandler(getBrandsPublicHandler));
router.get("/active", asyncHandler(getActiveBrandsHandler));
router.get("/featured", validate(featuredBrandsQuerySchema, "query"), asyncHandler(getFeaturedBrandsHandler));

router.get("/by-category", validate(brandByCategoryQuerySchema, "query"), asyncHandler(getBrandsByCategoryHandler));

// Public
router.get("/slug/:slug", validate(brandSlugParamsSchema, "params"), asyncHandler(getBrandBySlugHandler));

// Admin — static
router.get("/admin/all", ...adminAuth, validate(listBrandsQuerySchema, "query"), asyncHandler(getBrandsAdminHandler));
router.post("/admin", ...adminAuth, brandUpload.single("imageUrl"), validate(createBrandSchema, "body"), asyncHandler(createBrandHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedBrandsHandler));
router.delete(
  "/admin/bulk",
  ...adminAuth,
  asyncHandler(() => {
    throw new Error("Not implemented");
  }),
);

// Admin
router.post("/admin/:id/restore", ...adminAuth, validate(brandParamsSchema, "params"), asyncHandler(restoreBrandHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(brandParamsSchema, "params"), asyncHandler(hardDeleteBrandHandler));

// Admin — param only
router.get("/admin/:id", ...adminAuth, validate(brandParamsSchema, "params"), asyncHandler(getBrandDetailHandler));
router.patch("/admin/:id", ...adminAuth, brandUpload.single("imageUrl"), validate(brandParamsSchema, "params"), validate(updateBrandSchema, "body"), asyncHandler(updateBrandHandler));
router.delete("/admin/:id", ...adminAuth, validate(brandParamsSchema, "params"), asyncHandler(deleteBrandHandler));

export default router;
