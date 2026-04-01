import { Request, Response } from "express";
import { getAllCategoriesWithAttributes, getAttributeOptions, getCategoryAttributes, updateCategoryAttributes } from "./category-variant-attribute.service";

/** GET /api/v1/category-variant-attributes */
export const getAllCategoriesWithAttributesHandler = async (req: Request, res: Response) => {
  const data = await getAllCategoriesWithAttributes();
  res.json({ data, message: "Lấy danh sách thành công" });
};

/** GET /api/v1/category-variant-attributes/attributes */
export const getAttributeOptionsHandler = async (req: Request, res: Response) => {
  const data = await getAttributeOptions();
  res.json({ data, message: "Lấy danh sách attributes thành công" });
};

/** GET /api/v1/category-variant-attributes/:categoryId */
export const getCategoryAttributesHandler = async (req: Request, res: Response) => {
  const data = await getCategoryAttributes(req.params.categoryId);
  res.json({ data, message: "Lấy thành công" });
};

/** PUT /api/v1/category-variant-attributes/:categoryId */
export const updateCategoryAttributesHandler = async (req: Request, res: Response) => {
  const data = await updateCategoryAttributes(req.params.categoryId, req.body);
  res.json({ data, message: "Cập nhật thành công" });
};
