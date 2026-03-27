import prisma from "@/config/db";
import { TimeGranularity, HeatmapCell, OrderItemSummary } from "./analytics.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getPreviousPeriodRange = (from: Date, to: Date) => {
  const diff = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - diff - 1),
    to: new Date(from.getTime() - 1),
  };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getTotalRevenue = async (from: Date, to: Date): Promise<number> => {
  const result = await prisma.orders.aggregate({
    where: {
      orderDate: { gte: from, lte: to },
      orderStatus: { in: ["DELIVERED", "PROCESSING", "SHIPPED"] },
      paymentStatus: "PAID",
    },
    _sum: { totalAmount: true },
  });
  return Number(result._sum.totalAmount ?? 0);
};

export const getTotalOrders = async (from: Date, to: Date): Promise<number> => {
  return prisma.orders.count({
    where: {
      orderDate: { gte: from, lte: to },
      orderStatus: { not: "REQUEST_PENDING" },
    },
  });
};

export const getPendingChatbotOrders = async (): Promise<number> => {
  return prisma.orders.count({
    where: { isChatbotRequest: true, orderStatus: "REQUEST_PENDING" },
  });
};

export const getTotalCustomers = async (): Promise<number> => {
  return prisma.users.count({
    where: { role: "CUSTOMER", isActive: true, deletedAt: null },
  });
};

export const getNewCustomers = async (from: Date, to: Date): Promise<number> => {
  return prisma.users.count({
    where: { role: "CUSTOMER", createdAt: { gte: from, lte: to }, deletedAt: null },
  });
};

export const getProductStockSummary = async () => {
  const [totalActive, lowStock, outOfStock] = await prisma.$transaction([
    prisma.products_variants.count({ where: { isActive: true, deletedAt: null } }),
    prisma.products_variants.count({ where: { isActive: true, deletedAt: null, quantity: { gt: 0, lte: 5 } } }),
    prisma.products_variants.count({ where: { isActive: true, deletedAt: null, quantity: 0 } }),
  ]);
  return { totalActive, lowStock, outOfStock };
};

export const getOrderStatusBreakdown = async (from: Date, to: Date) => {
  const result = await prisma.orders.groupBy({
    by: ["orderStatus"],
    where: { orderDate: { gte: from, lte: to } },
    _count: { _all: true },
    orderBy: { _count: { orderStatus: "desc" } },
  });
  return result.map((r) => ({ status: r.orderStatus, count: r._count._all }));
};

/**
 * Sparkline: doanh thu 7 ngày (hoặc 7 điểm) gần nhất để vẽ mini trend chart
 */
export const getSparkline = async (from: Date, to: Date, points = 7): Promise<number[]> => {
  const rows = await prisma.$queryRaw<Array<{ revenue: number }>>`
    SELECT
      SUM(o."totalAmount")::FLOAT AS revenue
    FROM orders o
    WHERE
      o."orderDate" BETWEEN ${from} AND ${to}
      AND o."orderStatus" != 'CANCELLED'
      AND o."paymentStatus" = 'PAID'
    GROUP BY DATE_TRUNC('day', o."orderDate")
    ORDER BY DATE_TRUNC('day', o."orderDate") ASC
    LIMIT ${points}
  `;
  return rows.map((r) => Number(r.revenue));
};

/**
 * Sparkline tổng quát cho bất kỳ metric nào dựa trên count
 */
export const getOrderCountSparkline = async (from: Date, to: Date, points = 7): Promise<number[]> => {
  const rows = await prisma.$queryRaw<Array<{ cnt: bigint }>>`
    SELECT COUNT(o.id)::BIGINT AS cnt
    FROM orders o
    WHERE
      o."orderDate" BETWEEN ${from} AND ${to}
      AND o."orderStatus" != 'REQUEST_PENDING'
    GROUP BY DATE_TRUNC('day', o."orderDate")
    ORDER BY DATE_TRUNC('day', o."orderDate") ASC
    LIMIT ${points}
  `;
  return rows.map((r) => Number(r.cnt));
};

