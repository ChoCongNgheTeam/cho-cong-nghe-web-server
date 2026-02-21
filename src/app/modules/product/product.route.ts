import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { upload } from "@/app/middlewares/upload.middleware";
import {
  getProductsPublicHandler,
  getProductBySlugHandler,
  getProductVariantHandler,
  getProductGalleryHandler,
  getRelatedProductsHandler,
  getProductReviewsHandler,
  getProductBySpecificationsHandler,
  getProductsAdminHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getFlashSaleProductsHandler,
  getCategoriesWithSaleProductsHandler,
  getUpcomingPromotionsHandler,
  getProductsByPromotionHandler,
  getBestSellingProductsHandler,
  getNewArrivalProductsHandler,
  getSaleScheduleHandler,
} from "./product.controller";
import { listProductsSchema, productBySlugParamsSchema, productParamsSchema, reviewsQuerySchema, variantQuerySchema } from "./product.validation";
import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — tĩnh trước
router.get("/", validate(listProductsSchema, "query"), asyncHandler(getProductsPublicHandler));

router.get("/flash-sale", asyncHandler(getFlashSaleProductsHandler));
router.get("/sale-categories", asyncHandler(getCategoriesWithSaleProductsHandler));
router.get("/upcoming-promotions", asyncHandler(getUpcomingPromotionsHandler));
router.get("/best-selling", asyncHandler(getBestSellingProductsHandler));
router.get("/new-arrivals", asyncHandler(getNewArrivalProductsHandler));
router.get("/sale-schedule", asyncHandler(getSaleScheduleHandler));

// slug-based — tĩnh trước động
router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductBySlugHandler));
router.get("/slug/:slug/variant", validate(productBySlugParamsSchema, "params"), validate(variantQuerySchema, "query"), asyncHandler(getProductVariantHandler));
router.get("/slug/:slug/gallery", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductGalleryHandler));
router.get("/slug/:slug/specifications", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductBySpecificationsHandler));
router.get("/slug/:slug/related", validate(productBySlugParamsSchema, "params"), asyncHandler(getRelatedProductsHandler));
router.get("/slug/:slug/reviews", validate(productBySlugParamsSchema, "params"), validate(reviewsQuerySchema, "query"), asyncHandler(getProductReviewsHandler));

// Public — động
router.get("/promotion/:promotionId", asyncHandler(getProductsByPromotionHandler));

// Admin
router.get("/admin/all", ...adminAuth, validate(listProductsSchema, "query"), asyncHandler(getProductsAdminHandler));
router.post("/admin", ...adminAuth, upload.any(), parseJsonFields, asyncHandler(createProductHandler));

// động sau
router.get("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(getProductDetailHandler));
router.patch("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), upload.any(), asyncHandler(updateProductHandler));
router.delete("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(deleteProductHandler));

export default router;
