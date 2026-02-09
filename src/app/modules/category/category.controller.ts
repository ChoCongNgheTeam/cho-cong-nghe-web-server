import { Request, Response, NextFunction } from "express";
import * as categoryService from "./category.service";
import { parseMultipartData, uploadCategoryImage } from "./category.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { ListCategoriesQuery } from "./category.validation";

type ValidatedQuery<T> = Request & {
  query: T;
};

export const getCategoriesPublicHandler = async (
  req: ValidatedQuery<ListCategoriesQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.getCategoriesPublic(req.query);

    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh sách danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoriesAdminHandler = async (
  req: ValidatedQuery<ListCategoriesQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.getCategoriesAdmin(req.query);

    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh sách danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getRootCategoriesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getRootCategories();
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh mục gốc thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const categories = await categoryService.getFeaturedCategories(limit);
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh mục nổi bật thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTreeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.json({
      success: true,
      data: tree,
      message: "Lấy cây danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlugHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    res.json({
      success: true,
      data: category,
      message: "Lấy chi tiết danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategoriesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh sách danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getRootCategoriesForAdminHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.getRootCategoriesForAdmin();
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      message: "Lấy danh mục gốc thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryDetailHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryDetail(id);
    res.json({
      success: true,
      data: category,
      message: "Lấy chi tiết danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const createCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);

    let uploadedImage = null;
    if (file) {
      uploadedImage = await uploadCategoryImage(file);
    }

    const category = await categoryService.createCategory({
      ...parsedBody,
      imageUrl: uploadedImage?.url,
      imagePath: uploadedImage?.publicId,
    });

    cleanupFile(file);

    res.status(201).json({
      success: true,
      data: category,
      message: "Tạo danh mục thành công",
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

export const updateCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    const { id } = req.params;
    const parsedBody = parseMultipartData(req.body);

    let uploadedImage = null;
    if (file) {
      uploadedImage = await uploadCategoryImage(file);
    }

    const updateData = {
      ...parsedBody,
      ...(uploadedImage && {
        imageUrl: uploadedImage.url,
        imagePath: uploadedImage.publicId,
      }),
    };

    const category = await categoryService.updateCategory(id, updateData);

    cleanupFile(file);

    res.json({
      success: true,
      data: category,
      message: "Cập nhật danh mục thành công",
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

export const deleteCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);

    res.json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const reorderCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.reorderCategory(req.body.categoryId, req.body.newPosition);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTemplateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryService.getCategoryTemplate(categoryId);

    res.json({
      success: true,
      data: result,
      message: "Lấy template thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttributesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attributes = await categoryService.getAllAttributes();

    res.json({
      success: true,
      data: attributes,
      total: attributes.length,
      message: "Lấy danh sách attributes thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getAttributeOptionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { attributeId } = req.params;
    const result = await categoryService.getAttributeOptions(attributeId);

    res.json({
      success: true,
      data: result,
      message: "Lấy options thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSpecificationsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const specifications = await categoryService.getAllSpecifications();

    res.json({
      success: true,
      data: specifications,
      total: specifications.length,
      message: "Lấy danh sách specifications thành công",
    });
  } catch (error) {
    next(error);
  }
};
