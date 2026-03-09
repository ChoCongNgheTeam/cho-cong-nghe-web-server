import * as repo from "./order.repository";
import { CreateOrderAdminInput, UpdateOrderAdminInput, OrderQuery } from "./order.validation";
import { NotFoundError, BadRequestError, ForbiddenError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import prisma from "@/config/db";

// ================== PUBLIC SERVICES (USER) ==================

export const getMyOrders = async (userId: string) => {
  return repo.findOrdersByUserId(userId);
};

export const getOrderDetail = async (orderId: string, userId?: string) => {
  const order = await repo.findOrderById(orderId, !userId); // Admin thấy hết, User chỉ thấy đơn active
  if (!order) throw new NotFoundError("Đơn hàng");
  if (userId && order.userId !== userId) throw new ForbiddenError("Bạn không có quyền xem đơn hàng này");
  return order;
};

export const cancelOrderUser = async (orderId: string, userId: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (order.userId !== userId) throw new ForbiddenError("Không có quyền");
  if (order.orderStatus === "CANCELLED") throw new BadRequestError("Đơn hàng đã được hủy trước đó");
  if (order.orderStatus !== "PENDING" && order.orderStatus !== "PROCESSING") {
    throw new BadRequestError("Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận hoặc Đang xử lý");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: { quantity: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
      });
    }
    await tx.orders.update({ where: { id: orderId }, data: { orderStatus: "CANCELLED" } });
  });
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
            data: { quantity: existingCartItem.quantity + addQty }
          });
        } else {
          await tx.cart_items.create({
            data: { userId, productVariantId: variant.id, quantity: addQty, unitPrice: variant.price }
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
  return repo.updateOrder(orderId, input);
};

export const cancelOrderAdmin = async (orderId: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (order.orderStatus === "CANCELLED") throw new BadRequestError("Đơn hàng đã được hủy trước đó");

  // 👇 BỔ SUNG LOGIC CHẶN TẠI ĐÂY
  if (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") {
    throw new BadRequestError("Không thể hủy đơn hàng đang giao hoặc đã giao thành công. Hành động này sẽ làm sai lệch tồn kho!");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Hoàn lại tồn kho
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: { quantity: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
      });
    }
    // 2. Chuyển trạng thái
    await tx.orders.update({ where: { id: orderId }, data: { orderStatus: "CANCELLED" } });
  });
};

export const createOrderAdmin = async (input: CreateOrderAdminInput) => {
  // ... (Giữ nguyên toàn bộ logic tạo đơn như ở tin nhắn trước) ...
  const {
    userId, shippingAddressId, customerInfo, newAddress, items,
    voucherCode, shippingFee, paymentMethodId, paymentStatus, orderStatus,
  } = input;

  return prisma.$transaction(async (tx) => {
    let finalUserId = userId;
    let finalShippingAddressId = shippingAddressId;
    let addressSnapshot: any = {};

    if (!finalUserId && customerInfo) {
      const newUser = await tx.users.create({
        data: {
          email: customerInfo.email || `guest_${Date.now()}@noemail.com`,
          fullName: customerInfo.fullName, phone: customerInfo.phone, role: "CUSTOMER", isActive: true,
        },
      });
      finalUserId = newUser.id;
    }

    if (!finalShippingAddressId && newAddress && finalUserId) {
      const province = await tx.provinces.findUnique({ where: { id: newAddress.provinceId } });
      const ward = await tx.wards.findUnique({ where: { id: newAddress.wardId } });

      const newAddr = await tx.user_addresses.create({
        data: {
          userId: finalUserId, contactName: customerInfo!.fullName, phone: customerInfo!.phone,
          provinceId: newAddress.provinceId, wardId: newAddress.wardId, detailAddress: newAddress.detailAddress, isDefault: true,
        },
      });
      finalShippingAddressId = newAddr.id;
      addressSnapshot = {
        shippingContactName: customerInfo!.fullName, shippingPhone: customerInfo!.phone,
        shippingProvince: province?.fullName || "", shippingWard: ward?.fullName || "", shippingDetail: newAddress.detailAddress,
      };
    } else if (finalShippingAddressId) {
      const existingAddr = await tx.user_addresses.findUnique({
        where: { id: finalShippingAddressId }, include: { province: true, ward: true },
      });
      if (existingAddr) {
        addressSnapshot = {
          shippingContactName: existingAddr.contactName, shippingPhone: existingAddr.phone,
          shippingProvince: existingAddr.province.fullName, shippingWard: existingAddr.ward.fullName, shippingDetail: existingAddr.detailAddress,
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
        if (voucher.discountType === "DISCOUNT_FIXED") {
          finalVoucherDiscount = Number(voucher.discountValue);
        } else {
          finalVoucherDiscount = Math.min(subtotalAmount * (Number(voucher.discountValue) / 100), Number(voucher.maxDiscountValue || subtotalAmount));
        }
        appliedVoucherId = voucher.id;
        await tx.vouchers.update({ where: { id: voucher.id }, data: { usesCount: { increment: 1 } } });
      }
    }

    const totalAmount = subtotalAmount + shippingFee - finalVoucherDiscount;

    return tx.orders.create({
      data: {
        orderCode: `ORD${Date.now().toString().slice(-6)}`,
        userId: finalUserId!, paymentMethodId, voucherId: appliedVoucherId, shippingAddressId: finalShippingAddressId,
        ...addressSnapshot, subtotalAmount, shippingFee, voucherDiscount: finalVoucherDiscount, totalAmount, orderStatus, paymentStatus,
        orderItems: { create: orderItemsData },
      },
      include: { orderItems: true },
    });
  });
};

// ================== ADMIN ONLY: ARCHIVE (LƯU TRỮ ĐƠN HÀNG) ==================

export const getArchivedOrdersAdmin = async (query: OrderQuery) => repo.findAllArchivedOrders(query);

export const archiveOrderAdmin = async (orderId: string, adminId: string) => {
  const order = await repo.findOrderById(orderId);
  if (!order) throw new NotFoundError("Đơn hàng");
  
  // LOGIC CHỐNG LỆCH KHO: Chỉ được archive những đơn đã chốt (Hủy hoặc Giao thành công)
  if (order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED") {
    throw new BadRequestError("Chỉ được phép Lưu trữ (Archive) các đơn hàng đã GIAO THÀNH CÔNG hoặc ĐÃ HỦY. Nếu đây là đơn rác, hãy Hủy đơn trước để hoàn kho.");
  }

  return repo.archiveOrder(orderId, adminId);
};

export const unarchiveOrderAdmin = async (orderId: string) => {
  const order = await repo.findOrderById(orderId, true);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (!order.deletedAt) throw new BadRequestError("Đơn hàng này chưa bị lưu trữ");

  return repo.unarchiveOrder(orderId);
};

export const hardDeleteOrderAdmin = async (orderId: string) => {
  const order = await repo.findOrderById(orderId, true);
  if (!order) throw new NotFoundError("Đơn hàng");
  if (!order.deletedAt) throw new BadRequestError("Đơn hàng phải được lưu trữ trước khi có thể xóa vĩnh viễn");

  return await repo.hardDeleteOrderFromDb(orderId).catch(handlePrismaError);
};