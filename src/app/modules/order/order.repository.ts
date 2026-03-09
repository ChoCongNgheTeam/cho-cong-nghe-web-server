import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { OrderQuery } from "./order.validation";

export const orderSelect = {
  id: true, orderCode: true, userId: true, paymentMethodId: true, voucherId: true,
  shippingAddressId: true, shippingContactName: true, shippingPhone: true,
  shippingProvince: true, shippingWard: true, shippingDetail: true,
  subtotalAmount: true, shippingFee: true, voucherDiscount: true, totalAmount: true,
  orderStatus: true, paymentStatus: true, orderDate: true, updatedAt: true,
  deletedAt: true, deletedBy: true,
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  paymentMethod: { select: { id: true, name: true, description: true } },
  voucher: { select: { id: true, code: true, description: true } },
  orderItems: {
    select: {
      id: true, quantity: true, unitPrice: true,
      productVariant: {
        select: {
          id: true, code: true, price: true,
          product: { select: { id: true, name: true, slug: true, img: { take: 1, select: { imageUrl: true, color: true } } } },
          variantAttributes: { select: { attributeOption: { select: { value: true, attribute: { select: { name: true } } } } } },
        },
      },
    },
  },
} satisfies Prisma.ordersSelect;

export const findAllOrders = async (query: OrderQuery) => {
  const { page = 1, limit = 20, search, status, paymentStatus, includeDeleted } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.ordersWhereInput = {};

  if (!includeDeleted) where.deletedAt = null; // Ẩn đơn đã lưu trữ
  if (status) where.orderStatus = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  
  if (search) {
    where.OR = [
      { orderCode: { contains: search, mode: "insensitive" } },
      { shippingPhone: { contains: search } },
      { shippingContactName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.orders.findMany({ where, skip, take: limit, select: orderSelect, orderBy: { orderDate: "desc" } }),
    prisma.orders.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllArchivedOrders = async (query: OrderQuery) => {
  const { page = 1, limit = 20, search } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.ordersWhereInput = { deletedAt: { not: null } };

  if (search) {
    where.OR = [
      { orderCode: { contains: search, mode: "insensitive" } },
      { shippingPhone: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.orders.findMany({ where, skip, take: limit, select: orderSelect, orderBy: { deletedAt: "desc" } }),
    prisma.orders.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findOrdersByUserId = async (userId: string) => {
  return prisma.orders.findMany({
    where: { userId, deletedAt: null }, // User không thấy đơn đã bị Admin archive
    select: orderSelect,
    orderBy: { orderDate: "desc" },
  });
};

export const findOrderById = async (id: string, includeDeleted = false) => {
  return prisma.orders.findUnique({
    where: { id, ...(!includeDeleted ? { deletedAt: null } : {}) },
    select: orderSelect,
  });
};

export const updateOrder = async (id: string, data: any) => {
  return prisma.orders.update({ where: { id }, data, select: orderSelect });
};

// --- Archive & Delete ---
export const archiveOrder = async (id: string, adminId: string) => {
  return prisma.orders.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: adminId },
  });
};

export const unarchiveOrder = async (id: string) => {
  return prisma.orders.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
  });
};

export const hardDeleteOrderFromDb = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.order_items.deleteMany({ where: { orderId: id } });
    return tx.orders.delete({ where: { id } });
  });
};