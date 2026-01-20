import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, optionalAuthMiddleware } from "@/app/middlewares/auth.middleware";
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
  getProductBySpecificationsHandler,

  // Admin handlers
  getProductsAdminHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./product.controller";
import {
  listProductsSchema,
  productBySlugParamsSchema,
  productParamsSchema,
  reviewsQuerySchema,
  variantQuerySchema,
} from "./product.validation";
import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";

const router = Router();

// Public

// List products with filters
router.get("/", validate(listProductsSchema, "query"), getProductsPublicHandler);

// Get product detail by slug
router.get(
  "/slug/:slug",
  validate(productBySlugParamsSchema, "params"),
  optionalAuthMiddleware,
  getProductBySlugHandler,
);

// Get specific variant
router.get(
  "/slug/:slug/variant",
  validate(productBySlugParamsSchema, "params"),
  validate(variantQuerySchema, "query"),
  getProductVariantHandler,
);

// Get product gallery
router.get(
  "/slug/:slug/gallery",
  validate(productBySlugParamsSchema, "params"),
  getProductGalleryHandler,
);

// Get product specifications
router.get(
  "/slug/:slug/specifications",
  validate(productBySlugParamsSchema, "params"),
  getProductBySpecificationsHandler,
);

// Get related products
router.get(
  "/slug/:slug/related",
  validate(productBySlugParamsSchema, "params"),
  getRelatedProductsHandler,
);

// Get product reviews
router.get(
  "/slug/:slug/reviews",
  validate(productBySlugParamsSchema, "params"),
  validate(reviewsQuerySchema, "query"),
  getProductReviewsHandler,
);

// Admin

// Get all products (admin - includes inactive)
router.get(
  "/admin/all",
  authMiddleware,
  requireRole("ADMIN"),
  validate(listProductsSchema, "query"),
  getProductsAdminHandler,
);

// Get product detail by ID (admin)
router.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  getProductDetailHandler,
);

// Create product
router.post(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  upload.any(),
  parseJsonFields,
  createProductHandler,
);

// Update product
router.patch(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  upload.any(),
  updateProductHandler,
);

// Delete product
router.delete(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(productParamsSchema, "params"),
  deleteProductHandler,
);

export default router;
