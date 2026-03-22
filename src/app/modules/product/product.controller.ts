import { Request, Response } from "express";
import * as productService from "./product.service";
import * as productRepo from "./product.repository";
import {
  ListProductsQuery,
  reviewsQuerySchema,
  searchSuggestSchema,
  adminListProductsSchema,
  bulkActionSchema,
  compareProductsSchema,
  searchSuggestTrendingSchema,
  saleScheduleQuerySchema,
  saleByDateQuerySchema,
} from "./product.validation";
import { cleanupTempFiles, parseMultipartData, uploadColorImages, deleteOldImages } from "./product.helpers";
import { getProductsWithPricing } from "../pricing/use-cases/getProductsWithPricing.service";
import { getProductDetailWithPricing } from "../pricing/use-cases/getProductDetailWithPricing.service";
import { getProductVariantWithPricing } from "../pricing/use-cases/getProductVariantPricing.service";
import { getRelatedProductsWithPricing } from "../pricing/use-cases/getRelatedProductsWithPricing.service";
import { getFlashSaleProductsWithPricing } from "../pricing/use-cases/getFlashSaleProductsWithPricing.service";
import { getNewArrivalProductsWithPricing } from "../pricing/use-cases/getNewArrivalProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";
// import { getProductVariantOptions } from "../pricing/use-cases/product.variant-pricing.orchestrator";
import { compareProducts, getProductsOnSaleDate, getProductStats, getProductVariantOptions, getSaleScheduleV2, getSearchSuggestionsTrending } from "./product.service";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const paginatedResponse = (result: any, message: string) => ({
  data: result.data,
  meta: {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  },
  message,
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

export const getProductsPublicHandler = async (req: Request, res: Response) => {
  const result = await getProductsWithPricing(req.query as unknown as ListProductsQuery, req.user?.id);
  res.json(paginatedResponse(result, "Lấy danh sách sản phẩm thành công"));
};

export const getSearchSuggestHandler = async (req: Request, res: Response) => {
  const query = searchSuggestSchema.parse(req.query);
  const suggestions = await productService.getSearchSuggestions(query);
  res.json({ data: suggestions, total: suggestions.length, message: "Gợi ý tìm kiếm thành công" });
};

export const getProductBySlugHandler = async (req: Request, res: Response) => {
  const product = await getProductDetailWithPricing(req.params.slug, req.user?.id ?? undefined);
  res.json({ data: product, message: "Lấy chi tiết sản phẩm thành công" });
};

export const getProductVariantHandler = async (req: Request, res: Response) => {
  const result = await getProductVariantWithPricing(req.params.slug, req.query as Record<string, string>, req.user?.id);
  res.json({ data: result, message: "Lấy chi tiết variant thành công" });
};

// export const getProductVariantOptionsHandler = async (req: Request, res: Response) => {
//   // Tách selectedOptions từ query params — bỏ các system params
//   const SKIP_PARAMS = new Set(["page", "limit", "sort", "order"]);
//   const selectedOptions: Record<string, string> = {};

//   for (const [key, value] of Object.entries(req.query)) {
//     if (!SKIP_PARAMS.has(key) && typeof value === "string" && value.trim()) {
//       selectedOptions[key] = value.trim();
//     }
//   }

//   const result = await getProductVariantOptions(req.params.slug, selectedOptions, req.user?.id);

//   res.json({ data: result, message: "Lấy danh sách variant thành công" });
// };

export const getProductVariantOptionsHandler = async (req: Request, res: Response) => {
  const result = await getProductVariantOptions(req.params.slug, req.query as Record<string, string>);
  res.json({ data: result, message: "Lấy danh sách variant thành công" });
};

export const getProductGalleryHandler = async (req: Request, res: Response) => {
  const gallery = await productService.getProductGallery(req.params.slug);
  res.json({ data: gallery, message: "Lấy gallery thành công" });
};

export const getProductBySpecificationsHandler = async (req: Request, res: Response) => {
  const specs = await productService.getProductSpecificationsBySlug(req.params.slug);
  res.json({ data: specs, message: "Lấy thông số kỹ thuật thành công" });
};

export const getRelatedProductsHandler = async (req: Request, res: Response) => {
  const DEFAULT_LIMIT = 8;
  const MAX_LIMIT = 12;
  const rawLimit = Number(req.query.limit);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  const products = await getRelatedProductsWithPricing(req.params.slug, limit, req.user?.id);
  res.json({ data: products, message: "Lấy sản phẩm tương tự thành công" });
};

export const getProductReviewsHandler = async (req: Request, res: Response) => {
  const query = reviewsQuerySchema.parse(req.query);
  const result = await productService.getProductReviews(req.params.slug, query);
  res.json(paginatedResponse(result, "Lấy đánh giá thành công"));
};

export const getFlashSaleProductsHandler = async (req: Request, res: Response) => {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const categoryId = req.query.categoryId as string | undefined;

  const result = await getFlashSaleProductsWithPricing(date, { limit, categoryId }, req.user?.id);
  res.json({
    data: result.data,
    total: result.total,
    date: result.date,
    message: "Lấy sản phẩm flash sale thành công",
  });
};

export const getCategoriesWithSaleProductsHandler = async (req: Request, res: Response) => {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const categories = await productService.getCategoriesWithSaleProducts(date);
  res.json({ data: categories, total: categories.length, message: "Lấy danh mục có sản phẩm sale thành công" });
};

export const getUpcomingPromotionsHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
  const promotions = await productService.getUpcomingPromotions(limit);
  res.json({ data: promotions, total: promotions.length, message: "Lấy danh sách promotion sắp tới thành công" });
};

export const getProductsByPromotionHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const result = await productService.getProductsByPromotion(req.params.promotionId, limit);
  res.json({ data: result, message: "Lấy sản phẩm trong promotion thành công" });
};

