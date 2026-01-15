import { Request, Response } from "express";
import * as productService from "./product.service";
import * as productRepo from "./product.repository";
import {
  listProductsSchema,
  createProductSchema,
  updateProductSchema,
  reviewsQuerySchema,
  bulkUpdateSchema,
  ListProductsQuery,
} from "./product.validation";
import { uploadImage, deleteImage } from "@/services/cloudinary.service";
import fs from "fs";

type ValidatedQuery<T> = Request & {
  query: T;
};

// =====================
// === HELPERS ===
// =====================

/**
 * Cleanup temporary uploaded files
 */
const cleanupTempFiles = (files: Express.Multer.File[]) => {
  files.forEach((file) => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

/**
 * Parse multipart form data
 */
const parseMultipartData = (body: any): any => {
  let data = { ...body };

  // Parse JSON string nếu có field 'data'
  if (body.data && typeof body.data === "string") {
    try {
      const parsedData = JSON.parse(body.data);
      data = { ...data, ...parsedData };
      delete data.data; // Remove redundant field
    } catch (e) {
      throw new Error("Format dữ liệu JSON không hợp lệ");
    }
  }

  // Parse các field array/object nếu chúng là string
  const fieldsToParse = ["variants", "highlights", "specifications", "categories"];

  fieldsToParse.forEach((field) => {
    if (data[field] && typeof data[field] === "string") {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        throw new Error(`Format JSON của field '${field}' không hợp lệ`);
      }
    }
  });

  return data;
};

/**
 * Upload images for variants
 */
const uploadVariantImages = async (
  variants: any[],
  files: Express.Multer.File[]
): Promise<void> => {
  if (!files || files.length === 0) return;

  await Promise.all(
    variants.map(async (variant, index) => {
      // Files cho variant này có fieldname = `variant_${index}`
      const variantFiles = files.filter((f) => f.fieldname === `variant_${index}`);

      if (variantFiles.length > 0) {
        // Upload lên Cloudinary
        const uploadPromises = variantFiles.map((file) => uploadImage(file.path, "products"));
        const uploadedImages = await Promise.all(uploadPromises);

        // Gán vào variant.images
        variant.images = uploadedImages.map((img, idx) => ({
          imageUrl: img.url,
          publicId: img.publicId,
          altText: variant.altText || variant.code,
        }));
      } else {
        // Giữ nguyên images nếu không upload mới
        variant.images = variant.images || [];
      }
    })
  );
};

/**
 * Delete old images from Cloudinary
 */
const deleteOldImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map(async (url) => {
    try {
      // Extract publicId from Cloudinary URL
      // Format: https://res.cloudinary.com/[cloud]/image/upload/v[version]/[publicId].[ext]
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      if (matches && matches[1]) {
        await deleteImage(matches[1]);
      }
    } catch (err) {
      console.error(`Failed to delete image: ${url}`, err);
    }
  });

  await Promise.all(deletePromises);
};

export const getProductsPublicHandler = async (
  req: ValidatedQuery<ListProductsQuery>,
  res: Response
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
    const product = await productService.getProductBySlug(slug);

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
    const { code, ...queryOptions } = req.query;

    // Filter để chỉ lấy các attribute options (bỏ code)
    const options: Record<string, string> = {};
    for (const [key, value] of Object.entries(queryOptions)) {
      if (typeof value === "string" && value) {
        options[key] = value;
      }
    }

    const variant = await productService.getProductVariant(
      slug,
      code as string | undefined,
      Object.keys(options).length > 0 ? options : undefined
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

export const getProductsAdminHandler = async (req: Request, res: Response) => {
  try {
    const query = listProductsSchema.parse(req.query);
    const result = await productService.getProductsAdmin(query);

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
    // 1. Parse multipart data
    const rawData = parseMultipartData(req.body);

    // 2. Upload images nếu có
    if (files.length > 0 && rawData.variants) {
      await uploadVariantImages(rawData.variants, files);
    }

    // 3. Validate data
    const validatedData = createProductSchema.parse(rawData);

    // 4. Create product
    const product = await productService.createProduct(validatedData);

    // 5. Cleanup temp files
    cleanupTempFiles(files);

    res.status(201).json({
      success: true,
      data: product,
      message: "Tạo sản phẩm thành công",
    });
  } catch (error: any) {
    // Cleanup on error
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

export const updateProductHandler = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const { id } = req.params;

  try {
    // 1. Get old images for cleanup
    const oldImages = files.length > 0 ? await productRepo.getVariantImagesByProductId(id) : [];

    // 2. Parse multipart data
    const rawData = parseMultipartData(req.body);

    // 3. Upload new images nếu có
    if (files.length > 0 && rawData.variants) {
      await uploadVariantImages(rawData.variants, files);
    }

    // 4. Validate data
    const validatedData = updateProductSchema.parse(rawData);

    // 5. Update product
    const product = await productService.updateProduct(id, validatedData);

    // 6. Delete old images from Cloudinary
    if (oldImages.length > 0) {
      await deleteOldImages(oldImages.map((img) => img.imageUrl));
    }

    // 7. Cleanup temp files
    cleanupTempFiles(files);

    res.json({
      success: true,
      data: product,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error: any) {
    // Cleanup on error
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
    if (images.length > 0) {
      await deleteOldImages(images.map((img) => img.imageUrl));
    }

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

export const bulkUpdateProductsHandler = async (req: Request, res: Response) => {
  try {
    const input = bulkUpdateSchema.parse(req.body);
    const result = await productService.bulkUpdateProducts(input);

    res.json({
      success: true,
      data: result,
      message: `Cập nhật ${result.updated} sản phẩm thành công`,
    });
  } catch (error: any) {
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
