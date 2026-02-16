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

const router = Router();

// Public
router.get("/", validate(listBrandsQuerySchema, "query"), getBrandsPublicHandler);
router.get("/active", getActiveBrandsHandler);
router.get("/featured", validate(featuredBrandsQuerySchema, "query"), getFeaturedBrandsHandler);
router.get("/slug/:slug", validate(brandSlugParamsSchema, "params"), getBrandBySlugHandler);

// Admin
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listBrandsQuerySchema, "query"), getBrandsAdminHandler);

router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(brandParamsSchema, "params"), getBrandDetailHandler);

router.post("/admin", authMiddleware(), requireRole("ADMIN"), brandUpload.single("imageUrl"), validate(createBrandSchema, "body"), createBrandHandler);

router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), brandUpload.single("imageUrl"), validate(brandParamsSchema, "params"), validate(updateBrandSchema, "body"), updateBrandHandler);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(brandParamsSchema, "params"), deleteBrandHandler);

export default router;
