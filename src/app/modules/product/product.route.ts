import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import * as c from "./product.controller";
import {
  listProductsSchema,
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  productBySlugParamsSchema,
} from "./product.validation";
import { upload } from "src/app/middlewares/upload.middleware";
import { uploadProductImage } from "./product.controller";

const router = Router();

// =====================
// === PUBLIC ROUTES ===
// =====================
// Upload ảnh sản phẩm
router.post(
  "/upload-image",
  upload.single("image"),
  uploadProductImage
);

// Lấy danh sách sản phẩm (public)
router.get(
  "/",
  validate(listProductsSchema, "query"),
  c.getProductsPublicHandler
);

// Lấy chi tiết sản phẩm theo slug
router.get(
  "/:slug",
  validate(productBySlugParamsSchema, "params"),
  c.getProductBySlugHandler
);

// =====================
// === ADMIN ROUTES ===
// =====================

// Lấy danh sách sản phẩm (admin)
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listProductsSchema, "query"),
  c.getProductsAdminHandler
);

// Lấy chi tiết sản phẩm theo ID (admin)
router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  c.getProductDetailHandler
);

// Tạo sản phẩm
router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createProductSchema),
  c.createProductHandler
);

// Cập nhật sản phẩm
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  validate(updateProductSchema),
  c.updateProductHandler
);

// Xóa sản phẩm
router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  c.deleteProductHandler
);

export default router;
