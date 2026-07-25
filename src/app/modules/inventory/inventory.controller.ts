import { Request, Response } from "express";
import * as inventoryService from "./inventory.service";
import {
  listInventoryQuerySchema,
  listMovementsQuerySchema,
  listAlertsQuerySchema,
  updateLowStockThresholdSchema,
  initializeStockSchema,
} from "./inventory.validation";

export const getInventoryOverviewHandler = async (req: Request, res: Response) => {
  const query = listInventoryQuerySchema.parse(req.query);
  const result = await inventoryService.getInventoryOverview(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy tổng quan tồn kho thành công",
  });
};

export const getVariantInventoryDetailHandler = async (req: Request, res: Response) => {
  const variant = await inventoryService.getVariantInventoryDetail(req.params.variantId);
  res.json({ data: variant, message: "Lấy chi tiết tồn kho biến thể thành công" });
};

export const updateLowStockThresholdHandler = async (req: Request, res: Response) => {
  const input = updateLowStockThresholdSchema.parse(req.body);
  const result = await inventoryService.updateLowStockThreshold(req.params.variantId, input);
  res.json({ data: result, message: "Cập nhật ngưỡng cảnh báo tồn kho thành công" });
};

export const stockInHandler = async (req: Request, res: Response) => {
  const result = await inventoryService.stockIn(req.body, req.user!.id);
  res.status(201).json({ data: result, message: "Nhập kho thành công" });
};

export const stockOutHandler = async (req: Request, res: Response) => {
  const result = await inventoryService.stockOut(req.body, req.user!.id);
  res.status(201).json({ data: result, message: "Xuất kho thành công" });
};

export const getMovementHistoryHandler = async (req: Request, res: Response) => {
  const query = listMovementsQuerySchema.parse(req.query);
  const result = await inventoryService.getMovementHistory(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy lịch sử nhập/xuất kho thành công",
  });
};

export const getLowStockAlertsHandler = async (req: Request, res: Response) => {
  const query = listAlertsQuerySchema.parse(req.query);
  const result = await inventoryService.getLowStockAlerts(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      outOfStockCount: result.outOfStockCount,
      lowStockCount: result.lowStockCount,
    },
    message: "Lấy danh sách cảnh báo tồn kho thành công",
  });
};

export const initializeWarehouseStockHandler = async (req: Request, res: Response) => {
  const input = initializeStockSchema.parse(req.body);
  const result = await inventoryService.initializeWarehouseStock(input.warehouseId, req.user!.id);
  res.json({ data: result, message: `Đã khởi tạo tồn kho ban đầu cho ${result.initializedCount} biến thể sản phẩm` });
};
