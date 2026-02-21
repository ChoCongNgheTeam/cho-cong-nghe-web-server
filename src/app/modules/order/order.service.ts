import { findAllOrders, findOrdersByUserId, findOrderById, createOrder, updateOrder, deleteOrder } from "./order.repository";
import { CreateOrderInput, UpdateOrderAdminInput } from "./order.validation";
import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";
import { Prisma } from "@prisma/client";

export const getMyOrders = async (userId: string) => {
  return findOrdersByUserId(userId);
};

export const getOrderDetail = async (orderId: string, userId?: string) => {
  const order = await findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");

  // Nếu là user → kiểm tra quyền sở hữu
  if (userId && order.userId !== userId) {
    throw new BadRequestError("Bạn không có quyền xem đơn hàng này");
  }

  return order;
};

export const createUserOrder = async (userId: string, input: CreateOrderInput) => {
  const { paymentMethodId, voucherId, shippingAddressId, orderItems } = input;

  // Validate address thuộc user
  const address = await prisma.user_addresses.findUnique({
    where: { id: shippingAddressId },
  });
  if (!address || address.userId !== userId) {
    throw new NotFoundError("Địa chỉ giao hàng");
  }

  // Validate payment method
  const paymentMethod = await prisma.payment_methods.findUnique({
    where: { id: paymentMethodId, isActive: true },
  });
  if (!paymentMethod) throw new NotFoundError("Phương thức thanh toán");

  // Validate voucher (nếu có)
  let voucherDiscount = 0;
  if (voucherId) {
    const voucher = await prisma.vouchers.findUnique({
      where: { id: voucherId, isActive: true },
    });
    if (!voucher) throw new NotFoundError("Voucher");

    // Kiểm tra điều kiện áp dụng (minOrderValue, endDate, maxUses,...)
    // Có thể mở rộng logic phức tạp hơn ở đây
    voucherDiscount = Number(voucher.discountValue);
  }

  // Validate + tính toán order items
  let subtotal = new Prisma.Decimal(0);
  const itemsToCreate: any[] = [];

  for (const item of orderItems) {
    const variant = await prisma.products_variants.findUnique({
      where: { id: item.productVariantId, isActive: true },
      include: { inventory: true },
    });

    if (!variant) throw new NotFoundError(`Sản phẩm variant ${item.productVariantId}`);
    if (!variant.inventory || variant.inventory.quantity < item.quantity) {
      throw new BadRequestError(`Sản phẩm không đủ hàng: ${variant.code || variant.id}`);
    }

    const unitPrice = variant.price; // Giá lấy từ variant

    subtotal = subtotal.plus(new Prisma.Decimal(unitPrice).mul(item.quantity));

    itemsToCreate.push({
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPrice,
    });
  }
  const voucherDiscountDecimal = new Prisma.Decimal(voucherDiscount);

  const shippingFee = new Prisma.Decimal(20000); // Phí vận chuyển cố định hoặc tính toán theo địa chỉ, trọng lượng,...
  const totalAmount = subtotal.plus(shippingFee).minus(voucherDiscountDecimal);

  return createOrder({
    userId,
    paymentMethodId,
    voucherId: voucherId || undefined,
    shippingAddressId,
    subtotalAmount: subtotal,
    shippingFee,
    voucherDiscount: voucherDiscountDecimal,
    totalAmount,
    orderItems: itemsToCreate,
  });
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

  // Hoàn lại stock khi xóa đơn (nếu cần)
  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.inventory.update({
        where: { variantId: item.productVariant.id },
        data: {
          quantity: { increment: item.quantity },
          reservedQuantity: { increment: item.quantity },
        },
      });
    }
    await deleteOrder(orderId);
  });
};
