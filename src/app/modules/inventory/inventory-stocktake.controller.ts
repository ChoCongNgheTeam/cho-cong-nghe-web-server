import { Request, Response } from "express";
import * as stocktakeService from "./inventory-stocktake.service";
import { listStocktakesQuerySchema } from "./inventory.validation";

export const getStocktakesAdminHandler = async (req: Request, res: Response) => {
  const query = listStocktakesQuerySchema.parse(req.query);
  const result = await stocktakeService.getStocktakesAdmin(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách phiếu kiểm kê thành công",
  });
};

export const getStocktakeDetailHandler = async (req: Request, res: Response) => {
  const stocktake = await stocktakeService.getStocktakeDetail(req.params.id);
  res.json({ data: stocktake, message: "Lấy chi tiết phiếu kiểm kê thành công" });
};

export const createStocktakeHandler = async (req: Request, res: Response) => {
  const stocktake = await stocktakeService.createStocktake(req.body, req.user!.id);
  res.status(201).json({ data: stocktake, message: "Tạo phiếu kiểm kê thành công" });
};

export const updateStocktakeItemsHandler = async (req: Request, res: Response) => {
  const stocktake = await stocktakeService.updateStocktakeItems(req.params.id, req.body);
  res.json({ data: stocktake, message: "Cập nhật số lượng kiểm kê thành công" });
};

export const completeStocktakeHandler = async (req: Request, res: Response) => {
  const stocktake = await stocktakeService.completeStocktake(req.params.id, req.user!.id);
  res.json({ data: stocktake, message: "Hoàn tất kiểm kê thành công" });
};

export const cancelStocktakeHandler = async (req: Request, res: Response) => {
  const stocktake = await stocktakeService.cancelStocktake(req.params.id);
  res.json({ data: stocktake, message: "Hủy phiếu kiểm kê thành công" });
};
