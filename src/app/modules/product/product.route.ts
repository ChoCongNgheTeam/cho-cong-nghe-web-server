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
  getProductBySpecificationsHandler,

  // Admin handlers
  getProductsAdminHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getFlashSaleProductsHandler,
  getCategoriesWithSaleProductsHandler,
  // getFeaturedProductsByCategoriesHandler,
  getUpcomingPromotionsHandler,
  getProductsByPromotionHandler,
  getBestSellingProductsHandler,
  getNewArrivalProductsHandler,
  getSaleScheduleHandler,
} from "./product.controller";
import { listProductsSchema, productBySlugParamsSchema, productParamsSchema, reviewsQuerySchema, variantQuerySchema } from "./product.validation";
import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";

const router = Router();

// Public

// List products with filters
router.get("/", validate(listProductsSchema, "query"), getProductsPublicHandler);

// Get product detail by slug
router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), authMiddleware(false), getProductBySlugHandler);

// Get specific variant
router.get("/slug/:slug/variant", validate(productBySlugParamsSchema, "params"), validate(variantQuerySchema, "query"), getProductVariantHandler);

// Get product gallery
router.get("/slug/:slug/gallery", validate(productBySlugParamsSchema, "params"), getProductGalleryHandler);

// Get product specifications
router.get("/slug/:slug/specifications", validate(productBySlugParamsSchema, "params"), getProductBySpecificationsHandler);

// Get related products
router.get("/slug/:slug/related", validate(productBySlugParamsSchema, "params"), getRelatedProductsHandler);

// Get product reviews
router.get("/slug/:slug/reviews", validate(productBySlugParamsSchema, "params"), validate(reviewsQuerySchema, "query"), getProductReviewsHandler);

/**
 * Get flash sale products (active today or specific date)
 * GET /products/flash-sale?date=2026-01-27&limit=20&categoryId=xxx
 */
router.get("/flash-sale", getFlashSaleProductsHandler);

/**
 * Get categories with sale products
 * GET /products/sale-categories?date=2026-01-27
 */
router.get("/sale-categories", getCategoriesWithSaleProductsHandler);

/**
 * Get featured products by categories
 * GET /products/featured-by-categories?limit=8&categoriesLimit=6
 */
// router.get("/featured-by-categories", getFeaturedProductsByCategoriesHandler);

/**
 * Get upcoming promotions (preview future sales)
 * GET /products/upcoming-promotions?limit=5
 */
router.get("/upcoming-promotions", getUpcomingPromotionsHandler);

/**
 * Get products by promotion ID (preview promotion products)
 * GET /products/promotion/:promotionId?limit=20
 */
router.get("/promotion/:promotionId", getProductsByPromotionHandler);

/**
 * Get best selling products
 * GET /products/best-selling?limit=12
 */
router.get("/best-selling", getBestSellingProductsHandler); // bug

/**
 * Get new arrival products
 * GET /products/new-arrivals?daysAgo=30&limit=12
 */
router.get("/new-arrivals", getNewArrivalProductsHandler);

/**
 * Get sale schedule (Flash Sale timeline)
 * GET /products/sale-schedule?startDate=2026-01-27&endDate=2026-01-31
 */
router.get("/sale-schedule", getSaleScheduleHandler);

// Admin

// Get all products (admin - includes inactive)
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), validate(listProductsSchema, "query"), getProductsAdminHandler);

// Get product detail by ID (admin)
router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(productParamsSchema, "params"), getProductDetailHandler);

// Create product
router.post("/admin", authMiddleware(), requireRole("ADMIN"), upload.any(), parseJsonFields, createProductHandler);

// Update product
router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(productParamsSchema, "params"), upload.any(), updateProductHandler);

// Delete product
router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(productParamsSchema, "params"), deleteProductHandler);

export default router;
