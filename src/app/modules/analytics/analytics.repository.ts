import prisma from "@/config/db";
import { TimeGranularity } from "./analytics.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Trả về { from, to } của kỳ trước tương ứng để so sánh % thay đổi
 */
export const getPreviousPeriodRange = (from: Date, to: Date) => {
  const diff = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - diff - 1),
    to: new Date(from.getTime() - 1),
  };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

/** Tổng doanh thu (chỉ tính đơn DELIVERED hoặc đã thanh toán) */
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

/** Tổng số đơn hàng trong khoảng thời gian */
export const getTotalOrders = async (from: Date, to: Date): Promise<number> => {
  return prisma.orders.count({
    where: {
      orderDate: { gte: from, lte: to },
      orderStatus: { not: "REQUEST_PENDING" },
    },
  });
};

/** Số đơn chatbot đang chờ staff xác nhận */
export const getPendingChatbotOrders = async (): Promise<number> => {
  return prisma.orders.count({
    where: {
      isChatbotRequest: true,
      orderStatus: "REQUEST_PENDING",
    },
  });
};

/** Tổng số customer đang active */
export const getTotalCustomers = async (): Promise<number> => {
  return prisma.users.count({
    where: { role: "CUSTOMER", isActive: true, deletedAt: null },
  });
};

/** Số customer mới đăng ký trong khoảng thời gian */
export const getNewCustomers = async (from: Date, to: Date): Promise<number> => {
  return prisma.users.count({
    where: {
      role: "CUSTOMER",
      createdAt: { gte: from, lte: to },
      deletedAt: null,
    },
  });
};

/** Sản phẩm active, sắp hết hàng, hết hàng */
export const getProductStockSummary = async () => {
  const [totalActive, lowStock, outOfStock] = await prisma.$transaction([
    prisma.products_variants.count({
      where: { isActive: true, deletedAt: null },
    }),
    prisma.products_variants.count({
      where: { isActive: true, deletedAt: null, quantity: { gt: 0, lte: 5 } },
    }),
    prisma.products_variants.count({
      where: { isActive: true, deletedAt: null, quantity: 0 },
    }),
  ]);
  return { totalActive, lowStock, outOfStock };
};

/** Breakdown số lượng đơn theo từng status */
export const getOrderStatusBreakdown = async (from: Date, to: Date) => {
  const result = await prisma.orders.groupBy({
    by: ["orderStatus"],
    where: { orderDate: { gte: from, lte: to } },
    _count: { _all: true },
    orderBy: { _count: { orderStatus: "desc" } },
  });
  return result.map((r) => ({
    status: r.orderStatus,
    count: r._count._all,
  }));
};

/** 10 đơn hàng mới nhất */
export const getRecentOrders = async (limit = 10) => {
  return prisma.orders.findMany({
    where: { orderStatus: { not: "REQUEST_PENDING" } },
    orderBy: { orderDate: "desc" },
    take: limit,
    select: {
      id: true,
      orderCode: true,
      totalAmount: true,
      orderStatus: true,
      paymentStatus: true,
      orderDate: true,
      isChatbotRequest: true,
      user: {
        select: { fullName: true, email: true },
      },
    },
  });
};

/** Đơn chatbot đang chờ confirm (REQUEST_PENDING) */
export const getChatbotPendingOrders = async (limit = 10) => {
  return prisma.orders.findMany({
    where: {
      isChatbotRequest: true,
      orderStatus: "REQUEST_PENDING",
    },
    orderBy: { orderDate: "asc" }, // FIFO — cũ nhất lên trước
    take: limit,
    select: {
      id: true,
      orderCode: true,
      totalAmount: true,
      orderStatus: true,
      paymentStatus: true,
      orderDate: true,
      isChatbotRequest: true,
      user: {
        select: { fullName: true, email: true },
      },
    },
  });
};

/**
 * Top sản phẩm bán chạy theo số lượng
 *
 * Dùng raw query vì cần tính totalRevenue = quantity * unitPrice
 * theo từng variant, Prisma groupBy chưa hỗ trợ computed expression này.
 *
 * Tên cột dùng camelCase trong dấu nháy kép vì Prisma map camelCase → PostgreSQL.
 */
