import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  getActiveBrandsHandler,
  getFeaturedBrandsHandler,
  getBrandBySlugHandler,
  getAllBrandsHandler,
  getBrandDetailHandler,
  createBrandHandler,
  updateBrandHandler,
  deleteBrandHandler,
} from "./brand.controller";
import { createBrandSchema, updateBrandSchema } from "./brand.validation";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { upload } from "@/app/middlewares/upload.middleware";
import { Request, Response, NextFunction } from "express";

const router = Router();

// Middleware để parse multipart data trước khi validate
const parseMultipartForValidation = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Parse boolean fields
    if (req.body.isFeatured !== undefined) {
      req.body.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
    }
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive === "true" || req.body.isActive === true;
    }
    if (req.body.removeImage !== undefined) {
      req.body.removeImage = req.body.removeImage === "true" || req.body.removeImage === true;
    }
  }
  next();
};

// Public routes

// Lấy tất cả brands active
router.get("/", getActiveBrandsHandler);

// Lấy featured brands cho home
// Query params: ?limit=6 (optional)
router.get("/featured", getFeaturedBrandsHandler);

// Lấy brand theo slug
router.get("/slug/:slug", getBrandBySlugHandler);

// Admin routes

// Lấy tất cả brands (bao gồm inactive)
router.get("/admin/all", authMiddleware, requireRole("ADMIN"), getAllBrandsHandler);

// Lấy chi tiết brand
router.get("/admin/:id", authMiddleware, requireRole("ADMIN"), getBrandDetailHandler);

// Tạo brand mới (với upload image)
router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  upload.single("image"),
  parseMultipartForValidation,
  validate(createBrandSchema),
  createBrandHandler,
);

// Cập nhật brand (với upload image)
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  upload.single("image"),
  parseMultipartForValidation,
  validate(updateBrandSchema),
  updateBrandHandler,
);

// Xóa brand
router.delete("/admin/:id", authMiddleware, requireRole("ADMIN"), deleteBrandHandler);

export default router;
