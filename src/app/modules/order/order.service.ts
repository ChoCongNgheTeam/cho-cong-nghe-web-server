import * as repo from "./order.repository";
import { CreateOrderAdminInput, UpdateOrderAdminInput, OrderQuery } from "./order.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import prisma from "@/config/db";
import { sendOrderStatusNotification, sendOrderCreatedAdminNotification } from "../notification/notification.service";

// Tách thành helper riêng để dễ test
const triggerRefundIfEligible = async (orderId: string) => {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      totalAmount: true,
      paymentMethodId: true,
      paymentMethod: { select: { code: true } },
    },
  });
  if (!order) return;

  const methodCode = (order.paymentMethod?.code ?? "").toUpperCase();
  const isBankTransfer = methodCode.includes("BANK_TRANSFER") || methodCode.includes("SEPAY");

  if (isBankTransfer) {
    // Manual: giữ REFUND_PENDING, staff sẽ xác nhận sau
    // Có thể gửi notification cho staff ở đây
    return;
  }

  // Sandbox auto-refund (MoMo, VNPay, ZaloPay, Stripe)
  // Giả lập gọi API thành công → mark REFUNDED ngay
  await prisma.orders.update({
    where: { id: orderId },
    data: {
      paymentStatus: "REFUNDED",
      refundedAt: new Date(),
      // refundedBy null vì là auto
    },
  });

  // Tạo refund transaction để có audit log
  await prisma.payment_transactions.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId!,
      amount: order.totalAmount,
      transactionRef: `REFUND_AUTO_${Date.now()}`,
      status: "REFUNDED",
      payload: { type: "auto_refund_sandbox", triggeredAt: new Date().toISOString() },
    },
  });
};

// Chỉ staff/admin gọi — xác nhận đã chuyển tiền hoàn tay
export const confirmManualRefund = async (orderId: string, staffId: string, refundNote?: string) => {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    select: { id: true, paymentStatus: true, totalAmount: true, paymentMethodId: true },
  });
  if (!order) throw new NotFoundError("Đơn hàng");
  if (order.paymentStatus !== "REFUND_PENDING") {
    throw new BadRequestError("Đơn hàng không ở trạng thái chờ hoàn tiền");
  }

  await prisma.$transaction(async (tx) => {
    await tx.orders.update({
      where: { id: orderId },
      data: {
        paymentStatus: "REFUNDED",
        refundedAt: new Date(),
        refundedBy: staffId,
        refundNote: refundNote ?? null,
      },
    });

    await tx.payment_transactions.create({
      data: {
        orderId: order.id,
        paymentMethodId: order.paymentMethodId!,
        amount: order.totalAmount,
        transactionRef: `REFUND_MANUAL_${Date.now()}`,
        status: "REFUNDED",
        payload: {
          type: "manual_refund",
          confirmedBy: staffId,
          confirmedAt: new Date().toISOString(),
          note: refundNote,
        },
      },
    });
  });
};

// ================== PUBLIC SERVICES (USER) ==================

export const getMyOrders = async (userId: string) => {
  return repo.findOrdersByUserId(userId);
};

export const getOrderDetail = async (orderId: string, userId?: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (userId && order.userId !== userId) throw new ForbiddenError("Bạn không có quyền xem đơn hàng này");
  return order;
};

export const getOrderPaymentInfo = async (orderCode: string, userId: string) => {
  const order = await repo.findOrderPaymentInfoByCode(orderCode, userId);
  if (!order) throw new NotFoundError("Đơn hàng");

  const methodCode = (order.paymentMethod?.name ?? "").toUpperCase().replace(/\s+/g, "_");
  const isBankTransfer = methodCode.includes("BANK_TRANSFER");

  const orderItems = (order.orderItems ?? []).map((item: any) => {
    if (item.image !== null) return item;
    const firstValidImg = item.productVariant?.product?.img?.find((img: any) => img.imageUrl !== null);
    return { ...item, image: firstValidImg?.imageUrl ?? null };
  });

  return {
    ...order,
    orderItems,
    paymentMethodCode: methodCode,
    ...(isBankTransfer && {
      bankName: process.env.BANK_NAME ?? null,
      bankAccount: process.env.BANK_ACCOUNT ?? null,
      bankHolder: process.env.BANK_HOLDER ?? null,
    }),
  };
};

