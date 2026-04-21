import prisma from "@/config/db";
import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import { CheckoutSummary } from "./checkout.types";

export const findCartItemsWithProduct = async (userId: string) => {
  return prisma.cart_items.findMany({
    where: { userId },
    include: { productVariant: { include: { product: true } } },
  });
};

export const findAddressWithProvince = async (addressId: string) => {
  return prisma.user_addresses.findUnique({
    where: { id: addressId },
  });
};

export const findAddressById = async (addressId: string) => {
  return prisma.user_addresses.findUnique({
    where: { id: addressId },
  });
};

export const findPaymentMethodById = async (id: string) => {
  return prisma.payment_methods.findUnique({
    where: { id, isActive: true },
  });
};

export const findVoucherWithUser = async (voucherId: string, userId: string) => {
  return prisma.vouchers.findUnique({
    where: { id: voucherId },
    include: { voucherUsers: { where: { userId } } },
  });
};

export const findVoucherUsersCount = async (voucherId: string) => {
  return prisma.voucher_user.count({ where: { voucherId } });
};

/**
 * Transaction: Khởi tạo đơn hàng, trừ tồn kho, xóa giỏ hàng, cập nhật voucher.
 */
export const executeOrderTransaction = async (userId: string, checkoutSummary: CheckoutSummary, isFromCart: boolean = true) => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const orderCode = checkoutSummary.orderCode ?? `CCN-${datePart}-${randomPart}`;

  const {
    bankTransferQrUrl = null,
    bankTransferContent = null,
    bankTransferExpiredAt = null,
    paymentExpiredAt = null,
    paymentRedirectUrl = null,
    momoOrderId = null,
    vnpayTxnRef = null,
    zaloPayTransId = null,
    stripePaymentIntentId = null,
  } = checkoutSummary.paymentFields ?? {};

  return prisma.$transaction(async (tx) => {
    // 0. Snapshot Address
    const address = await tx.user_addresses.findUnique({
      where: { id: checkoutSummary.shippingAddressId },
    });

    if (!address) throw new Error("Không tìm thấy thông tin địa chỉ giao hàng");

    // 1. Tạo order mới
    const newOrder = await tx.orders.create({
      data: {
        orderCode,
        userId,
        paymentMethodId: checkoutSummary.paymentMethodId,
        voucherId: checkoutSummary.voucherId,
        shippingAddressId: checkoutSummary.shippingAddressId,
        shippingContactName: address.contactName,
        shippingPhone: address.phone,
        shippingProvince: address.provinceName,
        shippingWard: address.wardName,
        shippingDetail: address.detailAddress,
        subtotalAmount: new Prisma.Decimal(checkoutSummary.subtotalAmount),
        shippingFee: new Prisma.Decimal(checkoutSummary.shippingFee),
        voucherDiscount: new Prisma.Decimal(checkoutSummary.voucherDiscount),
        totalAmount: new Prisma.Decimal(checkoutSummary.totalAmount),
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        bankTransferCode: checkoutSummary.bankTransferCode,
        bankTransferQrUrl,
        bankTransferContent,
        bankTransferExpiredAt,
        paymentExpiredAt,
        paymentRedirectUrl,
        momoOrderId,
        vnpayTxnRef,
        zaloPayTransId,
        stripePaymentIntentId,
        orderItems: {
          create: checkoutSummary.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: {
        orderItems: { include: { productVariant: { include: { product: true } } } },
      },
    });

    // 2. Trừ tồn kho Variant và cập nhật lượt bán Product
    await Promise.all(
      checkoutSummary.items.map((item) =>
        tx.products_variants.update({
          where: { id: item.productVariantId },
          data: { quantity: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
        }),
      ),
    );

    const productSoldMap = new Map<string, number>();
    for (const item of newOrder.orderItems) {
      const productId = item.productVariant.productId;
      productSoldMap.set(productId, (productSoldMap.get(productId) || 0) + item.quantity);
    }

    await Promise.all(
      Array.from(productSoldMap.entries()).map(([productId, quantity]) =>
        tx.products.update({
          where: { id: productId },
          data: { totalSoldCount: { increment: quantity } },
        }),
      ),
    );

    // 3. Xóa các sản phẩm được chọn khỏi giỏ hàng
    if (isFromCart) {
      if (checkoutSummary.cartItemIds && checkoutSummary.cartItemIds.length > 0) {
        await tx.cart_items.deleteMany({
          where: { userId, id: { in: checkoutSummary.cartItemIds } },
        });
      } else {
        await tx.cart_items.deleteMany({ where: { userId } });
      }
    }

    // 4. Cập nhật lượt dùng voucher
    if (checkoutSummary.voucherId) {
      const vId = checkoutSummary.voucherId;
      await tx.vouchers.update({
        where: { id: vId },
        data: { usesCount: { increment: 1 } },
      });
      await tx.voucher_usages.create({
        data: { voucherId: vId, userId, orderId: newOrder.id },
      });
      const userVoucher = await tx.voucher_user.findUnique({
        where: { voucherId_userId: { voucherId: vId, userId } },
      });
      if (userVoucher) {
        await tx.voucher_user.update({
          where: { id: userVoucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    return newOrder;
  });
};

// Hủy đơn hàng và hoàn trả tồn kho (dùng khi hủy sau khi đã tạo đơn)
export const cancelOrderAndRestoreInventory = async (orderId: string) => {
  return prisma.$transaction(async (tx) => {
    const orderItems = await tx.order_items.findMany({ where: { orderId } });
    for (const item of orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: { quantity: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
      });
    }
    await tx.orders.update({ where: { id: orderId }, data: { orderStatus: "CANCELLED" } });
  });
};

// Cập nhật trạng thái đơn hàng (dùng cho cả hủy và các trạng thái khác)
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  return prisma.orders.update({ where: { id: orderId }, data: { orderStatus: status } });
};

export const updateOrderPaymentFields = async (orderId: string, data: Record<string, any>) => {
  return prisma.orders.update({ where: { id: orderId }, data });
};