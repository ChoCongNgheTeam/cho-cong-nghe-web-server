import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ShipmentQuery, EligibleOrdersQuery } from "./shipping.validation";

export const shipmentSelect = {
  id: true,
  orderId: true,
  providerId: true,
  providerOrderCode: true,
  status: true,
  shippingFee: true,
  expectedDeliveryAt: true,
  shippedAt: true,
  deliveredAt: true,
  failedReason: true,
  createdAt: true,
  updatedAt: true,
  provider: { select: { id: true, code: true, name: true } },
  order: {
    select: {
      id: true,
      orderCode: true,
      shippingContactName: true,
      shippingPhone: true,
      shippingProvince: true,
      shippingWard: true,
      shippingDetail: true,
      orderStatus: true,
      totalAmount: true,
      paymentStatus: true,
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          productVariant: { select: { code: true, product: { select: { name: true } } } },
        },
      },
    },
  },
} satisfies Prisma.shipmentsSelect;

export const findShippingProviderByCode = (code: string) => prisma.shipping_providers.findUnique({ where: { code } });

export const findAllShippingProviders = () => prisma.shipping_providers.findMany({ orderBy: { name: "asc" } });

export const upsertShippingProvider = (code: string, data: { name: string; isActive: boolean; config: Record<string, any> }) =>
  prisma.shipping_providers.upsert({
    where: { code },
    create: { code, ...data },
    update: data,
  });

export const findShipmentById = (id: string) => prisma.shipments.findUnique({ where: { id }, select: shipmentSelect });

export const findShipmentByOrderId = (orderId: string) => prisma.shipments.findFirst({ where: { orderId }, select: shipmentSelect });

export const findShipmentByIds = (ids: string[]) => prisma.shipments.findMany({ where: { id: { in: ids } }, select: shipmentSelect });

export const findShipmentByProviderOrderCode = (providerId: string, providerOrderCode: string) => prisma.shipments.findFirst({ where: { providerId, providerOrderCode } });

export const createShipmentRecord = (data: { orderId: string; providerId: string; providerOrderCode: string; shippingFee?: number; expectedDeliveryAt?: Date; rawPayload: any }) =>
  prisma.shipments.create({
    data: {
      orderId: data.orderId,
      providerId: data.providerId,
      providerOrderCode: data.providerOrderCode,
      shippingFee: data.shippingFee,
      expectedDeliveryAt: data.expectedDeliveryAt,
      rawPayload: data.rawPayload,
      status: "CREATED",
    },
    select: shipmentSelect,
  });

export const updateShipmentStatus = (id: string, data: { status: Prisma.shipmentsUpdateInput["status"]; rawPayload?: any; shippedAt?: Date; deliveredAt?: Date; failedReason?: string }) =>
  prisma.shipments.update({ where: { id }, data, select: shipmentSelect });

const ALL_SHIPMENT_STATUSES = ["PENDING", "CREATED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED", "CANCELLED"] as const;

export const findAllShipmentsAdmin = async (query: ShipmentQuery) => {
  const { page = 1, limit = 20, status, providerCode, search, sortBy = "createdAt", sortOrder = "desc" } = query;
  const skip = (page - 1) * limit;

  // Bộ lọc KHÔNG gồm status — dùng riêng để đếm statusCounts cho từng tab, để đổi
  // tab không làm số đếm ở các tab khác thay đổi theo (giữ đúng ý nghĩa "có bao
  // nhiêu đơn ở trạng thái X" trong phạm vi search/provider đang lọc).
  const baseWhere: Prisma.shipmentsWhereInput = {
    ...(providerCode && { provider: { code: providerCode } }),
    ...(search && {
      OR: [{ providerOrderCode: { contains: search, mode: "insensitive" as const } }, { order: { orderCode: { contains: search, mode: "insensitive" as const } } }],
    }),
  };

  const where: Prisma.shipmentsWhereInput = { ...baseWhere, ...(status && { status }) };

  const [data, total, groupedCounts] = await Promise.all([
    prisma.shipments.findMany({ where, skip, take: limit, select: shipmentSelect, orderBy: { [sortBy]: sortOrder } }),
    prisma.shipments.count({ where }),
    prisma.shipments.groupBy({ by: ["status"], where: baseWhere, _count: { _all: true } }),
  ]);

  const statusCounts: Record<string, number> = { ALL: 0 };
  for (const s of ALL_SHIPMENT_STATUSES) statusCounts[s] = 0;
  for (const row of groupedCounts) {
    statusCounts[row.status] = row._count._all;
    statusCounts.ALL += row._count._all;
  }

  return { data, page, limit, total, totalPages: Math.ceil(total / limit), statusCounts };
};

/** Đơn hàng đủ điều kiện tạo vận đơn: chưa có shipment nào và ở trạng thái PROCESSING trở lên. */
export const findOrdersEligibleForShipment = (orderIds: string[]) =>
  prisma.orders.findMany({
    where: {
      id: { in: orderIds },
      shipments: { none: {} },
    },
    select: {
      id: true,
      orderCode: true,
      shippingContactName: true,
      shippingPhone: true,
      shippingDetail: true,
      shippingWard: true,
      shippingProvince: true,
      totalAmount: true,
      paymentStatus: true,
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          productVariant: { select: { code: true, product: { select: { name: true } } } },
        },
      },
    },
  });

/**
 * Danh sách đơn hàng CHƯA có vận đơn (có phân trang) — dùng cho picker chọn
 * đơn khi tạo vận đơn hàng loạt ở trang Vận đơn. Khác với
 * findOrdersEligibleForShipment ở trên (nhận sẵn orderIds, dùng nội bộ lúc
 * TẠO thật) — hàm này phục vụ việc HIỂN THỊ danh sách để admin chọn.
 */
export const findEligibleOrdersPaginated = async (query: EligibleOrdersQuery) => {
  const { page = 1, limit = 20, search, orderStatus } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ordersWhereInput = {
    shipments: { none: {} },
    orderStatus: orderStatus ? orderStatus : { not: "CANCELLED" },
    ...(search && {
      OR: [
        { orderCode: { contains: search, mode: "insensitive" as const } },
        { shippingContactName: { contains: search, mode: "insensitive" as const } },
        { shippingPhone: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const select = {
    id: true,
    orderCode: true,
    shippingContactName: true,
    shippingPhone: true,
    shippingProvince: true,
    shippingWard: true,
    totalAmount: true,
    paymentStatus: true,
    orderStatus: true,
    orderDate: true,
    _count: { select: { orderItems: true } },
  } satisfies Prisma.ordersSelect;

  const [data, total] = await Promise.all([prisma.orders.findMany({ where, skip, take: limit, select, orderBy: { orderDate: "desc" } }), prisma.orders.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};
