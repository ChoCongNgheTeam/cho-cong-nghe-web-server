import { Request, Response } from "express";
import * as productService from "./product.service";
import * as productRepo from "./product.repository";
import { ListProductsQuery, reviewsQuerySchema } from "./product.validation";
import {
  cleanupTempFiles,
  parseMultipartData,
  uploadVariantImages,
  deleteOldImages,
} from "./product.helpers";

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
    const result = await productService.getProductsPublic(req.query);

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

    const product = await productService.getProductBySlug(slug, userId);

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
    const { ...queryOptions } = req.query;

    const options: Record<string, string> = {};
    for (const [key, value] of Object.entries(queryOptions)) {
      if (typeof value === "string" && value) {
        options[key] = value;
      }
    }

    const variant = await productService.getProductVariant(
      slug,
      Object.keys(options).length > 0 ? options : undefined,
    );

    res.json({
      success: true,
      data: variant,
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

    const DEFAULT_LIMIT = 8;
    const MAX_LIMIT = 12;

    const rawLimit = Number(req.query.limit);
    const limit =
      Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    const products = await productService.getRelatedProducts(slug, limit);

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

    // Upload images cho variants
    if (files.length > 0 && parsedBody.variants?.length > 0) {
      await uploadVariantImages(parsedBody.variants, files);
    }

    // Create product (validation đã được thực hiện trong route middleware)
    const product = await productService.createProduct(parsedBody);

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
    // Get old images for cleanup
    const oldImages = files.length > 0 ? await productRepo.getVariantImagesByProductId(id) : [];

    // Parse multipart data
    const parsedData = parseMultipartData(req.body);

    // Upload new images if any
    if (files.length > 0 && parsedData.variants) {
      await uploadVariantImages(parsedData.variants, files);
    }

    // Update product
    const product = await productService.updateProduct(id, parsedData);

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

    // Get images before delete
    const images = await productRepo.getVariantImagesByProductId(id);

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
