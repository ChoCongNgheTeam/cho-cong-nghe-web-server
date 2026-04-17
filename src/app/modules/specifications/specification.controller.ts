import { Request, Response } from "express";
import * as service from "./specification.service";
import { listSpecificationsSchema, createSpecificationSchema, updateSpecificationSchema } from "./specification.validation";
import { categorySpecParamsSchema, upsertCategorySpecSchema, bulkUpsertCategorySpecsSchema, removeCategorySpecSchema } from "./specification.validation";

export const getSpecificationsActiveHandler = async (req: Request, res: Response) => {
  const data = await service.getSpecificationsActive();
  res.json({ data, message: "Lấy danh sách thông số thành công" });
};

export const getSpecificationsAdminHandler = async (req: Request, res: Response) => {
  const query = listSpecificationsSchema.parse(req.query);
  const result = await service.getSpecificationsAdmin(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      activeCounts: result.activeCounts,
    },
    message: "Lấy danh sách thông số thành công",
  });
};

export const getSpecificationDetailHandler = async (req: Request, res: Response) => {
  const data = await service.getSpecificationById(req.params.id);
  res.json({ data, message: "Lấy chi tiết thông số thành công" });
};

export const createSpecificationHandler = async (req: Request, res: Response) => {
  const input = createSpecificationSchema.parse(req.body);
  const data = await service.createSpecification(input);
  res.status(201).json({ data, message: "Tạo thông số thành công" });
};

export const updateSpecificationHandler = async (req: Request, res: Response) => {
  const input = updateSpecificationSchema.parse(req.body);
  const data = await service.updateSpecification(req.params.id, input);
  res.json({ data, message: "Cập nhật thông số thành công" });
};

export const toggleSpecificationActiveHandler = async (req: Request, res: Response) => {
  const data = await service.toggleSpecificationActive(req.params.id);
  res.json({ data, message: "Cập nhật trạng thái thành công" });
};

export const getCategorySpecsHandler = async (req: Request, res: Response) => {
  const { categoryId } = categorySpecParamsSchema.parse(req.params);
  const data = await service.getCategorySpecs(categoryId);
  res.json({ data, message: "Lấy thông số danh mục thành công" });
};

export const upsertCategorySpecHandler = async (req: Request, res: Response) => {
  const { categoryId } = categorySpecParamsSchema.parse(req.params);
  const input = upsertCategorySpecSchema.parse(req.body);
  const data = await service.upsertCategorySpec(categoryId, input);
  res.json({ data, message: "Cập nhật thành công" });
};

export const bulkUpsertCategorySpecsHandler = async (req: Request, res: Response) => {
  const { categoryId } = categorySpecParamsSchema.parse(req.params);
  const input = bulkUpsertCategorySpecsSchema.parse(req.body);
  const data = await service.bulkUpsertCategorySpecs(categoryId, input);
  res.json({ data, message: "Cập nhật hàng loạt thành công" });
};

export const removeCategorySpecHandler = async (req: Request, res: Response) => {
  const { categoryId } = categorySpecParamsSchema.parse(req.params);
  const { specificationId } = removeCategorySpecSchema.parse(req.params); // now from params
  await service.removeCategorySpec(categoryId, specificationId);
  res.json({ message: "Xoá thành công" });
};