export const getBestSellingProductsHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
  const products = await getBestSellingProductsWithPricing(limit, req.user?.id);
  res.json({ data: products, total: products.length, message: "Lấy sản phẩm bán chạy thành công" });
};

export const getNewArrivalProductsHandler = async (req: Request, res: Response) => {
  const daysAgo = req.query.daysAgo ? parseInt(req.query.daysAgo as string) : 30;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
  const products = await getNewArrivalProductsWithPricing(daysAgo, limit, req.user?.id);
  res.json({ data: products, total: products.length, message: "Lấy sản phẩm mới về thành công" });
};

export const getSaleScheduleHandler = async (req: Request, res: Response) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const schedule = await productService.getSaleSchedule(startDate, endDate);
  res.json({ data: schedule, total: schedule.length, message: "Lấy lịch sale thành công" });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — LIST
// ─────────────────────────────────────────────────────────────────────────────

export const getProductsAdminHandler = async (req: Request, res: Response) => {
  const query = adminListProductsSchema.parse(req.query);
  const result = await productService.getProductsAdmin(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      statusCounts: result.statusCounts,
    },
    message: "Lấy danh sách sản phẩm thành công",
  });
};
/**
 * GET /admin/trash
 * Lấy danh sách sản phẩm đã bị soft-delete
 */
export const getProductsTrashHandler = async (req: Request, res: Response) => {
  const result = await productService.getDeletedProducts(req.query as Record<string, any>);
  res.json(paginatedResponse(result, "Lấy danh sách sản phẩm đã xóa thành công"));
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — DETAIL
// ─────────────────────────────────────────────────────────────────────────────

export const getProductDetailHandler = async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id, {
    includeDeleted: req.query.includeDeleted === "true",
  });
  res.json({ data: product, message: "Lấy chi tiết sản phẩm thành công" });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — CREATE / UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export const createProductHandler = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];

  try {
    const parsedBody = parseMultipartData(req.body);

    const uploadedColorImages = files.length > 0 && parsedBody.colorImages?.length > 0 ? await uploadColorImages(parsedBody.colorImages, files) : [];

    const product = await productService.createProduct({
      ...parsedBody,
      colorImages: uploadedColorImages,
    });

    res.status(201).json({ data: product, message: "Tạo sản phẩm thành công" });
  } finally {
    cleanupTempFiles(files);
  }
};

