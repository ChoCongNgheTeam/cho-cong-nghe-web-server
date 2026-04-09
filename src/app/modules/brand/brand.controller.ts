import { Request, Response } from "express";
import * as brandService from "./brand.service";
import { parseMultipartData, uploadBrandImage } from "./brand.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { listBrandsQuerySchema, featuredBrandsQuerySchema, brandByCategoryQuerySchema } from "./brand.validation";

// Public

export const getBrandsPublicHandler = async (req: Request, res: Response) => {
  const query = listBrandsQuerySchema.parse(req.query);
  const result = await brandService.getBrandsPublic(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách thương hiệu thành công",
  });
};

export const getActiveBrandsHandler = async (req: Request, res: Response) => {
  const brands = await brandService.getActiveBrands();
  res.json({ data: brands, message: "Lấy danh sách thương hiệu thành công" });
};

export const getFeaturedBrandsHandler = async (req: Request, res: Response) => {
  const { limit } = featuredBrandsQuerySchema.parse(req.query);
  const brands = await brandService.getFeaturedBrands(limit);
  res.json({ data: brands, message: "Lấy danh sách thương hiệu nổi bật thành công" });
};

export const getBrandBySlugHandler = async (req: Request, res: Response) => {
  const brand = await brandService.getBrandBySlug(req.params.slug);
  res.json({ data: brand, message: "Lấy chi tiết thương hiệu thành công" });
};

// Admin: list, detail

export const getBrandsAdminHandler = async (req: Request, res: Response) => {
  const query = listBrandsQuerySchema.parse(req.query);
  const result = await brandService.getBrandsAdmin(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      activeCounts: result.activeCounts,
    },
    message: "Lấy danh sách thương hiệu thành công",
  });
};

export const getBrandDetailHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const brand = await brandService.getBrandDetail(req.params.id, { isAdmin });
  res.json({ data: brand, message: "Lấy chi tiết thương hiệu thành công" });
};

// Admin: create, update

export const createBrandHandler = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    const parsedBody = parseMultipartData(req.body);
    const uploadedImage = file ? await uploadBrandImage(file) : null;

    const brand = await brandService.createBrand({
      ...parsedBody,
      ...(uploadedImage && { imageUrl: uploadedImage.url, imagePath: uploadedImage.publicId }),
    });

    res.status(201).json({ data: brand, message: "Tạo thương hiệu thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const updateBrandHandler = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    const parsedBody = parseMultipartData(req.body);
    const uploadedImage = file ? await uploadBrandImage(file) : null;

    const brand = await brandService.updateBrand(req.params.id, {
      ...parsedBody,
      ...(uploadedImage && { imageUrl: uploadedImage.url, imagePath: uploadedImage.publicId }),
    });

    res.json({ data: brand, message: "Cập nhật thương hiệu thành công" });
  } finally {
    cleanupFile(file);
  }
};

// Admin: soft delete, restore, hard delete, trash

export const deleteBrandHandler = async (req: Request, res: Response) => {
  await brandService.softDeleteBrand(req.params.id, req.user!.id);
  res.json({ message: "Xóa thương hiệu thành công" });
};

export const restoreBrandHandler = async (req: Request, res: Response) => {
  const brand = await brandService.restoreBrand(req.params.id);
  res.json({ data: brand, message: "Khôi phục thương hiệu thành công" });
};

export const hardDeleteBrandHandler = async (req: Request, res: Response) => {
  await brandService.hardDeleteBrand(req.params.id);
  res.json({ message: "Xóa vĩnh viễn thương hiệu thành công" });
};

export const getDeletedBrandsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await brandService.getDeletedBrands({ page, limit });
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
    message: "Lấy danh sách thương hiệu đã xóa thành công",
  });
};

export const getBrandsByCategoryHandler = async (req: Request, res: Response) => {
  const { slug } = brandByCategoryQuerySchema.parse(req.query);
  // console.log(slug);

  const brands = await brandService.getBrandsByCategorySlug(slug);
  res.json({ data: brands, message: "Lấy danh sách thương hiệu theo danh mục thành công" });
};
