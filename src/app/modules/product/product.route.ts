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
  softDeleteProductHandler,
  restoreProductHandler,
  hardDeleteProductHandler,
  getDeletedProductsHandler,
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


// ==================== ADMIN & STAFF ====================
router.use("/admin", authMiddleware(true));

// 1. Quyền STAFF & ADMIN (Đọc danh sách, Xem chi tiết, Xóa mềm)
router.get("/admin/all", requireRole("STAFF", "ADMIN"), validate(listProductsSchema, "query"), asyncHandler(getProductsAdminHandler));
router.get("/admin/:id", requireRole("STAFF", "ADMIN"), validate(productParamsSchema, "params"), asyncHandler(getProductDetailHandler));
router.delete("/admin/:id", requireRole("STAFF", "ADMIN"), validate(productParamsSchema, "params"), asyncHandler(softDeleteProductHandler));

// 2. Quyền ADMIN ONLY (Tạo, Sửa)
router.post("/admin", requireRole("ADMIN"), upload.any(), parseJsonFields, asyncHandler(createProductHandler));
router.patch("/admin/:id", requireRole("ADMIN"), validate(productParamsSchema, "params"), upload.any(), asyncHandler(updateProductHandler));

// 3. THÙNG RÁC & XÓA CỨNG (ADMIN ONLY)
router.get("/admin/trash/products", requireRole("ADMIN"), validate(listProductsSchema, "query"), asyncHandler(getDeletedProductsHandler));
router.post("/admin/:id/restore", requireRole("ADMIN"), validate(productParamsSchema, "params"), asyncHandler(restoreProductHandler));
router.delete("/admin/:id/permanent", requireRole("ADMIN"), validate(productParamsSchema, "params"), asyncHandler(hardDeleteProductHandler));

export default router;