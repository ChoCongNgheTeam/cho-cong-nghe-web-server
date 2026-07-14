import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
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
  getFlashSaleProductsHandler,
  getCategoriesWithSaleProductsHandler,
  getUpcomingPromotionsHandler,
  getProductsByPromotionHandler,
  getBestSellingProductsHandler,
  getNewArrivalProductsHandler,
  getSaleScheduleHandler,
  getSearchSuggestHandler,
  getProductVariantOptionsHandler,
  getProductsAdminHandler,
  getProductsTrashHandler,
  getProductDetailHandler,
  createProductHandler,
  updateProductHandler,
  softDeleteProductHandler,
  restoreProductHandler,
  hardDeleteProductHandler,
  bulkActionHandler,
  softDeleteVariantHandler,
  restoreVariantHandler,
  exportProductsAdminHandler,
  getImportTemplateHandler,
  importProductsAdminHandler,
  getSearchTrendingHandler,
  getSaleScheduleV2Handler,
  getProductsByDateHandler,
  compareProductsHandler,
  getProductStatsHandler,
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
  exportProductsSchema,
  searchSuggestTrendingSchema,
  saleScheduleQuerySchema,
  saleByDateQuerySchema,
  compareProductsSchema,
} from "./product.validation";
import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getCategoryFiltersHandler } from "./product_filter.controller";
import { categoryFiltersQuerySchema } from "./product_filter.validation";
import multer from "multer";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv", "application/csv"];
    const nameOk = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    if (allowed.includes(file.mimetype) || nameOk) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file .xlsx hoặc .csv"));
  },
});

const router = Router();

// SALES + MARKETING có canViewProducts — cho xem sản phẩm
// SALES có thêm canUpdateStock — cho cập nhật tồn kho/giá
const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/", validate(listProductsSchema, "query"), asyncHandler(getProductsPublicHandler));
router.get("/filters", validate(categoryFiltersQuerySchema, "query"), asyncHandler(getCategoryFiltersHandler));
router.get("/search-suggest", validate(searchSuggestSchema, "query"), asyncHandler(getSearchSuggestHandler));
router.get("/search-trending", validate(searchSuggestTrendingSchema, "query"), asyncHandler(getSearchTrendingHandler));
router.get("/flash-sale", asyncHandler(getFlashSaleProductsHandler));
router.get("/sale-categories", asyncHandler(getCategoriesWithSaleProductsHandler));
router.get("/sale-schedule", asyncHandler(getSaleScheduleHandler));
router.get("/sale-schedule-v2", validate(saleScheduleQuerySchema, "query"), asyncHandler(getSaleScheduleV2Handler));
router.get("/sale-by-date", validate(saleByDateQuerySchema, "query"), asyncHandler(getProductsByDateHandler));
router.get("/upcoming-promotions", asyncHandler(getUpcomingPromotionsHandler));
router.get("/compare", validate(compareProductsSchema, "query"), asyncHandler(compareProductsHandler));
router.get("/best-selling", asyncHandler(getBestSellingProductsHandler));
router.get("/new-arrivals", asyncHandler(getNewArrivalProductsHandler));

router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductBySlugHandler));
router.get("/slug/:slug/variant-options", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductVariantOptionsHandler));
router.get("/slug/:slug/variant", validate(productBySlugParamsSchema, "params"), validate(variantQuerySchema, "query"), asyncHandler(getProductVariantHandler));
router.get("/slug/:slug/gallery", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductGalleryHandler));
router.get("/slug/:slug/specifications", validate(productBySlugParamsSchema, "params"), asyncHandler(getProductBySpecificationsHandler));
router.get("/slug/:slug/related", validate(productBySlugParamsSchema, "params"), asyncHandler(getRelatedProductsHandler));
router.get("/slug/:slug/reviews", validate(productBySlugParamsSchema, "params"), validate(reviewsQuerySchema, "query"), asyncHandler(getProductReviewsHandler));
router.get("/promotion/:promotionId", asyncHandler(getProductsByPromotionHandler));

// Stats: Admin + Staff có canViewProducts
router.get("/admin/stats", authMiddleware(true), requireRole(...STAFF_ROLES, "ADMIN"), requirePermission("canViewProducts"), asyncHandler(getProductStatsHandler));

// Xem danh sách — SALES + MARKETING có canViewProducts
router.get("/admin/all", ...staffAdminAuth, requirePermission("canViewProducts"), validate(adminListProductsSchema, "query"), asyncHandler(getProductsAdminHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getProductsTrashHandler));
router.get("/admin/export", ...staffAdminAuth, requirePermission("canViewProducts"), validate(exportProductsSchema, "query"), asyncHandler(exportProductsAdminHandler));
router.get("/admin/import/template", ...adminAuth, asyncHandler(getImportTemplateHandler));
router.post("/admin/import", ...adminAuth, uploadMemory.single("file"), asyncHandler(importProductsAdminHandler));

// Tạo sản phẩm — ADMIN only
router.post("/admin", ...adminAuth, upload.any(), parseJsonFields, asyncHandler(createProductHandler));

// Bulk action — ADMIN only (có thể delete hàng loạt)
router.post("/admin/bulk", ...adminAuth, validate(bulkActionSchema, "body"), asyncHandler(bulkActionHandler));

// ── Admin — :id routes ────────────────────────────────────────────────────────
// Xem chi tiết — SALES + MARKETING có canViewProducts
router.get("/admin/:id", ...staffAdminAuth, requirePermission("canViewProducts"), validate(productParamsSchema, "params"), asyncHandler(getProductDetailHandler));

// Cập nhật — SALES có canUpdateStock (giá, tồn kho); ADMIN full
router.patch("/admin/:id", ...staffAdminAuth, requirePermission("canUpdateStock"), validate(productParamsSchema, "params"), upload.any(), asyncHandler(updateProductHandler));

// Xóa / restore — ADMIN only
router.delete("/admin/:id", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(softDeleteProductHandler));
router.post("/admin/:id/restore", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(restoreProductHandler));
router.delete("/admin/:id/permanent", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(hardDeleteProductHandler));

// ── Variant lifecycle — ADMIN only ────────────────────────────────────────────
router.delete("/admin/:id/variants/:variantId", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(softDeleteVariantHandler));
router.post("/admin/:id/variants/:variantId/restore", ...adminAuth, validate(productParamsSchema, "params"), asyncHandler(restoreVariantHandler));

export default router;
