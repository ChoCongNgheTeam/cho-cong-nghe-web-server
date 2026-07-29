import { Request, Response } from "express";
import * as spinService from "./spin.service";

// ── Admin ──────────────────────────────────────────────────────────────────

export const getPrizesAdminHandler = async (_req: Request, res: Response) => {
  const prizes = await spinService.getPrizesAdmin();
  res.json({ data: prizes, message: "Lấy danh sách phần thưởng thành công" });
};

export const getPrizeDetailHandler = async (req: Request, res: Response) => {
  const prize = await spinService.getPrizeDetail(req.params.id);
  res.json({ data: prize, message: "Lấy chi tiết phần thưởng thành công" });
};

export const createPrizeHandler = async (req: Request, res: Response) => {
  const prize = await spinService.createPrize(req.body);
  res.status(201).json({ data: prize, message: "Tạo phần thưởng thành công" });
};

export const updatePrizeHandler = async (req: Request, res: Response) => {
  const prize = await spinService.updatePrize(req.params.id, req.body);
  res.json({ data: prize, message: "Cập nhật phần thưởng thành công" });
};

export const deletePrizeHandler = async (req: Request, res: Response) => {
  await spinService.deletePrize(req.params.id);
  res.json({ message: "Xoá phần thưởng thành công" });
};

export const getSpinStatsHandler = async (_req: Request, res: Response) => {
  const stats = await spinService.getSpinStats();
  res.json({ data: stats, message: "Lấy thống kê vòng quay thành công" });
};

export const resetSpinDataHandler = async (_req: Request, res: Response) => {
  await spinService.resetAllSpinData();
  res.json({ message: "Đã xoá toàn bộ lịch sử quay và reset ngân sách phần thưởng" });
};

// ── Public (yêu cầu đăng nhập) ───────────────────────────────────────────────

export const getSpinAvailableHandler = async (_req: Request, res: Response) => {
  const available = await spinService.isSpinAvailable();
  res.json({ data: { available }, message: "OK" });
};

export const getSpinStatusHandler = async (req: Request, res: Response) => {
  const status = await spinService.getSpinStatus(req.user!.id);
  res.json({ data: status, message: "Lấy trạng thái vòng quay thành công" });
};

export const spinHandler = async (req: Request, res: Response) => {
  const result = await spinService.spin(req.user!.id);
  res.json({ data: result, message: "Quay thưởng thành công" });
};
