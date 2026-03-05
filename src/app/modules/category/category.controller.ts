import { Request, Response } from "express";
import * as categoryService from "./category.service";
import { parseMultipartData, uploadCategoryImage } from "./category.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { ListCategoriesQuery } from "./category.validation";

export const getCategoriesPublicHandler = async (req: Request, res: Response) => {
  const categories = await categoryService.getCategoriesPublic(req.query as unknown as ListCategoriesQuery);
  res.json({ data: categories, total: categories.length, message: "Lấy danh sách danh mục thành công" });
};

export const getCategoriesAdminHandler = async (req: Request, res: Response) => {
  const categories = await categoryService.getCategoriesAdmin(req.query as unknown as ListCategoriesQuery);
  res.json({ data: categories, total: categories.length, message: "Lấy danh sách danh mục thành công" });
};

export const getRootCategoriesHandler = async (req: Request, res: Response) => {
  const categories = await categoryService.getRootCategories();
  res.json({ data: categories, total: categories.length, message: "Lấy danh mục gốc thành công" });
};

export const getFeaturedCategoriesHandler = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const categories = await categoryService.getFeaturedCategories(limit);
  res.json({ data: categories, total: categories.length, message: "Lấy danh mục nổi bật thành công" });
};

export const getCategoryTreeHandler = async (req: Request, res: Response) => {
  const tree = await categoryService.getCategoryTree();
  res.json({ data: tree, message: "Lấy cây danh mục thành công" });
};

export const getCategoryBySlugHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "STAFF";
  const category = await categoryService.getCategoryBySlug(req.params.slug, isAdmin);
  res.json({ data: category, message: "Lấy chi tiết danh mục thành công" });
};

export const getRootCategoriesForAdminHandler = async (req: Request, res: Response) => {
  const categories = await categoryService.getRootCategoriesForAdmin();
  res.json({ data: categories, total: categories.length, message: "Lấy danh mục gốc thành công" });
};

export const getCategoryDetailHandler = async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryDetail(req.params.id);
  res.json({ data: category, message: "Lấy chi tiết danh mục thành công" });
};

export const createCategoryHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const uploadedImage = file ? await uploadCategoryImage(file) : null;

    const categoryData = {
      ...parsedBody,
      imageUrl: uploadedImage?.url,
      imagePath: uploadedImage?.publicId,
    };

    const category = await categoryService.createCategory(categoryData);
    res.status(201).json({ data: category, message: "Tạo danh mục thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const uploadedImage = file ? await uploadCategoryImage(file) : null;

    const categoryData = {
      ...parsedBody,
      ...(uploadedImage && {
        imageUrl: uploadedImage.url,
        imagePath: uploadedImage.publicId,
      }),
    };

    const category = await categoryService.updateCategory(req.params.id, categoryData);
    res.json({ data: category, message: "Cập nhật danh mục thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const softDeleteCategoryHandler = async (req: Request, res: Response) => {
  await categoryService.softDeleteCategory(req.params.id, req.user!.id);
  res.json({ message: "Đã chuyển danh mục vào thùng rác" });
};

export const restoreCategoryHandler = async (req: Request, res: Response) => {
  await categoryService.restoreCategory(req.params.id);
  res.json({ message: "Khôi phục danh mục thành công" });
};

export const hardDeleteCategoryHandler = async (req: Request, res: Response) => {
  await categoryService.hardDeleteCategory(req.params.id);
  res.status(204).send();
};

export const getDeletedCategoriesHandler = async (req: Request, res: Response) => {
  const categories = await categoryService.getDeletedCategories(req.query as unknown as ListCategoriesQuery);
  res.json({ data: categories, message: "Lấy danh sách danh mục đã xóa thành công" });
};

export const reorderCategoryHandler = async (req: Request, res: Response) => {
  const result = await categoryService.reorderCategory(req.body.categoryId, req.body.newPosition);
  res.json(result);
};

export const getCategoryTemplateHandler = async (req: Request, res: Response) => {
  const result = await categoryService.getCategoryTemplate(req.params.categoryId);
  res.json({ data: result, message: "Lấy template thành công" });
};

export const getAllAttributesHandler = async (req: Request, res: Response) => {
  const attributes = await categoryService.getAllAttributes();
  res.json({ data: attributes, total: attributes.length, message: "Lấy danh sách attributes thành công" });
};

export const getAttributeOptionsHandler = async (req: Request, res: Response) => {
  const result = await categoryService.getAttributeOptions(req.params.attributeId);
  res.json({ data: result, message: "Lấy options thành công" });
};

export const getAllSpecificationsHandler = async (req: Request, res: Response) => {
  const specifications = await categoryService.getAllSpecifications();
  res.json({ data: specifications, total: specifications.length, message: "Lấy danh sách specifications thành công" });
};