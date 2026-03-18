import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { OrderQuery } from "./order.validation";

// 1. CẬP NHẬT QUERY: Thêm brand, code, label và sắp xếp ảnh y hệt Cart
export const orderSelect = {
  id: true,
  orderCode: true,
  userId: true,
  paymentMethodId: true,
  voucherId: true,
  shippingAddressId: true,
  shippingContactName: true,
  shippingPhone: true,
  shippingProvince: true,
  shippingWard: true,
  shippingDetail: true,
  subtotalAmount: true,
  shippingFee: true,
  voucherDiscount: true,
  totalAmount: true,
  orderStatus: true,
  paymentStatus: true,
  orderDate: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  paymentMethod: { select: { id: true, name: true, description: true } },
  voucher: { select: { id: true, code: true, description: true } },
  bankTransferCode: true,
  bankTransferQrUrl: true,
  bankTransferContent: true,
  bankTransferExpiredAt: true,
  paymentExpiredAt: true,
  paymentRedirectUrl: true,
  orderItems: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      productVariant: {
        select: {
          id: true,
          code: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              img: { select: { imageUrl: true, color: true } },
            },
          },
          variantAttributes: {
            select: {
              attributeOption: {
                select: { value: true, attribute: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ordersSelect;

export const formatOrderResponse = (order: any) => {
  if (!order) return order;

  return {
    ...order,
    orderItems: order.orderItems.map((item: any) => {
      const colorAttr = item.productVariant.variantAttributes.find((attr: any) => {
        const code = (attr.attributeOption.attribute?.code || "").toLowerCase();
        const name = (attr.attributeOption.attribute?.name || "").toLowerCase();
        return ["color", "màu", "màu sắc"].includes(code || name);
      });

      // Logic quét dung lượng y hệt Cart (nếu FE cần hiển thị)
      const storageAttr = item.productVariant.variantAttributes.find((attr: any) => {
        const code = (attr.attributeOption.attribute?.code || "").toLowerCase();
        const name = (attr.attributeOption.attribute?.name || "").toLowerCase();
        return ["storage", "dung lượng", "rom", "rom_capacity"].includes(code || name);
      });

      const colorValue = colorAttr?.attributeOption.value;

      let filteredImages = item.productVariant.product.img;
      if (colorValue) {
        filteredImages = item.productVariant.product.img.filter((img: any) => img.color === colorValue);
      }

      if (filteredImages.length === 0 && item.productVariant.product.img.length > 0) {
        filteredImages = [item.productVariant.product.img[0]];
      }

      const finalImageUrl = filteredImages.length > 0 ? filteredImages[0].imageUrl : null;

      return {
        ...item,
        productVariant: {
          ...item.productVariant,
          product: {
            ...item.productVariant.product,
            img: filteredImages,
          },
        },
        image: finalImageUrl,
      };
    }),
  };
};

export const findAllOrders = async (query: OrderQuery) => {
  const { page = 1, limit = 20, search, status, paymentStatus, dateFrom, dateTo } = query;

  const skip = (page - 1) * limit;

  // ── Base filters (dùng chung) ──
  const baseWhere: Prisma.ordersWhereInput = {
    ...(paymentStatus && { paymentStatus }),

    ...(search && {
      OR: [{ orderCode: { contains: search, mode: "insensitive" } }, { shippingPhone: { contains: search } }, { shippingContactName: { contains: search, mode: "insensitive" } }],
    }),

    ...((dateFrom || dateTo) && {
      orderDate: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  // ── Where chính (có filter status) ──
  const where: Prisma.ordersWhereInput = {
    ...baseWhere,
    ...(status && { orderStatus: status }),
  };

  const statusList = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

  // ── Queries ──
  const [orders, total, totalAll, ...statusCountsRaw] = await Promise.all([
    prisma.orders.findMany({
      where,
      skip,
      take: limit,
      select: orderSelect,
      orderBy: { orderDate: "desc" },
    }),

    // total theo filter hiện tại
    prisma.orders.count({ where }),

    // total ALL (không filter status)
    prisma.orders.count({ where: baseWhere }),

    // count từng status
    ...statusList.map((s) =>
      prisma.orders.count({
        where: { ...baseWhere, orderStatus: s },
      }),
    ),
  ]);

  // ── Map statusCounts ──
  const statusCounts = {
    ALL: totalAll,
    ...Object.fromEntries(statusList.map((s, i) => [s, statusCountsRaw[i]])),
  };

  return {
    data: orders.map(formatOrderResponse),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    statusCounts,
  };
};

export const findOrdersByUserId = async (userId: string) => {
  const orders = await prisma.orders.findMany({
    where: { userId },
    select: orderSelect,
    orderBy: { orderDate: "desc" },
  });
  return orders.map(formatOrderResponse);
};

export const findOrderById = async (id: string) => {
  const order = await prisma.orders.findUnique({ where: { id }, select: orderSelect });
  return formatOrderResponse(order);
};

export const findOrderPaymentInfoByCode = async (orderCode: string, userId: string) => {
  const order = await prisma.orders.findFirst({
    where: { orderCode, userId },
    select: orderSelect,
  });
  return formatOrderResponse(order);
};

export const updateOrder = async (id: string, data: any) => {
  const order = await prisma.orders.update({ where: { id }, data, select: orderSelect });
  return formatOrderResponse(order);
};
