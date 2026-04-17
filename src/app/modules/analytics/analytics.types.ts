// ─── Time Range ───────────────────────────────────────────────────────────────

export type TimeGranularity = "hour" | "day" | "week" | "month";

export interface TimeRangeQuery {
  from: Date;
  to: Date;
  granularity?: TimeGranularity;
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface MetricWithTrend {
  total: number;
  change: number; // % so sánh kỳ trước
  sparkline: number[]; // 7 điểm gần nhất để vẽ mini chart
}

export interface DashboardSummary {
  revenue: MetricWithTrend;
  orders: MetricWithTrend & { pendingChatbot: number };
  customers: MetricWithTrend & { newThisPeriod: number };
  products: {
    totalActive: number;
    lowStock: number;
    outOfStock: number;
  };
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: Date;
  isChatbotRequest: boolean;
  items: OrderItemSummary[];
}

export interface OrderItemSummary {
  productName: string;
  variantCode: string | null;
  quantity: number;
  unitPrice: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productSlug: string;
  variantCode: string | null;
  totalSold: number;
  totalRevenue: number;
  imageUrl: string | null;
  currentStock: number; // tồn kho hiện tại
  daysUntilStockout: number | null; // dự báo hết hàng (null = không xác định)
}

export interface DashboardResponse {
  summary: DashboardSummary;
  orderStatusBreakdown: OrderStatusBreakdown[];
  recentOrders: RecentOrder[];
  chatbotPendingOrders: RecentOrder[];
  topProducts: TopProduct[];
}

// ─── Revenue Analytics ────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface RevenueByPaymentMethod {
  method: string;
  methodCode: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface RevenueByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  unitsSold: number;
  percentage: number;
}

export interface TopCustomer {
  userId: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
}

export interface ConversionFunnel {
  // requested: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ─── Comparison (kỳ trước) ────────────────────────────────────────────────────

export interface ComparisonDataPoint {
  period: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

/** Mỗi ô trong heatmap: day 0–6 (Sun–Sat), hour 0–23 */
export interface HeatmapCell {
  day: number; // 0 = CN, 1 = T2, ..., 6 = T7
  hour: number; // 0–23
  count: number; // số đơn
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export interface ForecastPoint {
  period: string; // "YYYY-MM-DD"
  revenue: number; // dự báo
  isForcast: true;
}

// ─── Full Analytics Response ──────────────────────────────────────────────────

export interface AnalyticsSummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalDelivered: number;
  averageOrderValue: number;
  cancellationRate: number;
  deliveryRate: number;
  revenueChange: number; // % so với kỳ trước
  ordersChange: number; // % so với kỳ trước
}

export interface AnalyticsResponse {
  revenueOverTime: RevenueDataPoint[];
  comparisonOverTime: ComparisonDataPoint[]; // kỳ trước — cùng độ dài
  forecast: ForecastPoint[]; // 7 ngày tới (linear regression)
  revenueByPaymentMethod: RevenueByPaymentMethod[];
  revenueByCategory: RevenueByCategory[];
  topCustomers: TopCustomer[];
  conversionFunnel: ConversionFunnel;
  heatmap: HeatmapCell[];
  summary: AnalyticsSummaryData;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface DashboardQuery {
  period?: "today" | "week" | "month" | "year";
}

export interface AnalyticsQuery {
  period?: "today" | "week" | "month" | "year";
  from?: string;
  to?: string;
  granularity?: TimeGranularity;
}
