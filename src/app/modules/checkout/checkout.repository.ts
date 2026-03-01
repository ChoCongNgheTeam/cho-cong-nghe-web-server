import prisma from "@/config/db";
import { Prisma, OrderStatus } from "@prisma/client";
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
export const executeOrderTransaction = async (userId: string, checkoutSummary: CheckoutSummary) => {
  const { items, subtotalAmount, shippingFee, voucherDiscount, totalAmount, paymentMethodId, shippingAddressId, voucherId, bankTransferCode } = checkoutSummary;

  // --- LOGIC TẠO MÃ ĐƠN HÀNG MỚI THEO FORMAT CCN-YYMMDD-XXXXX ---
  const brandPart = "CCN";

  // Lấy ngày tháng năm định dạng YYMMDD
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const datePart = `${yy}${mm}${dd}`;

  // Tạo chuỗi 5 ký tự ngẫu nhiên (Chữ in hoa + Số)
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Ghép lại thành mã hoàn chỉnh
  const newOrderCode = `${brandPart}-${datePart}-${randomPart}`;
  // -------------------------------------------------------------

  return prisma.$transaction(async (tx) => {
    // 1. Tạo order mới
    const newOrder = await tx.orders.create({
      data: {
        orderCode: newOrderCode,
        userId,
        paymentMethodId,
        voucherId: voucherId || null,
        shippingAddressId,
        subtotalAmount: new Prisma.Decimal(subtotalAmount),
        shippingFee: new Prisma.Decimal(shippingFee),
        voucherDiscount: new Prisma.Decimal(voucherDiscount),
        totalAmount: new Prisma.Decimal(totalAmount),
        orderStatus: "PENDING",
        paymentStatus: "UNPAID",
        bankTransferCode: bankTransferCode || null,
        orderItems: {
          create: items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: {
        orderItems: {
          include: { productVariant: { include: { product: true } } },
        },
      },
    });

    // 2. Trừ tồn kho & Tăng số lượng đã bán
    for (const item of items) {
      const variant = await tx.products_variants.findUnique({
        where: { id: item.productVariantId },
      });

      if (!variant) throw new Error(`Product variant not found: ${item.productVariantId}`);
      if (variant.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${item.productName}. Available: ${variant.quantity}`);
      }

      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: {
          quantity: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // 3. Xóa các sản phẩm đã mua khỏi giỏ hàng
    await tx.cart_items.deleteMany({
      where: { userId },
    });

    // 4. Cập nhật lượt sử dụng Voucher (Nếu có)
    if (voucherId) {
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
