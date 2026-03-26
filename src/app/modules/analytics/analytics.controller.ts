import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";
import { DashboardQuery, AnalyticsQuery } from "./analytics.types";

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /admin/analytics/dashboard?period=today|week|month|year
 *
 * Tổng quan hệ thống:
 * - Summary cards với sparkline 7 điểm + % thay đổi so kỳ trước
 * - Breakdown trạng thái đơn hàng
 * - 10 đơn hàng mới nhất (kèm thông tin khách + sản phẩm)
 * - Đơn chatbot đang chờ xác nhận (kèm thông tin khách + sản phẩm)
 * - Top 5 sản phẩm bán chạy + dự báo ngày hết hàng
 */
export const getDashboardHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as DashboardQuery;
  const data = await analyticsService.getDashboard(query);
  res.json({ data, message: "Lấy dữ liệu dashboard thành công" });
};

// ─── Revenue Analytics ────────────────────────────────────────────────────────

/**
 * GET /admin/analytics/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=hour|day|week|month
 *
 * Phân tích doanh thu:
 * - revenueOverTime: doanh thu theo granularity (auto-detect nếu không truyền)
 * - comparisonOverTime: cùng granularity nhưng cho kỳ trước (dùng vẽ đường so sánh)
 * - forecast: dự báo 7 ngày tới (linear regression, chỉ khi granularity=day)
 * - heatmap: số đơn theo giờ x ngày trong tuần
 * - summary: kèm revenueChange + ordersChange % so kỳ trước
 */
export const getAnalyticsHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as AnalyticsQuery;
  const data = await analyticsService.getAnalytics(query);
  res.json({ data, message: "Lấy dữ liệu thống kê doanh thu thành công" });
};
