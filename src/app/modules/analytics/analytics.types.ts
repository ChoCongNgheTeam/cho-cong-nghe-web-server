// ─── Time Range ───────────────────────────────────────────────────────────────

export type TimeGranularity = "day" | "week" | "month";

export interface TimeRangeQuery {
  from: Date;
  to: Date;
  granularity?: TimeGranularity;
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface DashboardSummary {
  revenue: {
    total: number;
    change: number; // % so sánh kỳ trước
  };
  orders: {
    total: number;
    change: number;
    pendingChatbot: number; // Đơn chatbot chờ staff confirm
  };
  customers: {
    total: number;
    newThisPeriod: number;
    change: number;
  };
  products: {
    totalActive: number;
    lowStock: number; // quantity <= 5
    outOfStock: number; // quantity = 0
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
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: Date;
  isChatbotRequest: boolean;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productSlug: string;
  variantCode: string | null;
  totalSold: number;
  totalRevenue: number;
  imageUrl: string | null;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  orderStatusBreakdown: OrderStatusBreakdown[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  chatbotPendingOrders: RecentOrder[];
}

// ─── Revenue Analytics ────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  period: string; // "2024-01-15" | "2024-W03" | "2024-01"
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
  requested: number; // REQUEST_PENDING (chatbot)
  pending: number; // PENDING
  processing: number; // PROCESSING
  shipped: number; // SHIPPED
  delivered: number; // DELIVERED
  cancelled: number; // CANCELLED
}

export interface AnalyticsResponse {
  revenueOverTime: RevenueDataPoint[];
  revenueByPaymentMethod: RevenueByPaymentMethod[];
  revenueByCategory: RevenueByCategory[];
  topCustomers: TopCustomer[];
  conversionFunnel: ConversionFunnel;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalDelivered: number;
    averageOrderValue: number;
    cancellationRate: number;
    deliveryRate: number;
  };
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface DashboardQuery {
  period?: "today" | "week" | "month" | "year";
}

export interface AnalyticsQuery {
  from: Date;
  to: Date;
  granularity?: TimeGranularity;
}
