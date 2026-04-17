import { Request, Response } from "express";
import * as service from "./attribute.service";
import { listAttributesSchema, createAttributeSchema, updateAttributeSchema, createOptionSchema, updateOptionSchema } from "./attribute.validation";

// Public
export const getAttributesActiveHandler = async (req: Request, res: Response) => {
  const data = await service.getAttributesActive();
  res.json({ data, message: "Lấy danh sách thuộc tính thành công" });
};

// Admin
export const getAttributesAdminHandler = async (req: Request, res: Response) => {
  const query = listAttributesSchema.parse(req.query);
  const result = await service.getAttributesAdmin(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      activeCounts: result.activeCounts,
    },
    message: "Lấy danh sách thuộc tính thành công",
  });
};

export const getAttributeDetailHandler = async (req: Request, res: Response) => {
  const data = await service.getAttributeById(req.params.id);
  res.json({ data, message: "Lấy chi tiết thuộc tính thành công" });
};

export const createAttributeHandler = async (req: Request, res: Response) => {
  const input = createAttributeSchema.parse(req.body);
  const data = await service.createAttribute(input);
  res.status(201).json({ data, message: "Tạo thuộc tính thành công" });
};

export const updateAttributeHandler = async (req: Request, res: Response) => {
  const input = updateAttributeSchema.parse(req.body);
  const data = await service.updateAttribute(req.params.id, input);
  res.json({ data, message: "Cập nhật thuộc tính thành công" });
};

export const toggleAttributeActiveHandler = async (req: Request, res: Response) => {
  const data = await service.toggleAttributeActive(req.params.id);
  res.json({ data, message: "Cập nhật trạng thái thành công" });
};

// Options
export const createOptionHandler = async (req: Request, res: Response) => {
  const input = createOptionSchema.parse(req.body);
  const data = await service.createOption(req.params.id, input);
  res.status(201).json({ data, message: "Thêm option thành công" });
};

export const updateOptionHandler = async (req: Request, res: Response) => {
  const input = updateOptionSchema.parse(req.body);
  // ← truyền cả attributeId (req.params.id) để service kiểm tra duplicate value
  const data = await service.updateOption(req.params.id, req.params.optionId, input);
  res.json({ data, message: "Cập nhật option thành công" });
};
