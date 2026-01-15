import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { upload } from "@/app/middlewares/upload.middleware";
import {
  // Public handlers
  getProductsPublicHandler,
  getProductBySlugHandler,
  getProductVariantHandler,
  getProductGalleryHandler,
  getRelatedProductsHandler,
  getProductReviewsHandler,

  // Admin handlers
  getProductsAdminHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  bulkUpdateProductsHandler,
  getProductBySpecificationsHandler,
} from "./product.controller";
import {
  listProductsSchema,
  productBySlugParamsSchema,
  productParamsSchema,
  createProductSchema,
  updateProductSchema,
  bulkUpdateSchema,
  reviewsQuerySchema,
  variantQuerySchema,
} from "./product.validation";

const router = Router();

// Public

// Lấy danh sách sản phẩm (có filter, sort, pagination)
router.get("/", validate(listProductsSchema, "query"), getProductsPublicHandler);

// Lấy chi tiết sản phẩm theo slug
router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), getProductBySlugHandler);

// Lấy chi tiết variant cụ thể
router.get(
  "/slug/:slug/variant",
  validate(productBySlugParamsSchema, "params"),
  validate(variantQuerySchema, "query"),
  getProductVariantHandler
);

// Lấy gallery của variant
router.get(
  "/slug/:slug/gallery",
  validate(productBySlugParamsSchema, "params"),
  getProductGalleryHandler
);

// Lấy thông số kỹ thuật
router.get(
  "/slug/:slug/specifications",
  validate(productBySlugParamsSchema, "params"),
  getProductBySpecificationsHandler
);

// Lấy sản phẩm tương tự
router.get(
  "/slug/:slug/related",
  validate(productBySlugParamsSchema, "params"),
  getRelatedProductsHandler
);

// Lấy reviews của sản phẩm
router.get(
  "/slug/:slug/reviews",
  validate(productBySlugParamsSchema, "params"),
  validate(reviewsQuerySchema, "query"),
  getProductReviewsHandler
);

// Admin

// Lấy tất cả sản phẩm (admin - bao gồm inactive)
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listProductsSchema, "query"),
  getProductsAdminHandler
);

// Lấy chi tiết sản phẩm theo ID (admin)
router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  getProductDetailHandler
);

// Tạo sản phẩm mới
router.post("/admin", authMiddleware, requireRole("ADMIN"), upload.any(), createProductHandler);

// Cập nhật sản phẩm
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  upload.any(),
  validate(productParamsSchema, "params"),
  updateProductHandler
);

// Xóa sản phẩm
router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  deleteProductHandler
);

// Bulk update (featured, active status)
router.patch(
  "/admin/bulk-update",
  authMiddleware,
  requireRole("ADMIN"),
  validate(bulkUpdateSchema),
  bulkUpdateProductsHandler
);

export default router;
