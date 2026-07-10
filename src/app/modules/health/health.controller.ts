import { Request, Response } from "express";
import * as service from "./health.service";

// GET /health — dùng cho cron ping giữ web không sleep, luôn trả nhanh, không check DB
export const healthCheckHandler = (_req: Request, res: Response) => {
  res.status(200).json(service.getBasicHealth());
};

// GET /health/detailed — có check DB, dùng cho monitoring/dashboard, không nên gọi tần suất cao
export const healthCheckDetailedHandler = async (_req: Request, res: Response) => {
  const health = await service.getDetailedHealth();
  const httpStatus = health.status === "ok" ? 200 : 503;
  res.status(httpStatus).json(health);
};
