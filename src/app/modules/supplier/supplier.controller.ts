import { Request, Response } from "express";
import * as supplierService from "./supplier.service";
import { listSuppliersQuerySchema } from "./supplier.validation";

export const getSuppliersAdminHandler = async (req: Request, res: Response) => {
  const query = listSuppliersQuerySchema.parse(req.query);
  const result = await supplierService.getSuppliersAdmin(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách nhà cung cấp thành công",
  });
};

export const getActiveSuppliersLiteHandler = async (_req: Request, res: Response) => {
  const suppliers = await supplierService.getActiveSuppliersLite();
  res.json({ data: suppliers, message: "Lấy danh sách nhà cung cấp đang hoạt động thành công" });
};

export const getSupplierDetailHandler = async (req: Request, res: Response) => {
  const supplier = await supplierService.getSupplierDetail(req.params.id);
  res.json({ data: supplier, message: "Lấy chi tiết nhà cung cấp thành công" });
};

export const createSupplierHandler = async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(req.body);
  res.status(201).json({ data: supplier, message: "Tạo nhà cung cấp thành công" });
};

export const updateSupplierHandler = async (req: Request, res: Response) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  res.json({ data: supplier, message: "Cập nhật nhà cung cấp thành công" });
};

export const deleteSupplierHandler = async (req: Request, res: Response) => {
  await supplierService.softDeleteSupplier(req.params.id, req.user!.id);
  res.json({ message: "Xóa nhà cung cấp thành công" });
};

export const restoreSupplierHandler = async (req: Request, res: Response) => {
  const supplier = await supplierService.restoreSupplier(req.params.id);
  res.json({ data: supplier, message: "Khôi phục nhà cung cấp thành công" });
};
