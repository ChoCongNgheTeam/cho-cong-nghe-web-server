import { Request, Response } from "express";
import * as categoryService from "./category.service";

// === PUBLIC CONTROLLERS ===

// Lấy root categories cho home
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

// Lấy featured categories cho Home
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

// Lấy category tree cho menu
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

// Lấy category theo slug
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

// === ADMIN CONTROLLERS ===

// Lấy tất cả categories (admin)
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

// Lấy root categories cho admin
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

// Lấy category detail với children (admin)
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

// Tạo category
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

// Update category
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

// Delete category
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

// Reorder category
export const reorderCategoryHandler = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.reorderCategory(req.body.categoryId, req.body.newPosition);
    res.json(result);
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};