// cancelOrderUser — thêm refund logic
export const cancelOrderUser = async (orderId: string, userId: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (order.userId !== userId) throw new ForbiddenError("Không có quyền");
  if (order.orderStatus === "CANCELLED") throw new BadRequestError("Đơn hàng đã được hủy trước đó");
  if (order.orderStatus !== "PENDING" && order.orderStatus !== "PROCESSING") {
    throw new BadRequestError("Chỉ có thể hủy đơn ở trạng thái Chờ xác nhận hoặc Đang xử lý");
  }

  const wasPaid = order.paymentStatus === "PAID";

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: { quantity: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
      });
    }
    await tx.orders.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
        // Nếu đã PAID → chuyển sang REFUND_PENDING thay vì giữ PAID
        ...(wasPaid && { paymentStatus: "REFUND_PENDING" }),
      },
    });
  });

  // Nếu đã PAID và dùng ví điện tử sandbox → auto refund
  if (wasPaid) {
    await triggerRefundIfEligible(orderId);
  }
};

export const reorderUser = async (orderId: string, userId: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (order.userId !== userId) throw new ForbiddenError("Không có quyền");

  let addedCount = 0;
  let outOfStockCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      const variant = await tx.products_variants.findUnique({ where: { id: item.productVariant.id } });

      if (variant && variant.isActive && variant.deletedAt === null && variant.quantity > 0) {
        const addQty = Math.min(item.quantity, variant.quantity);
        const existingCartItem = await tx.cart_items.findFirst({ where: { userId, productVariantId: variant.id } });

        if (existingCartItem) {
          await tx.cart_items.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + addQty },
          });
        } else {
          await tx.cart_items.create({
            data: { userId, productVariantId: variant.id, quantity: addQty, unitPrice: variant.price },
          });
        }
        addedCount++;
      } else {
        outOfStockCount++;
      }
    }
  });

  return { addedCount, outOfStockCount };
};

// ================== ADMIN/STAFF SERVICES ==================

export const getAllOrdersAdmin = async (query: OrderQuery) => repo.findAllOrders(query);

export const updateOrderAdmin = async (orderId: string, input: UpdateOrderAdminInput) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: {
      orderStatus: input.orderStatus,
      paymentStatus: input.paymentStatus,
      paymentMethodId: input.paymentMethodId, // ← thêm
      shippingFee: input.shippingFee,
      voucherDiscount: input.voucherDiscount,
    },
  });
  // [THÊM MỚI] Gửi thông báo nếu trạng thái đơn hàng thay đổi
  if (input.orderStatus && input.orderStatus !== order.orderStatus) {
    sendOrderStatusNotification(updatedOrder.userId, updatedOrder.orderCode, input.orderStatus).catch((err) => {
      console.error("[Notification Error] Lỗi gửi thông báo order status:", err);
    });
  }
  return repo.updateOrder(orderId, input);
};

// cancelOrderAdmin — tương tự
export const cancelOrderAdmin = async (orderId: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (order.orderStatus === "CANCELLED") throw new BadRequestError("Đơn hàng đã được hủy trước đó");
  if (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") {
    throw new BadRequestError("Không thể hủy đơn đang giao hoặc đã giao");
  }

  const wasPaid = order.paymentStatus === "PAID";

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: { quantity: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
      });
    }
    await tx.orders.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
        ...(wasPaid && { paymentStatus: "REFUND_PENDING" }),
      },
    });
  });

  sendOrderStatusNotification(order.userId, order.orderCode, "CANCELLED").catch(console.error);

  if (wasPaid) {
    await triggerRefundIfEligible(orderId);
  }
};

