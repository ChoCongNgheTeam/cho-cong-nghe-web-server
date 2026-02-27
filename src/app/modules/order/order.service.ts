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

  if (userId && order.userId !== userId) {
    throw new BadRequestError("Bạn không có quyền xem đơn hàng này");
  }

  return order;
};

export const createUserOrder = async (userId: string, input: CreateOrderInput) => {
  const { paymentMethodId, voucherId, shippingAddressId, orderItems } = input;

  const address = await prisma.user_addresses.findUnique({
    where: { id: shippingAddressId },
  });
  if (!address || address.userId !== userId) {
    throw new NotFoundError("Địa chỉ giao hàng");
  }

  const paymentMethod = await prisma.payment_methods.findUnique({
    where: { id: paymentMethodId, isActive: true },
  });
  if (!paymentMethod) throw new NotFoundError("Phương thức thanh toán");

  let voucherDiscount = 0;
  if (voucherId) {
    const voucher = await prisma.vouchers.findUnique({
      where: { id: voucherId, isActive: true },
    });
    if (!voucher) throw new NotFoundError("Voucher");
    voucherDiscount = Number(voucher.discountValue);
  }

  let subtotal = new Prisma.Decimal(0);
  const itemsToCreate: any[] = [];

  for (const item of orderItems) {
    const variant = await prisma.products_variants.findUnique({
      where: { id: item.productVariantId, isActive: true },
      // include: { inventory: true }, // Mở ra nếu bạn dùng bảng inventory
    });

    if (!variant) throw new NotFoundError(`Sản phẩm variant ${item.productVariantId}`);
    
    // Nếu dùng bảng quantity trên variant trực tiếp thì check ở đây
    if (variant.quantity < item.quantity) {
      throw new BadRequestError(`Sản phẩm không đủ hàng: ${variant.code || variant.id}`);
    }

    const unitPrice = variant.price;

    subtotal = subtotal.plus(new Prisma.Decimal(unitPrice).mul(item.quantity));

    itemsToCreate.push({
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPrice,
    });
  }
  const voucherDiscountDecimal = new Prisma.Decimal(voucherDiscount);

  const shippingFee = new Prisma.Decimal(20000);
  const totalAmount = subtotal.plus(shippingFee).minus(voucherDiscountDecimal);

  // Tạo orderCode dạng: ORD + YYMMDD + 4 số ngẫu nhiên (VD: ORD2602278912)
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `ORD${datePart}${randomPart}`;

  return createOrder({
    orderCode, // Truyền orderCode vào DTO
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

  await prisma.$transaction(async (tx) => {
    // Hoàn lại stock (Cập nhật logic theo cấu trúc DB hiện tại của bạn)
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: {
          quantity: { increment: item.quantity },
        },
      });
    }
    await deleteOrder(orderId);
  });
};