export const getNewCustomerSparkline = async (from: Date, to: Date, points = 7): Promise<number[]> => {
  const rows = await prisma.$queryRaw<Array<{ cnt: bigint }>>`
    SELECT COUNT(u.id)::BIGINT AS cnt
    FROM users u
    WHERE
      u."createdAt" BETWEEN ${from} AND ${to}
      AND u.role = 'CUSTOMER'
      AND u."deletedAt" IS NULL
    GROUP BY DATE_TRUNC('day', u."createdAt")
    ORDER BY DATE_TRUNC('day', u."createdAt") ASC
    LIMIT ${points}
  `;
  return rows.map((r) => Number(r.cnt));
};

// ─── Shared select shape cho orders (recent + chatbot pending) ───────────────

const ORDER_SELECT = {
  id: true,
  orderCode: true,
  totalAmount: true,
  orderStatus: true,
  paymentStatus: true,
  orderDate: true,
  isChatbotRequest: true,
  // Shipping snapshot lưu thẳng trên order — không cần JOIN address
  shippingContactName: true,
  shippingPhone: true,
  shippingProvince: true,
  shippingWard: true,
  shippingDetail: true,
  user: {
    select: {
      fullName: true,
      email: true,
      phone: true,
    },
  },
  orderItems: {
    take: 3,
    select: {
      quantity: true,
      unitPrice: true,
      productVariant: {
        select: {
          code: true,
          product: {
            select: { name: true },
          },
        },
      },
    },
  },
} as const;

/**
 * Recent orders: kèm thông tin khách hàng + sản phẩm đã mua
 * Địa chỉ lấy từ shipping snapshot (shippingProvince, shippingWard, shippingDetail)
 * vì user_addresses có thể đã bị soft delete sau khi đặt hàng
 */
export const getRecentOrders = async (limit = 10) => {
  return prisma.orders.findMany({
    where: { orderStatus: { not: "REQUEST_PENDING" } },
    orderBy: { orderDate: "desc" },
    take: limit,
    select: ORDER_SELECT,
  });
};

export const getChatbotPendingOrders = async (limit = 10) => {
  return prisma.orders.findMany({
    where: { isChatbotRequest: true, orderStatus: "REQUEST_PENDING" },
    orderBy: { orderDate: "asc" },
    take: limit,
    select: ORDER_SELECT,
  });
};

/**
 * Top sản phẩm bán chạy + tồn kho để tính dự báo hết hàng
 */
export const getTopProducts = async (from: Date, to: Date, limit = 5) => {
  const rows = await prisma.$queryRaw<
    Array<{
      product_id: string;
      product_name: string;
      product_slug: string;
      variant_id: string;
      variant_code: string | null;
      total_sold: bigint;
      total_revenue: number;
      image_url: string | null;
      current_stock: number;
    }>
  >`
    SELECT
      p.id                                              AS product_id,
      p.name                                            AS product_name,
      p.slug                                            AS product_slug,
      pv.id                                             AS variant_id,
      pv.code                                           AS variant_code,
      SUM(oi.quantity)::BIGINT                          AS total_sold,
      SUM(oi.quantity * oi."unitPrice")::FLOAT          AS total_revenue,
      (
        SELECT pci."imageUrl"
        FROM product_color_images pci
        WHERE pci."productId" = p.id
        ORDER BY pci.position ASC
        LIMIT 1
      )                                                 AS image_url,
      pv.quantity                                       AS current_stock
    FROM order_items oi
    JOIN products_variants pv ON pv.id = oi."productVariantId"
    JOIN products p            ON p.id = pv."productId"
    JOIN orders o              ON o.id = oi."orderId"
    WHERE
      o."orderDate" BETWEEN ${from} AND ${to}
      AND o."orderStatus" != 'CANCELLED'
    GROUP BY p.id, p.name, p.slug, pv.id, pv.code, pv.quantity
    ORDER BY total_sold DESC
    LIMIT ${limit}
  `;

  const periodDays = Math.max((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24), 1);

  return rows.map((r) => {
    const totalSold = Number(r.total_sold);
    const dailyRate = totalSold / periodDays; // tốc độ bán trung bình / ngày
    const daysUntilStockout = dailyRate > 0 ? Math.floor(r.current_stock / dailyRate) : null;

    return {
      productId: r.product_id,
      productName: r.product_name,
      productSlug: r.product_slug,
      variantCode: r.variant_code,
      totalSold,
      totalRevenue: Number(r.total_revenue),
      imageUrl: r.image_url,
      currentStock: r.current_stock,
      daysUntilStockout,
    };
  });
};