export const updateProductHandler = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const { id } = req.params;

  try {
    const parsedData = parseMultipartData(req.body);

    // ── Upload ảnh mới (chỉ những màu có files) ────────────────────────────
    const uploadedColorImages = files.length > 0 && parsedData.colorImages?.length > 0 ? await uploadColorImages(parsedData.colorImages, files) : [];

    // ── Build colorImages payload cho repository ───────────────────────────
    // Merge: uploaded images + deleteImageIds từ FE (mỗi color entry giữ nguyên)
    let colorImagesPayload: any[] | undefined = undefined;

    if (parsedData.colorImages?.length > 0) {
      // Map deleteImageIds từ FE theo color
      const deleteMap = new Map<string, string[]>();
      for (const ci of parsedData.colorImages) {
        if (ci.deleteImageIds?.length > 0) {
          deleteMap.set(ci.color, ci.deleteImageIds);
        }
      }

      // Mỗi uploaded image là 1 record cần tạo mới
      // Kết hợp với deleteImageIds để repository xử lý per-color
      const colorEntries = new Map<string, any>();

      // Gom deleteImageIds từ FE
      for (const ci of parsedData.colorImages) {
        if (!colorEntries.has(ci.color)) {
          colorEntries.set(ci.color, { color: ci.color, altText: ci.altText, deleteImageIds: [], newImages: [] });
        }
        if (ci.deleteImageIds?.length > 0) {
          colorEntries.get(ci.color).deleteImageIds.push(...ci.deleteImageIds);
        }
      }

      // Gom uploaded images
      for (const img of uploadedColorImages) {
        if (!colorEntries.has(img.color)) {
          colorEntries.set(img.color, { color: img.color, altText: img.altText ?? img.color, deleteImageIds: [], newImages: [] });
        }
        colorEntries.get(img.color).newImages.push(img);
      }

      // Flatten thành array cho repository
      // Repository nhận: [{ color, altText, deleteImageIds, imagePath?, imageUrl?, position? }]
      colorImagesPayload = [];
      for (const [, entry] of colorEntries) {
        if (entry.deleteImageIds.length > 0 && entry.newImages.length === 0) {
          // Chỉ xóa — không có ảnh mới
          colorImagesPayload.push({ color: entry.color, deleteImageIds: entry.deleteImageIds });
        } else {
          // Có ảnh mới — tạo 1 record per image
          for (const img of entry.newImages) {
            colorImagesPayload.push({
              color: img.color,
              imagePath: img.imagePath,
              imageUrl: img.imageUrl,
              altText: entry.altText ?? img.color,
              position: img.position,
              deleteImageIds: entry.deleteImageIds, // chỉ xóa lần đầu (repository phải idempotent)
            });
          }
          // Nếu có deleteImageIds nhưng không có newImages thuộc màu đó
          if (entry.newImages.length === 0 && entry.deleteImageIds.length > 0) {
            colorImagesPayload.push({ color: entry.color, deleteImageIds: entry.deleteImageIds });
          }
        }
      }
    }

    // ── Lấy imagePaths cần xóa khỏi Cloudinary ────────────────────────────
    // Chỉ xóa ảnh được đánh dấu deleteImageIds (không xóa toàn bộ như trước)
    const deleteImageIds: string[] = [];
    if (parsedData.colorImages) {
      for (const ci of parsedData.colorImages) {
        if (ci.deleteImageIds?.length > 0) {
          deleteImageIds.push(...ci.deleteImageIds);
        }
      }
    }

    let cloudinaryPathsToDelete: string[] = [];
    if (deleteImageIds.length > 0) {
      // Lấy imageUrl của các ảnh cần xóa trước khi update DB
      const imagesToDelete = await productRepo.getColorImagesByIds(deleteImageIds);
      cloudinaryPathsToDelete = imagesToDelete.map((img) => img.imageUrl).filter((url): url is string => Boolean(url));
    }

    // ── Update DB ──────────────────────────────────────────────────────────
    const product = await productService.updateProduct(id, {
      ...parsedData,
      colorImages: colorImagesPayload,
    });

    // ── Xóa Cloudinary sau khi DB đã update thành công ────────────────────
    if (cloudinaryPathsToDelete.length > 0) {
      await deleteOldImages(cloudinaryPathsToDelete);
    }

    res.json({ data: product, message: "Cập nhật sản phẩm thành công" });
  } finally {
    cleanupTempFiles(files);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — SOFT DELETE / RESTORE / HARD DELETE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DELETE /admin/:id
 * Soft-delete sản phẩm (chuyển vào trash)
 */
export const softDeleteProductHandler = async (req: Request, res: Response) => {
  const deletedBy = req.user!.id;
  await productService.softDeleteProduct(req.params.id, deletedBy);
  res.json({ message: "Đã chuyển sản phẩm vào thùng rác" });
};

/**
 * POST /admin/:id/restore
 * Khôi phục sản phẩm từ trash
 */
export const restoreProductHandler = async (req: Request, res: Response) => {
  const result = await productService.restoreProduct(req.params.id);
  res.json({ data: result, message: "Khôi phục sản phẩm thành công" });
};

/**
 * DELETE /admin/:id/permanent
 * Xóa vĩnh viễn — phải soft-delete trước
 * Đồng thời xóa ảnh trên cloudinary
 */
export const hardDeleteProductHandler = async (req: Request, res: Response) => {
  const images = await productRepo.getColorImagesByProductId(req.params.id);

  await productService.hardDeleteProduct(req.params.id);

  const imageUrls = images.map((img) => img.imageUrl).filter((url): url is string => Boolean(url));

  // Xóa ảnh cloudinary sau khi DB đã xóa thành công
  await deleteOldImages(imageUrls);

  res.json({ message: "Xóa vĩnh viễn sản phẩm thành công" });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — BULK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /admin/bulk
 * Body: { action: "delete" | "restore" | "activate" | "deactivate" | "feature" | "unfeature", ids: string[] }
 */
export const bulkActionHandler = async (req: Request, res: Response) => {
  const { action, ids } = bulkActionSchema.parse(req.body);
  const adminId = req.user!.id;

  let message = "";
  let count = 0;

  switch (action) {
    case "delete": {
      const result = await productService.bulkSoftDeleteProducts(ids, adminId);
      count = result.count;
      message = `Đã chuyển ${count} sản phẩm vào thùng rác`;
      break;
    }
    case "activate": {
      const result = await productService.bulkUpdateProducts(ids, { isActive: true });
      count = result.count;
      message = `Đã kích hoạt ${count} sản phẩm`;
      break;
    }
    case "deactivate": {
      const result = await productService.bulkUpdateProducts(ids, { isActive: false });
      count = result.count;
      message = `Đã ẩn ${count} sản phẩm`;
      break;
    }
    case "feature": {
      const result = await productService.bulkUpdateProducts(ids, { isFeatured: true });
      count = result.count;
      message = `Đã đánh dấu nổi bật ${count} sản phẩm`;
      break;
    }
    case "unfeature": {
      const result = await productService.bulkUpdateProducts(ids, { isFeatured: false });
      count = result.count;
      message = `Đã bỏ nổi bật ${count} sản phẩm`;
      break;
    }
    default:
      res.status(400).json({ message: "Action không hợp lệ" });
      return;
  }

  res.json({ count, message });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — VARIANT SOFT DELETE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DELETE /admin/:id/variants/:variantId
 * Soft-delete một variant
 */
export const softDeleteVariantHandler = async (req: Request, res: Response) => {
  const result = await productService.softDeleteVariant(req.params.variantId, req.user!.id);
  res.json({ data: result, message: "Đã ẩn variant thành công" });
};

/**
 * POST /admin/:id/variants/:variantId/restore
 * Khôi phục variant
 */
export const restoreVariantHandler = async (req: Request, res: Response) => {
  const result = await productService.restoreVariant(req.params.variantId);
  res.json({ data: result, message: "Khôi phục variant thành công" });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — SEARCH SUGGESTIONS TRENDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/search-trending?q=&limit=8&category=dien-thoai
 *
 * Dùng cho input search dropdown:
 * - q rỗng → top trending (user vừa focus chưa gõ)
 * - q có nội dung → filter name ILIKE + sort viewsCount
 *
 * Response: [{ id, name, slug, thumbnail, viewsCount, priceOrigin, isTrending }]
 */
export const getSearchTrendingHandler = async (req: Request, res: Response) => {
  const { q, limit, category } = searchSuggestTrendingSchema.parse(req.query);
  const suggestions = await getSearchSuggestionsTrending(q, { limit, category });
  res.json({
    data: suggestions,
    total: suggestions.length,
    message: "Gợi ý tìm kiếm thành công",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — SALE SCHEDULE V2 (calendar metadata)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/sale-schedule-v2?startDate=2026-03-18&endDate=2026-04-01
 *
 * Trả về lịch sale dạng calendar (KHÔNG chứa products — chỉ metadata).
 * FE dùng để render ô ngày có/không có sale, rule discount loại gì.
 * Default: 14 ngày từ hôm nay. Max range: 60 ngày.
 *
 * Response:
 * [
 *   {
 *     date: "2026-03-19",
 *     isToday: false,
 *     hasActiveSale: true,
 *     promotions: [
 *       { id, name, description, startDate, endDate, priority, targetsCount,
 *         rules: [{ actionType: "DISCOUNT_PERCENT", discountValue: 10 }] }
 *     ]
 *   },
 *   ...
 * ]
 */
export const getSaleScheduleV2Handler = async (req: Request, res: Response) => {
  const { startDate, endDate } = saleScheduleQuerySchema.parse(req.query);
  const schedule = await getSaleScheduleV2(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  res.json({
    data: schedule,
    total: schedule.length,
    message: "Lấy lịch sale thành công",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — PRODUCTS ON SALE DATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/sale-by-date?date=2026-03-19&promotionId=xxx&page=1&limit=20
 *
 * FE gọi khi user click vào 1 ngày trên calendar để load products.
 * promotionId optional — nếu ngày đó có nhiều promotion, FE có thể filter riêng từng promotion.
 *
 * Response:
 * {
 *   date: "2026-03-19",
 *   promotions: [{ id, name, description, priority }],
 *   data: [{ card, pricingContext }],   ← format giống flash sale
 *   total, page, limit, totalPages
 * }
 */
export const getProductsByDateHandler = async (req: Request, res: Response) => {
  const { date, promotionId, page, limit, categoryId } = saleByDateQuerySchema.parse(req.query);
  const result = await getProductsOnSaleDate(new Date(date), {
    promotionId,
    page,
    limit,
    categoryId,
  });
  res.json({ ...result, message: "Lấy sản phẩm sale thành công" });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — PRODUCT COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/compare?ids=id1,id2,id3
 *
 * So sánh 2-4 sản phẩm CÙNG category.
 * Trả về spec matrix đã normalize, FE render thành bảng so sánh.
 *
 * Response:
 * {
 *   categoryId, categoryName, categorySlug,
 *   products: [{ id, name, slug, thumbnail, brand, price, inStock, rating, totalSoldCount }],
 *   specMatrix: [
 *     {
 *       groupName: "Màn hình",
 *       specs: [
 *         { key, name, icon, unit, values: ["6.1\"", "6.7\"", null] }
 *       ]
 *     }
 *   ]
 * }
 */
export const compareProductsHandler = async (req: Request, res: Response) => {
  const { ids } = compareProductsSchema.parse(req.query);
  const result = await compareProducts(ids);
  res.json({ data: result, message: "So sánh sản phẩm thành công" });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /products/admin/stats
 *
 * Dashboard overview:
 * { total, active, inactive, outOfStock, deleted, featured }
 */
export const getProductStatsHandler = async (_req: Request, res: Response) => {
  const stats = await getProductStats();
  res.json({ data: stats, message: "Lấy thống kê sản phẩm thành công" });
};
