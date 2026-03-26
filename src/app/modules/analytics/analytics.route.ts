import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validate } from "@/app/middlewares/validate.middleware";
import { dashboardQuerySchema, analyticsQuerySchema } from "./analytics.validation";
import { getDashboardHandler, getAnalyticsHandler } from "./analytics.controller";

const router = Router();

// Tất cả routes trong module này yêu cầu ADMIN hoặc STAFF
const adminStaffAuth = [authMiddleware(), requireRole("ADMIN", "STAFF")] as const;

/**
 * GET /admin/analytics/dashboard?period=today|week|month|year
 *
 * Tổng quan hệ thống — dùng cho tab "Dashboard"
 */
router.get("/dashboard", ...adminStaffAuth, validate(dashboardQuerySchema, "query"), asyncHandler(getDashboardHandler));

/**
 * GET /admin/analytics/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|week|month
 *
 * Phân tích doanh thu chi tiết — dùng cho tab "Thống kê doanh thu"
 */
router.get("/revenue", ...adminStaffAuth, validate(analyticsQuerySchema, "query"), asyncHandler(getAnalyticsHandler));

export default router;