// ─── Analytics ────────────────────────────────────────────────────────────────

/**
 * Doanh thu theo thời gian — hỗ trợ thêm granularity "hour"
 */
export const getRevenueOverTime = async (from: Date, to: Date, granularity: TimeGranularity) => {
  type RawRow = { period: Date; revenue: number; order_count: bigint };

  const truncMap: Record<TimeGranularity, string> = {
    hour: "hour",
    day: "day",
    week: "week",
    month: "month",
  };
  const trunc = truncMap[granularity];

  // Dùng dynamic string an toàn vì giá trị đã được Zod enum validate
  const rows = await prisma.$queryRawUnsafe<RawRow[]>(
    `
    SELECT
      DATE_TRUNC('${trunc}', o."orderDate") AS period,
      SUM(o."totalAmount")::FLOAT           AS revenue,
      COUNT(o.id)::BIGINT                   AS order_count
    FROM orders o
    WHERE
      o."orderDate" BETWEEN $1 AND $2
      AND o."orderStatus" != 'CANCELLED'
      AND o."paymentStatus" = 'PAID'
    GROUP BY period
    ORDER BY period ASC
    `,
    from,
    to,
  );

  return rows.map((r) => ({
    period:
      granularity === "hour"
        ? r.period.toISOString() // giữ full ISO để FE format giờ
        : r.period.toISOString().split("T")[0],
    revenue: Number(r.revenue),
    orderCount: Number(r.order_count),
    averageOrderValue: Number(r.order_count) > 0 ? Number(r.revenue) / Number(r.order_count) : 0,
  }));
};

export const getRevenueByPaymentMethod = async (from: Date, to: Date) => {
  const rows = await prisma.orders.groupBy({
    by: ["paymentMethodId"],
    where: {
      orderDate: { gte: from, lte: to },
      paymentStatus: "PAID",
      orderStatus: { not: "CANCELLED" },
    },
    _sum: { totalAmount: true },
    _count: { _all: true },
  });

  const methods = await prisma.payment_methods.findMany({
    where: { id: { in: rows.map((r) => r.paymentMethodId) } },
    select: { id: true, name: true, code: true },
  });

  const methodMap = Object.fromEntries(methods.map((m) => [m.id, m]));
  const totalRevenue = rows.reduce((acc, r) => acc + Number(r._sum.totalAmount ?? 0), 0);

  return rows.map((r) => ({
    method: methodMap[r.paymentMethodId]?.name ?? "Không rõ",
    methodCode: methodMap[r.paymentMethodId]?.code ?? "",
    revenue: Number(r._sum.totalAmount ?? 0),
    orderCount: r._count._all,
    percentage: totalRevenue > 0 ? (Number(r._sum.totalAmount ?? 0) / totalRevenue) * 100 : 0,
  }));
};

export const getRevenueByCategory = async (from: Date, to: Date) => {
  const rows = await prisma.$queryRaw<Array<{ category_id: string; category_name: string; revenue: number; units_sold: bigint }>>`
    SELECT
      c.id                                              AS category_id,
      c.name                                            AS category_name,
      SUM(oi.quantity * oi."unitPrice")::FLOAT          AS revenue,
      SUM(oi.quantity)::BIGINT                          AS units_sold
    FROM order_items oi
    JOIN products_variants pv ON pv.id = oi."productVariantId"
    JOIN products p            ON p.id = pv."productId"
    JOIN categories c          ON c.id = p."categoryId"
    JOIN orders o              ON o.id = oi."orderId"
    WHERE
      o."orderDate" BETWEEN ${from} AND ${to}
      AND o."orderStatus" != 'CANCELLED'
      AND o."paymentStatus" = 'PAID'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `;

  const totalRevenue = rows.reduce((acc, r) => acc + Number(r.revenue), 0);
  return rows.map((r) => ({
    categoryId: r.category_id,
    categoryName: r.category_name,
    revenue: Number(r.revenue),
    unitsSold: Number(r.units_sold),
    percentage: totalRevenue > 0 ? (Number(r.revenue) / totalRevenue) * 100 : 0,
  }));
};