export const getTopProducts = async (from: Date, to: Date, limit = 5) => {
  const rows = await prisma.$queryRaw<
    Array<{
      product_id: string;
      product_name: string;
      product_slug: string;
      variant_code: string | null;
      total_sold: bigint;
      total_revenue: number;
      image_url: string | null;
    }>
  >`
    SELECT
      p.id                                              AS product_id,
      p.name                                            AS product_name,
      p.slug                                            AS product_slug,
      pv.code                                           AS variant_code,
      SUM(oi.quantity)::BIGINT                          AS total_sold,
      SUM(oi.quantity * oi."unitPrice")::FLOAT          AS total_revenue,
      (
        SELECT pci."imageUrl"
        FROM product_color_images pci
        WHERE pci."productId" = p.id
        ORDER BY pci.position ASC
        LIMIT 1
      )                                                 AS image_url
    FROM order_items oi
    JOIN products_variants pv ON pv.id = oi."productVariantId"
    JOIN products p            ON p.id = pv."productId"
    JOIN orders o              ON o.id = oi."orderId"
    WHERE
      o."orderDate" BETWEEN ${from} AND ${to}
      AND o."orderStatus" != 'CANCELLED'
    GROUP BY p.id, p.name, p.slug, pv.id, pv.code
    ORDER BY total_sold DESC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    productId: r.product_id,
    productName: r.product_name,
    productSlug: r.product_slug,
    variantCode: r.variant_code,
    totalSold: Number(r.total_sold),
    totalRevenue: Number(r.total_revenue),
    imageUrl: r.image_url,
  }));
};

// ─── Analytics ────────────────────────────────────────────────────────────────

/**
 * Doanh thu theo thời gian (group by granularity)
 *
 * Phải dùng raw query vì Prisma chưa hỗ trợ DATE_TRUNC natively.
 * Truyền granularity qua interpolation an toàn (đã validate bởi Zod ở tầng trên).
 */
export const getRevenueOverTime = async (from: Date, to: Date, granularity: TimeGranularity) => {
  // Dùng tagged template literal riêng cho từng case thay vì dynamic string
  // để tránh SQL injection và đảm bảo Prisma xử lý đúng tham số.
  type RawRow = { period: Date; revenue: number; order_count: bigint };

  let rows: RawRow[];

  if (granularity === "week") {
    rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        DATE_TRUNC('week', o."orderDate")  AS period,
        SUM(o."totalAmount")::FLOAT        AS revenue,
        COUNT(o.id)::BIGINT                AS order_count
      FROM orders o
      WHERE
        o."orderDate" BETWEEN ${from} AND ${to}
        AND o."orderStatus" != 'CANCELLED'
        AND o."paymentStatus" = 'PAID'
      GROUP BY period
      ORDER BY period ASC
    `;
  } else if (granularity === "month") {
    rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        DATE_TRUNC('month', o."orderDate") AS period,
        SUM(o."totalAmount")::FLOAT        AS revenue,
        COUNT(o.id)::BIGINT                AS order_count
      FROM orders o
      WHERE
        o."orderDate" BETWEEN ${from} AND ${to}
        AND o."orderStatus" != 'CANCELLED'
        AND o."paymentStatus" = 'PAID'
      GROUP BY period
      ORDER BY period ASC
    `;
  } else {
    // default: day
    rows = await prisma.$queryRaw<RawRow[]>`
      SELECT
        DATE_TRUNC('day', o."orderDate")   AS period,
        SUM(o."totalAmount")::FLOAT        AS revenue,
        COUNT(o.id)::BIGINT                AS order_count
      FROM orders o
      WHERE
        o."orderDate" BETWEEN ${from} AND ${to}
        AND o."orderStatus" != 'CANCELLED'
        AND o."paymentStatus" = 'PAID'
      GROUP BY period
      ORDER BY period ASC
    `;
  }

  return rows.map((r) => ({
    period: r.period.toISOString().split("T")[0],
    revenue: Number(r.revenue),
    orderCount: Number(r.order_count),
    averageOrderValue: Number(r.order_count) > 0 ? Number(r.revenue) / Number(r.order_count) : 0,
  }));
};

/** Doanh thu theo phương thức thanh toán */
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

/**
 * Doanh thu theo danh mục sản phẩm
 *
 * Phải dùng raw query vì cần JOIN nhiều bảng + SUM computed expression.
 * Tên cột camelCase trong dấu nháy kép.
 */
export const getRevenueByCategory = async (from: Date, to: Date) => {
  const rows = await prisma.$queryRaw<
    Array<{
      category_id: string;
      category_name: string;
      revenue: number;
      units_sold: bigint;
    }>
  >`
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

/** Top khách hàng chi tiêu nhiều nhất */
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

/** Conversion funnel — số lượng đơn ở từng bước trạng thái */
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

/** Tổng hợp analytics summary */
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
