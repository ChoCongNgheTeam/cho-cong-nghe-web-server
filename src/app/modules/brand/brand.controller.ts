import { Request, Response, NextFunction } from "express";
import { brandService } from "./brand.service";
import { parseMultipartData, uploadBrandImage } from "./brand.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { ListBrandsQuery } from "./brand.validation";

type ValidatedQuery<T> = Request & {
  query: T;
};

export const getBrandsPublicHandler = async (
  req: ValidatedQuery<ListBrandsQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const brands = await brandService.getBrandsPublic(req.query);

    res.status(200).json({
      success: true,
      data: brands,
      message: "Lấy danh sách thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandsAdminHandler = async (
  req: ValidatedQuery<ListBrandsQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const brands = await brandService.getBrandsAdmin(req.query);

    res.status(200).json({
      success: true,
      data: brands,
      message: "Lấy danh sách thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveBrandsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await brandService.getActiveBrands();

    res.status(200).json({
      success: true,
      data: brands,
      message: "Lấy danh sách thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedBrandsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const brands = await brandService.getFeaturedBrands(limit);

    res.status(200).json({
      success: true,
      data: brands,
      message: "Lấy danh sách thương hiệu nổi bật thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandBySlugHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const brand = await brandService.getBrandBySlug(slug);

    res.status(200).json({
      success: true,
      data: brand,
      message: "Lấy chi tiết thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandDetailHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrandDetail(id);

    res.status(200).json({
      success: true,
      data: brand,
      message: "Lấy chi tiết thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const createBrandHandler = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);

    let uploadedImage = null;
    if (file) {
      uploadedImage = await uploadBrandImage(file);
    }

    const brand = await brandService.createBrand({
      ...parsedBody,
      imageUrl: uploadedImage?.url,
      imagePath: uploadedImage?.publicId,
    });

    cleanupFile(file);

    res.status(201).json({
      success: true,
      data: brand,
      message: "Tạo thương hiệu thành công",
    });
  } catch (error: any) {
    cleanupFile(file);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    next(error);
  }
};

export const updateBrandHandler = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    const { id } = req.params;
    const parsedBody = parseMultipartData(req.body);

    let uploadedImage = null;
    if (file) {
      uploadedImage = await uploadBrandImage(file);
    }

    const updateData = {
      ...parsedBody,
      ...(uploadedImage && {
        imageUrl: uploadedImage.url,
        imagePath: uploadedImage.publicId,
      }),
    };

    const brand = await brandService.updateBrand(id, updateData);

    cleanupFile(file);

    res.status(200).json({
      success: true,
      data: brand,
      message: "Cập nhật thương hiệu thành công",
    });
  } catch (error: any) {
    cleanupFile(file);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    next(error);
  }
};

export const deleteBrandHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await brandService.deleteBrand(id);

    res.status(200).json({
      success: true,
      message: "Xóa thương hiệu thành công",
    });
  } catch (error) {
    next(error);
  }
};
