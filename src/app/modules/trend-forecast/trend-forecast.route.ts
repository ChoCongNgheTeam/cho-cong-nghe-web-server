import { Router } from "express";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { generateForecastSchema } from "./trend-forecast.validation";
import { getForecastsHandler, generateForecastHandler } from "./trend-forecast.controller";

const router = Router();

// Lấy danh sách dự báo (dành cho admin có quyền xem analytics hoặc tương tự)
router.get("/", authMiddleware(), requirePermission("canAnalytics"), getForecastsHandler);

// Tạo dự báo mới (trigger bằng tay)
router.post(
  "/generate",
  authMiddleware(),
  requirePermission("canAnalytics"),
  validate(generateForecastSchema, "body"),
  generateForecastHandler
);

export default router;
