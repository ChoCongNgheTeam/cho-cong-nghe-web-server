import prisma from "@/config/db";
import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import { CheckoutSummary } from "./checkout.types";

export const findCartItemsWithProduct = async (userId: string) => {
  return prisma.cart_items.findMany({
    where: { userId },
    include: {
      productVariant: {
        include: { product: true },
      },
    },
  });
};

export const findAddressWithProvince = async (addressId: string) => {
  return prisma.user_addresses.findUnique({
    where: { id: addressId },
    include: { province: true },
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
    include: {
      voucherUsers: {
        where: { userId },
      },
    },
  });
};

export const findVoucherUsersCount = async (voucherId: string) => {
  return prisma.voucher_user.count({
    where: { voucherId },
  });
};

/**
 * Transaction: Khởi tạo đơn hàng, trừ tồn kho, xóa giỏ hàng, cập nhật voucher
 */
export const executeOrderTransaction = async (
  userId: string,
  checkoutSummary: CheckoutSummary,
  isFromCart: boolean = true
) => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const orderCode = `CCN-${datePart}-${randomPart}`;

  return prisma.$transaction(async (tx) => {
    // 0. LẤY THÔNG TIN ĐỊA CHỈ ĐỂ LÀM SNAPSHOT
    const address = await tx.user_addresses.findUnique({
      where: { id: checkoutSummary.shippingAddressId },
      include: { province: true, ward: true }
    });

    if (!address) {
      throw new Error("Không tìm thấy thông tin địa chỉ giao hàng");
    }

    // 1. Tạo order mới
    const newOrder = await tx.orders.create({
      data: {
        orderCode,
        userId,
        paymentMethodId: checkoutSummary.paymentMethodId,
        voucherId: checkoutSummary.voucherId,
        shippingAddressId: checkoutSummary.shippingAddressId,
        
        // 🔥 BỔ SUNG 5 TRƯỜNG ADDRESS SNAPSHOT NÀY
        shippingContactName: address.contactName,
        shippingPhone: address.phone,
        shippingProvince: address.province.fullName,
        shippingWard: address.ward.fullName,
        shippingDetail: address.detailAddress,

        subtotalAmount: new Prisma.Decimal(checkoutSummary.subtotalAmount),
        shippingFee: new Prisma.Decimal(checkoutSummary.shippingFee),
        voucherDiscount: new Prisma.Decimal(checkoutSummary.voucherDiscount),
        totalAmount: new Prisma.Decimal(checkoutSummary.totalAmount),
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        bankTransferCode: checkoutSummary.bankTransferCode,
        orderItems: {
          create: checkoutSummary.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });

    // 2. Trừ tồn kho & Tăng số lượng đã bán
    for (const item of checkoutSummary.items) {
      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: {
          quantity: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // 3. Xóa giỏ hàng (chỉ khi checkout từ giỏ hàng)
    if (isFromCart) {
      await tx.cart_items.deleteMany({
        where: { userId },
      });
    }

    // 4. Cập nhật voucher (nếu có)
    if (checkoutSummary.voucherId) {
      const voucherId = checkoutSummary.voucherId;
      await tx.vouchers.update({
        where: { id: voucherId },
        data: { usesCount: { increment: 1 } },
      });

      await tx.voucher_usages.create({
        data: { voucherId, userId, orderId: newOrder.id },
      });

      const userVoucher = await tx.voucher_user.findUnique({
        where: { voucherId_userId: { voucherId, userId } },
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

/**
 * Transaction: Hủy đơn hàng và hoàn trả lại tồn kho
 */
export const cancelOrderAndRestoreInventory = async (orderId: string) => {
  return prisma.$transaction(async (tx) => {
    const orderItems = await tx.order_items.findMany({ where: { orderId } });

    for (const item of orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: {
          quantity: { increment: item.quantity },
          soldCount: { decrement: item.quantity },
        },
      });
    }

    await tx.orders.update({
      where: { id: orderId },
      data: { orderStatus: "CANCELLED" },
    });
  });
};

/**
 * Transaction: Xác nhận đơn hàng (Chuyển sang PROCESSING)
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  return prisma.orders.update({
    where: { id: orderId },
    data: { orderStatus: status },
  });
};
