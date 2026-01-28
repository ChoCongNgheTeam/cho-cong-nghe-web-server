import { Request, Response } from "express";
import * as productService from "./product.service";
import * as productRepo from "./product.repository";
import { ListProductsQuery, reviewsQuerySchema } from "./product.validation";
import {
  cleanupTempFiles,
  parseMultipartData,
  uploadColorImages,
  deleteOldImages,
} from "./product.helpers";
import {
  getProductsWithPricing,
  getProductDetailWithPricing,
  getProductVariantWithPricing,
  getRelatedProductsWithPricing,
} from "../pricing";
import { getFlashSaleProductsWithPricing } from "../pricing/use-cases/getFlashSaleProductsWithPricing.service";
import { getFeaturedProductsByCategoriesWithPricing } from "../pricing/use-cases/getFeaturedProductsByCategoriesWithPricing.service";
import { getNewArrivalProductsWithPricing } from "../pricing/use-cases/getNewArrivalProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";

type ValidatedQuery<T> = Request & {
  query: T;
};

// =====================
// === PUBLIC HANDLERS ===
// =====================

export const getProductsPublicHandler = async (
  req: ValidatedQuery<ListProductsQuery>,
  res: Response,
) => {
  try {
    const userId = (req as any).user?.id;
    const result = await getProductsWithPricing(req.query, userId);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getProductBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id || null;
    const product = await getProductDetailWithPricing(slug, userId);

    res.json({
      success: true,
      data: product,
      message: "Lấy chi tiết sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getProductVariantHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id;

    const options: Record<string, string> = {};

    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string" && value) {
        options[key] = value;
      }
    }

    const result = await getProductVariantWithPricing(
      slug,
      Object.keys(options).length ? options : undefined,
      userId,
    );

    res.json({
      success: true,
      data: result,
      message: "Lấy chi tiết variant thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getProductGalleryHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const gallery = await productService.getProductGallery(slug);

    res.json({
      success: true,
      data: gallery,
      message: "Lấy gallery thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getProductBySpecificationsHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const specs = await productService.getProductSpecificationsBySlug(slug);

    res.json({
      success: true,
      data: specs,
      message: "Lấy thông số kỹ thuật thành công",
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getRelatedProductsHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id;

    const DEFAULT_LIMIT = 8;
    const MAX_LIMIT = 12;

    const rawLimit = Number(req.query.limit);
    const limit =
      Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    const products = await getRelatedProductsWithPricing(slug, limit, userId);

    res.json({
      success: true,
      data: products,
      message: "Lấy sản phẩm tương tự thành công",
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getProductReviewsHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const query = reviewsQuerySchema.parse(req.query);
    const result = await productService.getProductReviews(slug, query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy đánh giá thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// =====================
// === ADMIN HANDLERS ===
// =====================

export const getProductsAdminHandler = async (
  req: ValidatedQuery<ListProductsQuery>,
  res: Response,
) => {
  try {
    const result = await productService.getProductsAdmin(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getProductDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.json({
      success: true,
      data: product,
      message: "Lấy chi tiết sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const createProductHandler = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];

  try {
    // Parse data từ form-data
    const parsedBody = parseMultipartData(req.body);

    // Upload color images
    let uploadedColorImages: any[] = [];
    if (files.length > 0 && parsedBody.colorImages?.length > 0) {
      uploadedColorImages = await uploadColorImages(parsedBody.colorImages, files);
    }

    // Create product with color images
    const product = await productService.createProduct({
      ...parsedBody,
      colorImages: uploadedColorImages,
    });

    // Cleanup temp files
    cleanupTempFiles(files);

    res.status(201).json({
      success: true,
      data: product,
      message: "Tạo sản phẩm thành công",
    });
  } catch (error: any) {
    cleanupTempFiles(files);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const updateProductHandler = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const { id } = req.params;

  try {
    // Get old color images for cleanup
    const oldImages = files.length > 0 ? await productRepo.getColorImagesByProductId(id) : [];

    // Parse multipart data
    const parsedData = parseMultipartData(req.body);

    // Upload new color images if any
    let uploadedColorImages: any[] = [];
    if (files.length > 0 && parsedData.colorImages) {
      uploadedColorImages = await uploadColorImages(parsedData.colorImages, files);
    }

    // Update product
    const product = await productService.updateProduct(id, {
      ...parsedData,
      colorImages: uploadedColorImages.length > 0 ? uploadedColorImages : undefined,
    });

    // Delete old images from Cloudinary
    if (oldImages.length > 0) {
      await deleteOldImages(
        oldImages.map((img) => img.imageUrl).filter((url): url is string => Boolean(url)),
      );
    }

    // Cleanup temp files
    cleanupTempFiles(files);

    res.json({
      success: true,
      data: product,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error: any) {
    cleanupTempFiles(files);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get color images before delete
    const images = await productRepo.getColorImagesByProductId(id);

    // Delete product
    await productService.deleteProduct(id);

    // Delete images from Cloudinary
    const imageUrls = images
      .map((img) => img.imageUrl)
      .filter((url): url is string => Boolean(url));

    await deleteOldImages(imageUrls);

    res.json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get flash sale products (active today)
 * GET /products/flash-sale?date=2026-01-27&limit=20&categoryId=xxx
 */
export const getFlashSaleProductsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const categoryId = req.query.categoryId as string | undefined;

    const result = await getFlashSaleProductsWithPricing(date, { limit, categoryId }, userId);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      date: result.date,
      message: "Lấy sản phẩm flash sale thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get categories with sale products
 * GET /products/sale-categories?date=2026-01-27
 */
export const getCategoriesWithSaleProductsHandler = async (req: Request, res: Response) => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    const categories = await productService.getCategoriesWithSaleProducts(date);

    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh mục có sản phẩm sale thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get featured products by categories
 * GET /products/featured-by-categories?limit=8&categoriesLimit=6
 */
export const getFeaturedProductsByCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
    const categoriesLimit = req.query.categoriesLimit
      ? parseInt(req.query.categoriesLimit as string)
      : 6;

    const sections = await getFeaturedProductsByCategoriesWithPricing(
      {
        limit,
        categoriesLimit,
      },
      userId,
    );

    res.json({
      success: true,
      data: sections,
      total: sections.length,
      message: "Lấy sản phẩm featured theo danh mục thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get upcoming promotions
 * GET /products/upcoming-promotions?limit=5
 */
export const getUpcomingPromotionsHandler = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const promotions = await productService.getUpcomingPromotions(limit);

    res.json({
      success: true,
      data: promotions,
      total: promotions.length,
      message: "Lấy danh sách promotion sắp tới thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get products by promotion (preview)
 * GET /products/promotion/:promotionId?limit=20
 */
export const getProductsByPromotionHandler = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await productService.getProductsByPromotion(promotionId, limit);

    res.json({
      success: true,
      data: result,
      message: "Lấy sản phẩm trong promotion thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get best selling products
 * GET /products/best-selling?limit=12
 */
export const getBestSellingProductsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    const products = await getBestSellingProductsWithPricing(limit, userId);

    res.json({
      success: true,
      data: products,
      total: products.length,
      message: "Lấy sản phẩm bán chạy thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get new arrival products
 * GET /products/new-arrivals?daysAgo=30&limit=12
 */
export const getNewArrivalProductsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const daysAgo = req.query.daysAgo ? parseInt(req.query.daysAgo as string) : 30;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

    const products = await getNewArrivalProductsWithPricing(daysAgo, limit, userId);

    res.json({
      success: true,
      data: products,
      total: products.length,
      message: "Lấy sản phẩm mới về thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get sale schedule (Flash Sale timeline)
 * GET /products/sale-schedule?startDate=2026-01-27&endDate=2026-01-31
 */
export const getSaleScheduleHandler = async (req: Request, res: Response) => {
  try {
    const startDateParam = req.query.startDate as string;
    const endDateParam = req.query.endDate as string;

    // Default: today to 7 days later
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const schedule = await productService.getSaleSchedule(startDate, endDate);

    res.json({
      success: true,
      data: schedule,
      total: schedule.length,
      message: "Lấy lịch sale thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
