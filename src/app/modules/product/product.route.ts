/**
 * product.route.ts  — UPDATED
 *
 * Thêm 4 routes mới (đánh dấu NEW):
 *   GET /search-trending         — top trending search suggestions
 *   GET /sale-schedule-v2        — calendar metadata (có rules)
 *   GET /sale-by-date            — products sale theo ngày click
 *   GET /compare                 — so sánh 2-4 sản phẩm cùng category
 *   GET /admin/stats             — dashboard stats (NEW)
 *
 * Thứ tự route: tĩnh trước → slug-based → dynamic (:id)
 */

import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { upload } from "@/app/middlewares/upload.middleware";

// ── Existing handlers ─────────────────────────────────────────────────────────
import {
  // Public
  getProductsPublicHandler,
  getProductBySlugHandler,
  getProductVariantHandler,
  getProductGalleryHandler,
  getRelatedProductsHandler,
  getProductReviewsHandler,
  getProductBySpecificationsHandler,
  getFlashSaleProductsHandler,
  getCategoriesWithSaleProductsHandler,
  getUpcomingPromotionsHandler,
  getProductsByPromotionHandler,
  getBestSellingProductsHandler,
  getNewArrivalProductsHandler,
  getSaleScheduleHandler,
  getSearchSuggestHandler,
  getProductVariantOptionsHandler,
  // Admin — list
  getProductsAdminHandler,
  getProductsTrashHandler,
  // Admin — detail
  getProductDetailHandler,
  // Admin — create / update
  createProductHandler,
  updateProductHandler,
  // Admin — soft delete lifecycle
  softDeleteProductHandler,
  restoreProductHandler,
  hardDeleteProductHandler,
  // Admin — bulk
  bulkActionHandler,
  // Admin — variant
  softDeleteVariantHandler,
  restoreVariantHandler,
} from "./product.controller";

// ── NEW handlers ──────────────────────────────────────────────────────────────
import { getSearchTrendingHandler, getSaleScheduleV2Handler, getProductsByDateHandler, compareProductsHandler, getProductStatsHandler } from "./product.controller";

// ── Validation schemas ────────────────────────────────────────────────────────
import {
  listProductsSchema,
  adminListProductsSchema,
  productBySlugParamsSchema,
  productParamsSchema,
  reviewsQuerySchema,
  searchSuggestSchema,
  variantQuerySchema,
  bulkActionSchema,
} from "./product.validation";

import { searchSuggestTrendingSchema, saleScheduleQuerySchema, saleByDateQuerySchema, compareProductsSchema } from "./product.validation";

import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getCategoryFiltersHandler } from "./product_filter.controller";
import { categoryFiltersQuerySchema } from "./product_filter.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — tĩnh (không có params)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/", validate(listProductsSchema, "query"), asyncHandler(getProductsPublicHandler));
router.get("/filters", validate(categoryFiltersQuerySchema, "query"), asyncHandler(getCategoryFiltersHandler));

// Search: 2 endpoints — suggest (text match) và trending (viewsCount)
router.get("/search-suggest", validate(searchSuggestSchema, "query"), asyncHandler(getSearchSuggestHandler));
// [NEW] Trending search — dùng cho dropdown khi focus (q rỗng = top trending)
router.get("/search-trending", validate(searchSuggestTrendingSchema, "query"), asyncHandler(getSearchTrendingHandler));

// Flash sale / sale categories
router.get("/flash-sale", asyncHandler(getFlashSaleProductsHandler));
router.get("/sale-categories", asyncHandler(getCategoriesWithSaleProductsHandler));

// Sale schedule: giữ endpoint cũ (backward compat) + thêm v2 và by-date
router.get("/sale-schedule", asyncHandler(getSaleScheduleHandler));
// [NEW] Sale schedule v2 — có rules discount, hasActiveSale flag
router.get("/sale-schedule-v2", validate(saleScheduleQuerySchema, "query"), asyncHandler(getSaleScheduleV2Handler));
// [NEW] Products sale theo ngày click
router.get("/sale-by-date", validate(saleByDateQuerySchema, "query"), asyncHandler(getProductsByDateHandler));

// Promotions
router.get("/upcoming-promotions", asyncHandler(getUpcomingPromotionsHandler));

// [NEW] Product comparison
router.get("/compare", validate(compareProductsSchema, "query"), asyncHandler(compareProductsHandler));

// Rankings
router.get("/best-selling", asyncHandler(getBestSellingProductsHandler));
router.get("/new-arrivals", asyncHandler(getNewArrivalProductsHandler));

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — slug-based (tĩnh prefix /slug/ trước dynamic /:id)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductBySlugHandler));
router.get("/slug/:slug/variant-options", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductVariantOptionsHandler));
router.get("/slug/:slug/variant", validate(productBySlugParamsSchema, "params"), validate(variantQuerySchema, "query"), asyncHandler(getProductVariantHandler));
router.get("/slug/:slug/gallery", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductGalleryHandler));
router.get("/slug/:slug/specifications", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductBySpecificationsHandler));
router.get("/slug/:slug/related", validate(productBySlugParamsSchema, "params"), asyncHandler(getRelatedProductsHandler));
router.get("/slug/:slug/reviews", validate(productBySlugParamsSchema, "params"), validate(reviewsQuerySchema, "query"), asyncHandler(getProductReviewsHandler));

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — dynamic param
// ─────────────────────────────────────────────────────────────────────────────

router.get("/promotion/:promotionId", asyncHandler(getProductsByPromotionHandler));

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — tĩnh (phải trước /admin/:id để tránh conflict)
// ─────────────────────────────────────────────────────────────────────────────

// [NEW] Stats — dashboard overview
router.get("/admin/stats", ...adminAuth, asyncHandler(getProductStatsHandler));

// List & trash
router.get("/admin/all", ...adminAuth, validate(adminListProductsSchema, "query"), asyncHandler(getProductsAdminHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getProductsTrashHandler));

// Create
router.post("/admin", ...adminAuth, upload.any(), parseJsonFields, asyncHandler(createProductHandler));

// Bulk action (phải trước /admin/:id)
router.post("/admin/bulk", ...adminAuth, asyncHandler(bulkActionHandler));

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — :id routes (sau tất cả tĩnh)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(getProductDetailHandler));
router.patch("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), upload.any(), asyncHandler(updateProductHandler));
router.delete("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(softDeleteProductHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(restoreProductHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(hardDeleteProductHandler));

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Variant lifecycle
// ─────────────────────────────────────────────────────────────────────────────

router.delete("/admin/:id/variants/:variantId", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(softDeleteVariantHandler));
router.post("/admin/:id/variants/:variantId/restore", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(restoreVariantHandler));

export default router;
