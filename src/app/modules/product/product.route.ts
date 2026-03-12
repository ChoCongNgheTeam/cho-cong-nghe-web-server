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
  getSearchSuggestHandler,
  getProductVariantOptionsHandler,
} from "./product.controller";
import { listProductsSchema, productBySlugParamsSchema, productParamsSchema, reviewsQuerySchema, searchSuggestSchema, variantQuerySchema } from "./product.validation";
import { parseJsonFields } from "@/app/middlewares/parse-json-fields.middleware";
import { asyncHandler } from "@/utils/async-handler";

// Import filter handler
import { getCategoryFiltersHandler } from "./product_filter.controller";
import { categoryFiltersQuerySchema } from "./product_filter.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — tĩnh trước
// FE goi: GET /products
//     ↓
// Service resolve: getProductsPublicHandler
// Example
// GET /products
//   ?category=dien-thoai
//   &brandId=c91c563e-7485-4cdb-985e-9860281f6263    ← Apple
//   &brandId=683c3fa2-dff3-4dbb-9fe5-d9c5cb9c7d29    ← Samsung (multi-select OR)
//   &attr_storage=256GB
//   &attr_storage=512GB                               ← multi-select OR
//   &attr_ram=8GB
//   &spec_os=Android
//   &spec_nfc=true                                    ← BOOLEAN filter
//   &minPrice=5000000
//   &maxPrice=20000000
//   &inStock=true
//   &sortBy=price&sortOrder=asc

// GET /products
//   ?category=laptop
//   &spec_cpu_series=Intel+Core+i7
//   &attr_ram=16GB
//   &attr_ram=32GB
//   &spec_screen_size_min=14
//   &spec_screen_size_max=16
//   &minPrice=20000000

// GET /products
//   ?category=dien-thoai
//   &spec_screen_size_min=6.1
//   &spec_screen_size_max=6.7
//   &spec_battery_capacity_min=4000

router.get("/", validate(listProductsSchema, "query"), asyncHandler(getProductsPublicHandler));

// FE gọi: GET /products/filters?category=dien-thoai
//     ↓
// Service resolve → ["66834516", "c91c563e", "683c3fa2", ...] (toàn bộ sub IDs)
//     ↓
// Song song query:
//   - brands có sản phẩm thực tế         → filter "Hãng"
//   - price min/max từ variants           → filter "Giá"
//   - attributes từ category config       → filter "Storage", "RAM"...
//   - specs có isFilterable=true          → filter "OS", "NFC", "Pin"...
//     ↓
// Detect type: RANGE / ENUM / BOOLEAN (kết hợp whitelist cứng + heuristic)
//     ↓
// FE nhận FilterGroup[] → render đúng UI cho từng type
// Dynamic category filter endpoint
// GET /products/filters?category=dien-thoai
// GET /products/filters?category=laptop
// GET /products/filters?category=iphone-16-series
router.get("/filters", validate(categoryFiltersQuerySchema, "query"), asyncHandler(getCategoryFiltersHandler));

// default 8
// GET /products/search-suggest?q=iphone+16&limit=8
// GET /products/search-suggest?q=macbook&category=laptop&limit=5
router.get("/search-suggest", validate(searchSuggestSchema, "query"), asyncHandler(getSearchSuggestHandler));

router.get("/flash-sale", asyncHandler(getFlashSaleProductsHandler));
router.get("/sale-categories", asyncHandler(getCategoriesWithSaleProductsHandler));
router.get("/upcoming-promotions", asyncHandler(getUpcomingPromotionsHandler));
router.get("/best-selling", asyncHandler(getBestSellingProductsHandler));
router.get("/new-arrivals", asyncHandler(getNewArrivalProductsHandler));
router.get("/sale-schedule", asyncHandler(getSaleScheduleHandler));

// slug-based — tĩnh trước động
router.get("/slug/:slug", validate(productBySlugParamsSchema, "params"), authMiddleware(false), asyncHandler(getProductBySlugHandler));
router.get("/slug/:slug/variant", validate(productBySlugParamsSchema, "params"), validate(variantQuerySchema, "query"), asyncHandler(getProductVariantHandler));
router.get(
  "/slug/:slug/variant-options",
  validate(productBySlugParamsSchema, "params"),
  authMiddleware(false), // optional auth — để tính giá user-specific nếu có
  asyncHandler(getProductVariantOptionsHandler),
);
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
