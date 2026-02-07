import { Request, Response } from "express";
import * as categoryService from "./category.service";

// =====================
// === PUBLIC CONTROLLERS ===
// =====================

export const getRootCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getRootCategories();
    res.json({
      data: categories,
      total: categories.length,
      message: "Lấy danh mục gốc thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

export const getFeaturedCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const categories = await categoryService.getFeaturedCategories(limit);
    res.json({
      data: categories,
      total: categories.length,
      message: "Lấy danh mục nổi bật thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

export const getCategoryTreeHandler = async (req: Request, res: Response) => {
  try {
    const tree = await categoryService.getCategoryTree();
    res.json({
      data: tree,
      message: "Lấy cây danh mục thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

export const getCategoryBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    res.json({
      data: category,
      message: "Lấy chi tiết danh mục thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// =====================
// === ADMIN CONTROLLERS ===
// =====================

export const getAllCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      data: categories,
      total: categories.length,
      message: "Lấy danh sách danh mục thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

export const getRootCategoriesForAdminHandler = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getRootCategoriesForAdmin();
    res.json({
      data: categories,
      total: categories.length,
      message: "Lấy danh mục gốc thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

export const getCategoryDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryDetail(id);
    res.json({
      data: category,
      message: "Lấy chi tiết danh mục thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      data: category,
      message: "Tạo danh mục thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    res.json({
      data: category,
      message: "Cập nhật danh mục thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.json({
      message: "Xóa danh mục thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

export const reorderCategoryHandler = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.reorderCategory(req.body.categoryId, req.body.newPosition);
    res.json(result);
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

/**
 * GET /api/v1/categories/:categoryId/template
 * Lấy template (attributes + specifications) cho category
 */
export const getCategoryTemplateHandler = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryService.getCategoryTemplate(categoryId);

    res.json({
      success: true,
      data: result,
      message: "Lấy template thành công",
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
 * GET /api/v1/categories/attributes/all
 * Lấy tất cả attributes (cho dropdown custom)
 */
export const getAllAttributesHandler = async (req: Request, res: Response) => {
  try {
    const attributes = await categoryService.getAllAttributes();

    res.json({
      success: true,
      data: attributes,
      total: attributes.length,
      message: "Lấy danh sách attributes thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * GET /api/v1/categories/attributes/:attributeId/options
 * Lấy options cho attribute
 */
export const getAttributeOptionsHandler = async (req: Request, res: Response) => {
  try {
    const { attributeId } = req.params;
    const result = await categoryService.getAttributeOptions(attributeId);

    res.json({
      success: true,
      data: result,
      message: "Lấy options thành công",
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
 * GET /api/v1/categories/specifications/all
 * Lấy tất cả specifications (cho dropdown custom)
 */
export const getAllSpecificationsHandler = async (req: Request, res: Response) => {
  try {
    const specifications = await categoryService.getAllSpecifications();

    res.json({
      success: true,
      data: specifications,
      total: specifications.length,
      message: "Lấy danh sách specifications thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
