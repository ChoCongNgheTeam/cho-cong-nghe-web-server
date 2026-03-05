import { Request, Response } from "express";
import * as productService from "./product.service";
import * as productRepo from "./product.repository";
import { ListProductsQuery, reviewsQuerySchema, searchSuggestSchema } from "./product.validation";
import { cleanupTempFiles, parseMultipartData, uploadColorImages, deleteOldImages } from "./product.helpers";
import { getProductsWithPricing } from "../pricing/use-cases/getProductsWithPricing.service";
import { getProductDetailWithPricing } from "../pricing/use-cases/getProductDetailWithPricing.service";
import { getProductVariantWithPricing } from "../pricing/use-cases/getProductVariantPricing.service";
import { getRelatedProductsWithPricing } from "../pricing/use-cases/getRelatedProductsWithPricing.service";
import { getFlashSaleProductsWithPricing } from "../pricing/use-cases/getFlashSaleProductsWithPricing.service";
import { getNewArrivalProductsWithPricing } from "../pricing/use-cases/getNewArrivalProductsWithPricing.service";
import { getBestSellingProductsWithPricing } from "../pricing/use-cases/getBestSellingProductsWithPricing.service";

const paginatedResponse = (result: any, message: string) => ({
  data: result.data,
  pagination: {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  },
  message,
});

//  Public

export const getProductsPublicHandler = async (req: Request, res: Response) => {
  const result = await getProductsWithPricing(req.query as unknown as ListProductsQuery, req.user?.id);
  res.json(paginatedResponse(result, "Lấy danh sách sản phẩm thành công"));
};

export const getSearchSuggestHandler = async (req: Request, res: Response) => {
  const query = searchSuggestSchema.parse(req.query);
  const suggestions = await productService.getSearchSuggestions(query);
  res.json({
    data: suggestions,
    total: suggestions.length,
    message: "Gợi ý tìm kiếm thành công",
  });
};

export const getProductBySlugHandler = async (req: Request, res: Response) => {
  const product = await getProductDetailWithPricing(req.params.slug, req.user?.id ?? undefined);
  res.json({ data: product, message: "Lấy chi tiết sản phẩm thành công" });
};

export const getProductVariantHandler = async (req: Request, res: Response) => {
  const result = await getProductVariantWithPricing(req.params.slug, req.query as Record<string, string>, req.user?.id);
  res.json({ data: result, message: "Lấy chi tiết variant thành công" });
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

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getProductsAdminHandler = async (req: Request, res: Response) => {
  const result = await productService.getProductsAdmin(req.query as unknown as ListProductsQuery);
  res.json(paginatedResponse(result, "Lấy danh sách sản phẩm thành công"));
};

export const getProductDetailHandler = async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ data: product, message: "Lấy chi tiết sản phẩm thành công" });
};

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
    const oldImages = files.length > 0 ? await productRepo.getColorImagesByProductId(id) : [];
    const parsedData = parseMultipartData(req.body);

    const uploadedColorImages = files.length > 0 && parsedData.colorImages ? await uploadColorImages(parsedData.colorImages, files) : [];

    const product = await productService.updateProduct(id, {
      ...parsedData,
      colorImages: uploadedColorImages.length > 0 ? uploadedColorImages : undefined,
    });

    if (oldImages.length > 0) {
      await deleteOldImages(oldImages.map((img) => img.imageUrl).filter((url): url is string => Boolean(url)));
    }

    res.json({ data: product, message: "Cập nhật sản phẩm thành công" });
  } finally {
    cleanupTempFiles(files);
  }
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  const images = await productRepo.getColorImagesByProductId(req.params.id);

  await productService.deleteProduct(req.params.id);

  const imageUrls = images.map((img) => img.imageUrl).filter((url): url is string => Boolean(url));

  await deleteOldImages(imageUrls);

  res.json({ message: "Xóa sản phẩm thành công" });
};
