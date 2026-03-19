import { Request, Response } from "express";
import * as service from "./specification.service";
import { listSpecificationsSchema, createSpecificationSchema, updateSpecificationSchema } from "./specification.validation";

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
