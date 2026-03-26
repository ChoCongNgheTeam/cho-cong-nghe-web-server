import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";
import { DashboardQuery, AnalyticsQuery } from "./analytics.types";

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /admin/analytics/dashboard?period=month
 *
 * Trả về tổng quan hệ thống:
 * - Summary cards (doanh thu, đơn hàng, khách hàng, sản phẩm)
 * - Breakdown trạng thái đơn hàng
 * - 10 đơn hàng mới nhất
 * - Đơn chatbot đang chờ xác nhận
 * - Top 5 sản phẩm bán chạy trong kỳ
 */
export const getDashboardHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as DashboardQuery;

  const data = await analyticsService.getDashboard(query);

  res.json({
    data,
    message: "Lấy dữ liệu dashboard thành công",
  });
};

// ─── Revenue Analytics ────────────────────────────────────────────────────────

/**
 * GET /admin/analytics/revenue?from=2024-01-01&to=2024-12-31&granularity=month
 *
 * Trả về dữ liệu phân tích doanh thu:
 * - Doanh thu theo thời gian (line chart)
 * - Doanh thu theo phương thức thanh toán (pie chart)
 * - Doanh thu theo danh mục (bar chart)
 * - Top 10 khách hàng chi tiêu nhiều nhất
 * - Conversion funnel (đơn theo từng status)
 * - Summary tổng hợp
 */
export const getAnalyticsHandler = async (req: Request, res: Response) => {
  // Validation đã được xử lý ở middleware (validate schema), req.query đã được transform
  const query = req.query as unknown as AnalyticsQuery;

  const data = await analyticsService.getAnalytics(query);

  res.json({
    data,
    message: "Lấy dữ liệu thống kê doanh thu thành công",
  });
};
