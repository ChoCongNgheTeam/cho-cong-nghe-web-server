import { findAllOrders, findOrdersByUserId, findOrderById, updateOrder } from "./order.repository";
import { UpdateOrderAdminInput } from "./order.validation";
import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";

export const getMyOrders = async (userId: string) => {
  return findOrdersByUserId(userId);
};

export const getOrderDetail = async (orderId: string, userId?: string) => {
  const order = await findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");

  if (userId && order.userId !== userId) {
    throw new BadRequestError("Bạn không có quyền xem đơn hàng này");
  }

  return order;
};

export const getAllOrdersAdmin = async () => {
  return findAllOrders();
};

export const updateOrderAdmin = async (orderId: string, input: UpdateOrderAdminInput) => {
  const order = await findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");

  return updateOrder(orderId, input);
};

export const deleteOrderAdmin = async (orderId: string) => {
  const order = await findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");

  // Dùng transaction để vừa hoàn stock vừa xóa order
  await prisma.$transaction(async (tx) => {
    // 1. Hoàn lại stock
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: {
          quantity: { increment: item.quantity },
        },
      });
    }

    // 2. Xóa order_items
    await tx.order_items.deleteMany({
      where: { orderId },
    });

    // 3. Xóa đơn hàng
    await tx.orders.delete({
      where: { id: orderId },
    });
  });
};