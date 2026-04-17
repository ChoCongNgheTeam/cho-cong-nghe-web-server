import * as repo from "./analytics.repository";
import { RecentOrderRaw } from "./analytics.repository";
import { DashboardQuery, AnalyticsQuery, DashboardResponse, AnalyticsResponse, OrderStatusBreakdown, RecentOrder, OrderItemSummary, ForecastPoint, ComparisonDataPoint } from "./analytics.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolvePeriodRange = (period: DashboardQuery["period"] = "month"): { from: Date; to: Date } => {
  const now = new Date();

  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      break;

    case "week": {
      const day = from.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      from.setDate(from.getDate() + diff);
      break;
    }

    case "month":
      from.setDate(1);
      break;

    case "year":
      from.setMonth(0, 1);
      break;
  }

  return { from, to };
};

const calcChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

/** Map raw order từ repo → RecentOrder response */
const mapToRecentOrder = (order: RecentOrderRaw): RecentOrder => {
  // Địa chỉ lấy từ shipping snapshot lưu trực tiếp trên order
  const addressParts = [order.shippingDetail, order.shippingWard, order.shippingProvince].filter(Boolean);

  const items: OrderItemSummary[] = (order.orderItems ?? []).map((oi) => ({
    productName: oi.productVariant?.product?.name ?? "Không rõ",
    variantCode: oi.productVariant?.code ?? null,
    quantity: oi.quantity,
    unitPrice: Number(oi.unitPrice),
  }));

  return {
    id: order.id,
    orderCode: order.orderCode,
    customerName: order.user?.fullName ?? order.shippingContactName,
    customerEmail: order.user?.email ?? "",
    customerPhone: order.user?.phone ?? order.shippingPhone,
    customerAddress: addressParts.length > 0 ? addressParts.join(", ") : null,
    totalAmount: Number(order.totalAmount),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    orderDate: order.orderDate,
    isChatbotRequest: order.isChatbotRequest,
    items,
  };
};

// ─── Forecast (Linear Regression đơn giản) ────────────────────────────────────

/**
 * Dự báo 7 ngày tiếp theo dựa trên dữ liệu lịch sử
 * Dùng Ordinary Least Squares (OLS) linear regression trên dữ liệu revenue theo ngày
 */
const buildForecast = (history: { period: string; revenue: number }[], days = 7): ForecastPoint[] => {
  if (history.length < 3) return []; // Không đủ data để dự báo

  const n = history.length;
  const xs = history.map((_, i) => i);
  const ys = history.map((d) => d.revenue);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastDate = new Date(history[history.length - 1].period);

  return Array.from({ length: days }, (_, i) => {
    const x = n + i;
    const revenue = Math.max(0, Math.round(slope * x + intercept));
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);
    return {
      period: date.toISOString().split("T")[0],
      revenue,
      isForcast: true as const,
    };
  });
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (query: DashboardQuery): Promise<DashboardResponse> => {
  const { from, to } = resolvePeriodRange(query.period);
  const { from: prevFrom, to: prevTo } = repo.getPreviousPeriodRange(from, to);

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
    revenueSparkline,
    orderSparkline,
    customerSparkline,
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
    repo.getSparkline(from, to, 7),
    repo.getOrderCountSparkline(from, to, 7),
    repo.getNewCustomerSparkline(from, to, 7),
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
        sparkline: revenueSparkline,
      },
      orders: {
        total: currentOrders,
        change: calcChange(currentOrders, previousOrders),
        pendingChatbot: pendingChatbotCount,
        sparkline: orderSparkline,
      },
      customers: {
        total: totalCustomers,
        newThisPeriod: currentNewCustomers,
        change: calcChange(currentNewCustomers, previousNewCustomers),
        sparkline: customerSparkline,
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
  let from: Date;
  let to: Date;

  const { granularity = "day" } = query;

  if (query.period) {
    ({ from, to } = resolvePeriodRange(query.period));
  } else {
    from = new Date(query.from!);
    to = new Date(query.to!);
  }

  const { from: prevFrom, to: prevTo } = repo.getPreviousPeriodRange(from, to);

  const [revenueOverTime, comparisonRaw, revenueByPaymentMethod, revenueByCategory, topCustomers, conversionFunnel, currentSummary, previousSummary, heatmap] = await Promise.all([
    repo.getRevenueOverTime(from, to, granularity),
    repo.getRevenueOverTime(prevFrom, prevTo, granularity),
    repo.getRevenueByPaymentMethod(from, to),
    repo.getRevenueByCategory(from, to, 10),
    repo.getTopCustomers(from, to, 10),
    repo.getConversionFunnel(from, to),
    repo.getAnalyticsSummary(from, to),
    repo.getAnalyticsSummary(prevFrom, prevTo),
    repo.getOrderHeatmap(from, to),
  ]);

  const forecast: ForecastPoint[] = granularity === "day" ? buildForecast(revenueOverTime, 7) : [];

  // Normalize comparison — đảm bảo cùng số điểm với revenueOverTime
  const comparisonOverTime: ComparisonDataPoint[] = comparisonRaw.map((d) => ({
    period: d.period,
    revenue: d.revenue,
    orderCount: d.orderCount,
    averageOrderValue: d.averageOrderValue,
  }));

  return {
    revenueOverTime,
    comparisonOverTime,
    forecast,
    revenueByPaymentMethod,
    revenueByCategory,
    topCustomers,
    conversionFunnel,
    heatmap,
    summary: {
      ...currentSummary,
      revenueChange: calcChange(currentSummary.totalRevenue, previousSummary.totalRevenue),
      ordersChange: calcChange(currentSummary.totalOrders, previousSummary.totalOrders),
    },
  };
};
