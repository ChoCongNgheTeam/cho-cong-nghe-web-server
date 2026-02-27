import prisma from "@/config/db";
import { Prisma } from "@prisma/client";

const orderSelect = {
  id: true,
  orderCode: true, 
  userId: true,
  paymentMethodId: true,
  voucherId: true,
  shippingAddressId: true,
  subtotalAmount: true,
  shippingFee: true,
  voucherDiscount: true,
  totalAmount: true,
  orderStatus: true,
  paymentStatus: true,
  orderDate: true,
  updatedAt: true,

  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  },
  paymentMethod: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  voucher: {
    select: {
      id: true,
      code: true,
      description: true,
    },
  },
  shippingAddress: {
    select: {
      id: true,
      contactName: true,
      phone: true,
      detailAddress: true,
      provinceId: true,
      wardId: true,
      province: { select: { fullName: true } },
      ward: { select: { fullName: true } }
    },
  },
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
              img: { take: 1, select: { imageUrl: true, color: true } }
            },
          },
          variantAttributes: {
            select: {
              attributeOption: {
                select: {
                  value: true,
                  attribute: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ordersSelect;

export const findAllOrders = async () => {
  return prisma.orders.findMany({
    select: orderSelect,
    orderBy: { orderDate: "desc" },
  });
};

export const findOrdersByUserId = async (userId: string) => {
  return prisma.orders.findMany({
    where: { userId },
    select: orderSelect,
    orderBy: { orderDate: "desc" },
  });
};

export const findOrderById = async (id: string) => {
  return prisma.orders.findUnique({
    where: { id },
    select: orderSelect,
  });
};

export const updateOrder = async (id: string, data: Prisma.ordersUpdateInput) => {
  return prisma.orders.update({
    where: { id },
    data,
    select: orderSelect,
  });
};