export const createOrderAdmin = async (input: CreateOrderAdminInput) => {
  const { userId, shippingAddressId, customerInfo, newAddress, items, voucherCode, shippingFee, paymentMethodId, paymentStatus, orderStatus } = input;

  const order = await prisma.$transaction(async (tx) => {
    let finalUserId = userId;
    let finalShippingAddressId = shippingAddressId;
    let addressSnapshot: any = {};

    if (!finalUserId && customerInfo) {
      const newUser = await tx.users.create({
        data: {
          email: customerInfo.email || `guest_${Date.now()}@noemail.com`,
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          role: "CUSTOMER",
          isActive: true,
        },
      });
      finalUserId = newUser.id;
    }

    if (!finalShippingAddressId && newAddress && finalUserId) {
      // Lấy tên tỉnh/thành từ external API
      const provinceRes = await fetch(`https://provinces.open-api.vn/api/v2/p/${newAddress.provinceCode}?depth=2`);
      const provinceData = await provinceRes.json();
      const wardData = provinceData.wards?.find((w: any) => w.code === newAddress.wardCode);

      const newAddr = await tx.user_addresses.create({
        data: {
          userId: finalUserId,
          contactName: customerInfo!.fullName,
          phone: customerInfo!.phone,
          provinceCode: newAddress.provinceCode,
          provinceName: provinceData.name || "",
          wardCode: newAddress.wardCode,
          wardName: wardData?.name || "",
          detailAddress: newAddress.detailAddress,
          isDefault: true,
        },
      });
      finalShippingAddressId = newAddr.id;
      addressSnapshot = {
        shippingContactName: customerInfo!.fullName,
        shippingPhone: customerInfo!.phone,
        shippingProvince: provinceData.name || "",
        shippingWard: wardData?.name || "",
        shippingDetail: newAddress.detailAddress,
      };
    } else if (finalShippingAddressId) {
      const existingAddr = await tx.user_addresses.findUnique({
        where: { id: finalShippingAddressId },
      });
      if (existingAddr) {
        addressSnapshot = {
          shippingContactName: existingAddr.contactName,
          shippingPhone: existingAddr.phone,
          shippingProvince: existingAddr.provinceName,
          shippingWard: existingAddr.wardName,
          shippingDetail: existingAddr.detailAddress,
        };
      }
    }

    let subtotalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const variant = await tx.products_variants.findUnique({ where: { id: item.productVariantId } });
      if (!variant) throw new BadRequestError(`Biến thể SP ${item.productVariantId} không tồn tại`);
      if (variant.quantity < item.quantity) throw new BadRequestError(`Không đủ tồn kho cho biến thể ${variant.code}`);

      subtotalAmount += Number(item.unitPrice) * item.quantity;
      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: { quantity: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
      });
      orderItemsData.push({ productVariantId: item.productVariantId, quantity: item.quantity, unitPrice: item.unitPrice });
    }

    let finalVoucherDiscount = 0;
    let appliedVoucherId = null;

    if (voucherCode) {
      const voucher = await tx.vouchers.findUnique({ where: { code: voucherCode } });
      if (voucher && voucher.isActive) {
        finalVoucherDiscount =
          voucher.discountType === "DISCOUNT_FIXED"
            ? Number(voucher.discountValue)
            : Math.min(subtotalAmount * (Number(voucher.discountValue) / 100), Number(voucher.maxDiscountValue || subtotalAmount));
        appliedVoucherId = voucher.id;
        await tx.vouchers.update({ where: { id: voucher.id }, data: { usesCount: { increment: 1 } } });
      }
    }

    const totalAmount = subtotalAmount + shippingFee - finalVoucherDiscount;

    const numberPart = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");

    const letterPart = Math.random().toString(36).substring(2, 4).toUpperCase();

    const uuidPart = crypto.randomUUID().slice(0, 6).toUpperCase();

    const orderCode = `CCN${numberPart}${letterPart}${uuidPart}`;

    return tx.orders.create({
      data: {
        orderCode: orderCode,
        userId: finalUserId!,
        paymentMethodId,
        voucherId: appliedVoucherId,
        shippingAddressId: finalShippingAddressId,
        ...addressSnapshot,
        subtotalAmount,
        shippingFee,
        voucherDiscount: finalVoucherDiscount,
        totalAmount,
        orderStatus,
        paymentStatus,
        orderItems: { create: orderItemsData },
      },
      include: { orderItems: true },
    });
  });

  // 🔔 GỬI THÔNG BÁO CHO ADMIN/STAFF KHI TẠO ĐƠN HÀNG
  try {
    await sendOrderCreatedAdminNotification(order.orderCode);
    // console.log(`🔔 Thông báo đơn hàng mới ${order.orderCode} đã gửi cho ADMIN/STAFF`);
  } catch (adminNotifError) {
    console.warn(`⚠️ Lỗi gửi thông báo admin (nhưng order đã tạo):`, adminNotifError);
    // Không throw error - order đã tạo rồi, không nên lỗi vì notification
  }

  return order;
};
