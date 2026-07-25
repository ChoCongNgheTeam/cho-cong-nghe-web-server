import { Request, Response } from "express";
import * as warehouseService from "./warehouse.service";
import { listWarehousesQuerySchema } from "./warehouse.validation";

export const getWarehousesAdminHandler = async (req: Request, res: Response) => {
  const query = listWarehousesQuerySchema.parse(req.query);
  const result = await warehouseService.getWarehousesAdmin(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách kho hàng thành công",
  });
};

export const getActiveWarehousesLiteHandler = async (_req: Request, res: Response) => {
  const warehouses = await warehouseService.getActiveWarehousesLite();
  res.json({ data: warehouses, message: "Lấy danh sách kho đang hoạt động thành công" });
};

export const getWarehouseDetailHandler = async (req: Request, res: Response) => {
  const warehouse = await warehouseService.getWarehouseDetail(req.params.id);
  res.json({ data: warehouse, message: "Lấy chi tiết kho hàng thành công" });
};

export const createWarehouseHandler = async (req: Request, res: Response) => {
  const warehouse = await warehouseService.createWarehouse(req.body);
  res.status(201).json({ data: warehouse, message: "Tạo kho hàng thành công" });
};

export const updateWarehouseHandler = async (req: Request, res: Response) => {
  const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
  res.json({ data: warehouse, message: "Cập nhật kho hàng thành công" });
};

export const deleteWarehouseHandler = async (req: Request, res: Response) => {
  await warehouseService.softDeleteWarehouse(req.params.id, req.user!.id);
  res.json({ message: "Xóa kho hàng thành công" });
};

export const restoreWarehouseHandler = async (req: Request, res: Response) => {
  const warehouse = await warehouseService.restoreWarehouse(req.params.id);
  res.json({ data: warehouse, message: "Khôi phục kho hàng thành công" });
};

export const setDefaultWarehouseHandler = async (req: Request, res: Response) => {
  const warehouse = await warehouseService.setDefaultWarehouse(req.params.id);
  res.json({ data: warehouse, message: "Đặt kho mặc định thành công" });
};