export const getTopCustomers = async (from: Date, to: Date, limit = 10) => {
  const rows = await prisma.orders.groupBy({
    by: ["userId"],
    where: {
      orderDate: { gte: from, lte: to },
      paymentStatus: "PAID",
      orderStatus: { not: "CANCELLED" },
    },
    _sum: { totalAmount: true },
    _count: { _all: true },
    _max: { orderDate: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });

  const users = await prisma.users.findMany({
    where: { id: { in: rows.map((r) => r.userId) } },
    select: { id: true, fullName: true, email: true, phone: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  return rows.map((r) => ({
    userId: r.userId,
    fullName: userMap[r.userId]?.fullName ?? null,
    email: userMap[r.userId]?.email ?? "",
    phone: userMap[r.userId]?.phone ?? null,
    totalOrders: r._count._all,
    totalSpent: Number(r._sum.totalAmount ?? 0),
    lastOrderDate: r._max.orderDate!,
  }));
};

export const getConversionFunnel = async (from: Date, to: Date) => {
  const result = await prisma.orders.groupBy({
    by: ["orderStatus"],
    where: { orderDate: { gte: from, lte: to } },
    _count: { _all: true },
  });
  const map = Object.fromEntries(result.map((r) => [r.orderStatus, r._count._all]));
  return {
    requested: map["REQUEST_PENDING"] ?? 0,
    pending: map["PENDING"] ?? 0,
    processing: map["PROCESSING"] ?? 0,
    shipped: map["SHIPPED"] ?? 0,
    delivered: map["DELIVERED"] ?? 0,
    cancelled: map["CANCELLED"] ?? 0,
  };
};

export const getAnalyticsSummary = async (from: Date, to: Date) => {
  const [revenueResult, totalOrders, deliveredOrders, cancelledOrders] = await prisma.$transaction([
    prisma.orders.aggregate({
      where: {
        orderDate: { gte: from, lte: to },
        paymentStatus: "PAID",
        orderStatus: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.orders.count({
      where: { orderDate: { gte: from, lte: to }, orderStatus: { not: "REQUEST_PENDING" } },
    }),
    prisma.orders.count({
      where: { orderDate: { gte: from, lte: to }, orderStatus: "DELIVERED" },
    }),
    prisma.orders.count({
      where: { orderDate: { gte: from, lte: to }, orderStatus: "CANCELLED" },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);
  const paidOrders = revenueResult._count._all;

  return {
    totalRevenue,
    totalOrders,
    totalDelivered: deliveredOrders,
    averageOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0,
    cancellationRate: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
    deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
  };
};

/**
 * Heatmap: đơn hàng theo giờ x ngày trong tuần
 * Trả về mảng { day: 0–6, hour: 0–23, count }
 */
export const getOrderHeatmap = async (from: Date, to: Date): Promise<HeatmapCell[]> => {
  const rows = await prisma.$queryRaw<Array<{ dow: number; hour: number; cnt: bigint }>>`
    SELECT
      EXTRACT(DOW FROM o."orderDate")::INT   AS dow,
      EXTRACT(HOUR FROM o."orderDate")::INT  AS hour,
      COUNT(o.id)::BIGINT                    AS cnt
    FROM orders o
    WHERE
      o."orderDate" BETWEEN ${from} AND ${to}
      AND o."orderStatus" != 'REQUEST_PENDING'
    GROUP BY dow, hour
    ORDER BY dow, hour
  `;

  return rows.map((r) => ({
    day: r.dow,
    hour: r.hour,
    count: Number(r.cnt),
  }));
};
