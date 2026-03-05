import { Request, Response } from "express";
import { brandService } from "./brand.service";
import { parseMultipartData, uploadBrandImage } from "./brand.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { ListBrandsQuery } from "./brand.validation";

export const getBrandsPublicHandler = async (req: Request, res: Response) => {
  const brands = await brandService.getBrandsPublic(req.query as unknown as ListBrandsQuery);
  res.json({ data: brands, message: "Lấy danh sách thương hiệu thành công" });
};

export const getBrandsAdminHandler = async (req: Request, res: Response) => {
  const brands = await brandService.getBrandsAdmin(req.query as unknown as ListBrandsQuery);
  res.json({ data: brands, message: "Lấy danh sách thương hiệu thành công" });
};

export const getActiveBrandsHandler = async (req: Request, res: Response) => {
  const brands = await brandService.getActiveBrands();
  res.json({ data: brands, message: "Lấy danh sách thương hiệu thành công" });
};

export const getFeaturedBrandsHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
  const brands = await brandService.getFeaturedBrands(limit);
  res.json({ data: brands, message: "Lấy danh sách thương hiệu nổi bật thành công" });
};

export const getBrandBySlugHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "STAFF";
  const brand = await brandService.getBrandBySlug(req.params.slug, isAdmin);
  res.json({ data: brand, message: "Lấy chi tiết thương hiệu thành công" });
};

export const getBrandDetailHandler = async (req: Request, res: Response) => {
  const brand = await brandService.getBrandDetail(req.params.id);
  res.json({ data: brand, message: "Lấy chi tiết thương hiệu thành công" });
};

export const createBrandHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const uploadedImage = file ? await uploadBrandImage(file) : null;

    const brand = await brandService.createBrand({
      ...parsedBody,
      imageUrl: uploadedImage?.url,
      imagePath: uploadedImage?.publicId,
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
      ...(uploadedImage && {
        imageUrl: uploadedImage.url,
        imagePath: uploadedImage.publicId,
      }),
    });

    res.json({ data: brand, message: "Cập nhật thương hiệu thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const softDeleteBrandHandler = async (req: Request, res: Response) => {
  await brandService.softDeleteBrand(req.params.id, req.user!.id);
  res.json({ message: "Đã chuyển thương hiệu vào thùng rác" });
};

export const restoreBrandHandler = async (req: Request, res: Response) => {
  await brandService.restoreBrand(req.params.id);
  res.json({ message: "Khôi phục thương hiệu thành công" });
};

export const hardDeleteBrandHandler = async (req: Request, res: Response) => {
  await brandService.hardDeleteBrand(req.params.id);
  res.status(204).send();
};

export const getDeletedBrandsHandler = async (req: Request, res: Response) => {
  const brands = await brandService.getDeletedBrands(req.query as unknown as ListBrandsQuery);
  res.json({ data: brands, message: "Lấy danh sách thương hiệu đã xóa thành công" });
};