import * as repo from "./analytics.repository";
import { DashboardQuery, AnalyticsQuery, DashboardResponse, AnalyticsResponse, OrderStatusBreakdown, RecentOrder } from "./analytics.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Chuyển đổi period string → { from, to } Date
 */
const resolvePeriodRange = (period: DashboardQuery["period"] = "month"): { from: Date; to: Date } => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      break; // from = today 00:00, to = today 23:59
    case "week":
      from.setDate(from.getDate() - 6); // 7 ngày gần nhất
      break;
    case "month":
      from.setDate(1); // đầu tháng hiện tại
      break;
    case "year":
      from.setMonth(0, 1); // 01/01 năm hiện tại
      break;
  }

  return { from, to };
};

/**
 * Tính % thay đổi giữa 2 kỳ
 */
const calcChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

/**
 * Map raw orders thành RecentOrder response
 */
const mapToRecentOrder = (order: Awaited<ReturnType<typeof repo.getRecentOrders>>[number]): RecentOrder => ({
  id: order.id,
  orderCode: order.orderCode,
  customerName: order.user?.fullName ?? "Khách vãng lai",
  customerEmail: order.user?.email ?? "",
  totalAmount: Number(order.totalAmount),
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  orderDate: order.orderDate,
  isChatbotRequest: order.isChatbotRequest,
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (query: DashboardQuery): Promise<DashboardResponse> => {
  const { from, to } = resolvePeriodRange(query.period);
  const { from: prevFrom, to: prevTo } = repo.getPreviousPeriodRange(from, to);

  // Chạy song song tất cả queries
  const [
    currentRevenue,
    previousRevenue,
    currentOrders,
    previousOrders,
    currentNewCustomers,
    previousNewCustomers,
    totalCustomers,
    pendingChatbotCount,
    stockSummary,
    statusBreakdown,
    recentOrdersRaw,
    chatbotOrdersRaw,
    topProducts,
  ] = await Promise.all([
    repo.getTotalRevenue(from, to),
    repo.getTotalRevenue(prevFrom, prevTo),
    repo.getTotalOrders(from, to),
    repo.getTotalOrders(prevFrom, prevTo),
    repo.getNewCustomers(from, to),
    repo.getNewCustomers(prevFrom, prevTo),
    repo.getTotalCustomers(),
    repo.getPendingChatbotOrders(),
    repo.getProductStockSummary(),
    repo.getOrderStatusBreakdown(from, to),
    repo.getRecentOrders(10),
    repo.getChatbotPendingOrders(10),
    repo.getTopProducts(from, to, 5),
  ]);

  const totalOrdersInPeriod = statusBreakdown.reduce((acc, s) => acc + s.count, 0);

  const orderStatusBreakdown: OrderStatusBreakdown[] = statusBreakdown.map((s) => ({
    status: s.status,
    count: s.count,
    percentage: totalOrdersInPeriod > 0 ? Number(((s.count / totalOrdersInPeriod) * 100).toFixed(1)) : 0,
  }));

  return {
    summary: {
      revenue: {
        total: currentRevenue,
        change: calcChange(currentRevenue, previousRevenue),
      },
      orders: {
        total: currentOrders,
        change: calcChange(currentOrders, previousOrders),
        pendingChatbot: pendingChatbotCount,
      },
      customers: {
        total: totalCustomers,
        newThisPeriod: currentNewCustomers,
        change: calcChange(currentNewCustomers, previousNewCustomers),
      },
      products: {
        totalActive: stockSummary.totalActive,
        lowStock: stockSummary.lowStock,
        outOfStock: stockSummary.outOfStock,
      },
    },
    orderStatusBreakdown,
    recentOrders: recentOrdersRaw.map(mapToRecentOrder),
    chatbotPendingOrders: chatbotOrdersRaw.map(mapToRecentOrder),
    topProducts,
  };
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalytics = async (query: AnalyticsQuery): Promise<AnalyticsResponse> => {
  const { from, to, granularity = "day" } = query;

  const [revenueOverTime, revenueByPaymentMethod, revenueByCategory, topCustomers, conversionFunnel, summary] = await Promise.all([
    repo.getRevenueOverTime(from, to, granularity),
    repo.getRevenueByPaymentMethod(from, to),
    repo.getRevenueByCategory(from, to),
    repo.getTopCustomers(from, to, 10),
    repo.getConversionFunnel(from, to),
    repo.getAnalyticsSummary(from, to),
  ]);

  return {
    revenueOverTime,
    revenueByPaymentMethod,
    revenueByCategory,
    topCustomers,
    conversionFunnel,
    summary,
  };
};
