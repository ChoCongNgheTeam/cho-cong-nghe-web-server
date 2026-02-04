import { Request, Response, NextFunction } from "express";
import { brandService } from "./brand.service";
import { parseMultipartData, uploadBrandImage, cleanupTempFiles } from "./brand.helper";

export const getActiveBrandsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await brandService.getActiveBrands();

    res.status(200).json({
      success: true,
      data: brands,
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
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBrandsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await brandService.getAllBrands();

    res.status(200).json({
      success: true,
      data: brands,
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
    });
  } catch (error) {
    next(error);
  }
};

export const createBrandHandler = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    // Parse data từ form-data
    const parsedBody = parseMultipartData(req.body);

    // Upload image nếu có
    let uploadedImage;
    if (file) {
      uploadedImage = await uploadBrandImage(file);
    }

    // Create brand
    const brand = await brandService.createBrand(parsedBody, uploadedImage);

    // Cleanup temp file
    if (file) {
      cleanupTempFiles([file]);
    }

    res.status(201).json({
      success: true,
      message: "Tạo thương hiệu thành công",
      data: brand,
    });
  } catch (error: any) {
    // Cleanup temp file on error
    if (file) {
      cleanupTempFiles([file]);
    }

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

    // Parse data từ form-data
    const parsedBody = parseMultipartData(req.body);

    // Upload image nếu có
    let uploadedImage;
    if (file) {
      uploadedImage = await uploadBrandImage(file);
    }

    // Update brand
    const brand = await brandService.updateBrand(id, parsedBody, uploadedImage);

    // Cleanup temp file
    if (file) {
      cleanupTempFiles([file]);
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thương hiệu thành công",
      data: brand,
    });
  } catch (error: any) {
    // Cleanup temp file on error
    if (file) {
      cleanupTempFiles([file]);
    }

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

    const result = await brandService.deleteBrand(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
