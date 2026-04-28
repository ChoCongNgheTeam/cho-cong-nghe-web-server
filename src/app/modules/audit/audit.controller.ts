import { Request, Response } from "express";
import * as repo from "./audit.repository";
import { listAuditLogsSchema, listLoginHistorySchema } from "./audit.validation";

export const getAuditLogsHandler = async (req: Request, res: Response) => {
  const query = listAuditLogsSchema.parse(req.query);
  const result = await repo.findAuditLogs(query);
  res.json({ data: result.data, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, message: "Lấy audit log thành công" });
};

export const getLoginHistoryHandler = async (req: Request, res: Response) => {
  const query = listLoginHistorySchema.parse(req.query);
  const result = await repo.findLoginHistory(query);
  res.json({ data: result.data, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, message: "Lấy lịch sử đăng nhập thành công" });
};

export const getMyLoginHistoryHandler = async (req: Request, res: Response) => {
  const query = listLoginHistorySchema.parse(req.query);
  const result = await repo.findLoginHistory({ ...query, userId: req.user!.id });
  res.json({ data: result.data, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, message: "Lấy lịch sử đăng nhập thành công" });
};

export const getActiveSessionsHandler = async (req: Request, res: Response) => {
  const sessions = await repo.findActiveSessions(req.user!.id);
  res.json({ data: sessions, message: "Lấy danh sách phiên đăng nhập thành công" });
};

export const revokeSessionHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const result = await repo.revokeSession(req.params.tokenId, req.user!.id, isAdmin);
  if (!result) return res.status(403).json({ message: "Không có quyền thu hồi phiên này" });
  res.json({ message: "Thu hồi phiên đăng nhập thành công" });
};

export const revokeAllSessionsHandler = async (req: Request, res: Response) => {
  const currentTokenId = req.headers["x-token-id"] as string | undefined;
  await repo.revokeAllSessions(req.user!.id, currentTokenId);
  res.json({ message: "Đã đăng xuất tất cả thiết bị khác" });
};

export const getAnomaliesHandler = async (_req: Request, res: Response) => {
  const bruteForce = await repo.findBruteForceAttempts();
  res.json({
    data: { bruteForce },
    message: "Lấy dữ liệu bất thường thành công",
  });
};
