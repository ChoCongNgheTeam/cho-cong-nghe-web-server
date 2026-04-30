import { Router } from "express";
import { authMiddleware, requirePermission } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validate } from "@/app/middlewares/validate.middleware";
import { dashboardQuerySchema, analyticsQuerySchema } from "./analytics.validation";
import { getDashboardHandler, getAnalyticsHandler } from "./analytics.controller";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;

/**
 * GET /admin/analytics/dashboard?period=today|week|month|year
 * canAnalytics: MARKETING, ACCOUNTING
 */
router.get("/dashboard", ...staffAdminAuth, requirePermission("canAnalytics"), validate(dashboardQuerySchema, "query"), asyncHandler(getDashboardHandler));

/**
 * GET /admin/analytics/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day|week|month
 * canAnalytics: MARKETING, ACCOUNTING
 */
router.get("/revenue", ...staffAdminAuth, requirePermission("canAnalytics"), validate(analyticsQuerySchema, "query"), asyncHandler(getAnalyticsHandler));

export default router;
