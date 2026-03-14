import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { upload } from "@/app/middlewares/upload.middleware";
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
import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getCategoryFiltersHandler } from "./product_filter.controller";
import { categoryFiltersQuerySchema } from "./product_filter.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — tĩnh trước
// ─────────────────────────────────────────────────────────────────────────────

router.get("/", validate(listProductsSchema, "query"), asyncHandler(getProductsPublicHandler));
router.get("/filters", validate(categoryFiltersQuerySchema, "query"), asyncHandler(getCategoryFiltersHandler));
router.get("/search-suggest", validate(searchSuggestSchema, "query"), asyncHandler(getSearchSuggestHandler));
router.get("/flash-sale", asyncHandler(getFlashSaleProductsHandler));
router.get("/sale-categories", asyncHandler(getCategoriesWithSaleProductsHandler));
router.get("/upcoming-promotions", asyncHandler(getUpcomingPromotionsHandler));
router.get("/best-selling", asyncHandler(getBestSellingProductsHandler));
router.get("/new-arrivals", asyncHandler(getNewArrivalProductsHandler));
router.get("/sale-schedule", asyncHandler(getSaleScheduleHandler));

// PUBLIC — slug-based (tĩnh trước động)
router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductBySlugHandler));
router.get("/slug/:slug/variant", validate(productBySlugParamsSchema, "params"), validate(variantQuerySchema, "query"), asyncHandler(getProductVariantHandler));
router.get("/slug/:slug/variant-options", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductVariantOptionsHandler));
router.get("/slug/:slug/gallery", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductGalleryHandler));
router.get("/slug/:slug/specifications", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductBySpecificationsHandler));
router.get("/slug/:slug/related", validate(productBySlugParamsSchema, "params"), asyncHandler(getRelatedProductsHandler));
router.get("/slug/:slug/reviews", validate(productBySlugParamsSchema, "params"), validate(reviewsQuerySchema, "query"), asyncHandler(getProductReviewsHandler));

// PUBLIC — động
router.get("/promotion/:promotionId", asyncHandler(getProductsByPromotionHandler));

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — tĩnh trước :id
// ─────────────────────────────────────────────────────────────────────────────

// List
router.get("/admin/all", ...adminAuth, validate(adminListProductsSchema, "query"), asyncHandler(getProductsAdminHandler));

// Trash
router.get("/admin/trash", ...adminAuth, asyncHandler(getProductsTrashHandler));

// Create
router.post("/admin", ...adminAuth, upload.any(), parseJsonFields, asyncHandler(createProductHandler));

// Bulk action (phải trước :id để tránh conflict)
router.post("/admin/bulk", ...adminAuth, asyncHandler(bulkActionHandler));

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — :id routes (động sau tĩnh)
// ─────────────────────────────────────────────────────────────────────────────

// Detail
router.get("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(getProductDetailHandler));

// Update
router.patch("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), upload.any(), asyncHandler(updateProductHandler));

// Soft delete (nút "Xóa" trên list)
router.delete("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(softDeleteProductHandler));

// Restore từ trash
router.post("/admin/:id/restore", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(restoreProductHandler));

// Hard delete (xóa vĩnh viễn từ trash)
router.delete("/admin/:id/permanent", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(hardDeleteProductHandler));

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — VARIANT
// ─────────────────────────────────────────────────────────────────────────────

// Soft delete variant
router.delete("/admin/:id/variants/:variantId", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(softDeleteVariantHandler));

// Restore variant
router.post("/admin/:id/variants/:variantId/restore", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(restoreVariantHandler));

export default router;
