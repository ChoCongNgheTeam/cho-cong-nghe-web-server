import { Prisma } from "@prisma/client";
import { findAllOrders, findOrdersByUserId, findOrderById, updateOrder } from "./order.repository";
import { CreateOrderAdminInput, UpdateOrderAdminInput } from "./order.validation";
import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";

// ================== HELPER FUNCTIONS ==================

// Đồng bộ công thức tính thuế VAT 10% từ checkout.service.ts
const VAT_RATE = 0.1;
const calculateTax = (subtotal: number, shippingFee: number, voucherDiscount: number): number => {
  const taxableAmount = subtotal + shippingFee - voucherDiscount;
  return Math.round(Math.max(taxableAmount, 0) * VAT_RATE);
};

// ================== ADMIN SERVICES ==================

export const createOrderAdmin = async (input: CreateOrderAdminInput) => {
  const {
    userId, shippingAddressId, customerInfo, newAddress, items,
    voucherCode, shippingFee, paymentMethodId, paymentStatus, orderStatus,
  } = input;

  return prisma.$transaction(async (tx) => {
    let finalUserId = userId;
    let finalShippingAddressId = shippingAddressId;
    let addressSnapshot: any = {};

    // 1. XỬ LÝ KHÁCH HÀNG (Tạo mới nếu Admin nhập tay)
    if (!finalUserId && customerInfo) {
      // Tự sinh email ảo nếu không nhập, dùng timestamp để chống trùng
      const emailToUse = customerInfo.email || `guest_${customerInfo.phone}_${Date.now()}@chocongnghe.com`;
      
      let user = await tx.users.findFirst({
        where: { OR: [{ email: emailToUse }, { phone: customerInfo.phone }] }
      });

      if (!user) {
        user = await tx.users.create({
          data: {
            fullName: customerInfo.fullName,
            phone: customerInfo.phone,
            email: emailToUse,
            role: "CUSTOMER", // Gán quyền cơ bản
          }
        });
      }
      finalUserId = user.id;
    }

    if (!finalUserId) throw new BadRequestError("Không xác định được thông tin khách hàng");

    // 2. XỬ LÝ ĐỊA CHỈ GIAO HÀNG
    if (!finalShippingAddressId && newAddress && customerInfo) {
      const createdAddress = await tx.user_addresses.create({
        data: {
          userId: finalUserId,
          contactName: customerInfo.fullName,
          phone: customerInfo.phone,
          provinceId: newAddress.provinceId,
          wardId: newAddress.wardId,
          detailAddress: newAddress.detailAddress,
          isDefault: true,
        },
        include: { province: true, ward: true }
      });
      finalShippingAddressId = createdAddress.id;
      addressSnapshot = {
        contactName: createdAddress.contactName,
        phone: createdAddress.phone,
        province: createdAddress.province.name,
        ward: createdAddress.ward.name,
        detailAddress: createdAddress.detailAddress,
      };
    } else if (finalShippingAddressId) {
      const existingAddr = await tx.user_addresses.findUnique({
        where: { id: finalShippingAddressId },
        include: { province: true, ward: true }
      });
      if (!existingAddr) throw new NotFoundError("Địa chỉ giao hàng");
      addressSnapshot = {
        contactName: existingAddr.contactName,
        phone: existingAddr.phone,
        province: existingAddr.province.name,
        ward: existingAddr.ward.name,
        detailAddress: existingAddr.detailAddress,
      };
    }

    // 3. TÍNH TOÁN & TRỪ TỒN KHO
    let subtotalAmount = 0;
    let voucherDiscount = 0;
    let finalVoucherId: string | null = null;

    for (const item of items) {
      const variant = await tx.products_variants.findUnique({
        where: { id: item.productVariantId },
      });

      if (!variant) throw new NotFoundError(`Sản phẩm (Variant ID: ${item.productVariantId})`);
      if (variant.quantity < item.quantity) {
        throw new BadRequestError(`Sản phẩm không đủ tồn kho. Chỉ còn ${variant.quantity}`);
      }

      subtotalAmount += (Number(variant.price) * item.quantity);

      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: {
          quantity: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // 4. XỬ LÝ VOUCHER
    if (voucherCode) {
      const voucher = await tx.vouchers.findUnique({ where: { code: voucherCode } });
      if (!voucher || !voucher.isActive) throw new BadRequestError("Mã khuyến mãi không hợp lệ");

      finalVoucherId = voucher.id;
      voucherDiscount = voucher.discountType === "DISCOUNT_PERCENT"
        ? (subtotalAmount * Number(voucher.discountValue)) / 100
        : Number(voucher.discountValue);
      voucherDiscount = Math.min(voucherDiscount, subtotalAmount);

      await tx.vouchers.update({
        where: { id: finalVoucherId },
        data: { usesCount: { increment: 1 } }
      });
    }

    // 5. CHỐT TIỀN & LƯU DB
    const taxAmount = calculateTax(subtotalAmount, shippingFee, voucherDiscount);
    const totalAmount = subtotalAmount + shippingFee - voucherDiscount + taxAmount;

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderCode = `CCN-${datePart}-${randomPart}`;

    const newOrder = await tx.orders.create({
      data: {
        orderCode,
        userId: finalUserId,
        shippingAddressId: finalShippingAddressId,
        paymentMethodId,
        voucherId: finalVoucherId,
        
        shippingContactName: addressSnapshot.contactName,
        shippingPhone: addressSnapshot.phone,
        shippingProvince: addressSnapshot.province,
        shippingWard: addressSnapshot.ward,
        shippingDetail: addressSnapshot.detailAddress,
        
        subtotalAmount: new Prisma.Decimal(subtotalAmount),
        shippingFee: new Prisma.Decimal(shippingFee),
        voucherDiscount: new Prisma.Decimal(voucherDiscount),
        totalAmount: new Prisma.Decimal(totalAmount),
        
        orderStatus,
        paymentStatus,
        orderItems: {
          create: items.map(i => ({
            productVariantId: i.productVariantId,
            quantity: i.quantity,
            unitPrice: new Prisma.Decimal(i.unitPrice)
          }))
        }
      },
      include: { orderItems: true } 
    });

    if (finalVoucherId) {
      await tx.voucher_usages.create({
        data: { voucherId: finalVoucherId, userId: finalUserId, orderId: newOrder.id }
      });
    }

    return newOrder;
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

  // Dùng transaction để vừa hoàn stock vừa xóa order
  await prisma.$transaction(async (tx) => {
    // 1. Hoàn lại stock
    for (const item of order.orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariant.id },
        data: {
          quantity: { increment: item.quantity },
          soldCount: { decrement: item.quantity }, // Bổ sung giảm soldCount để dữ liệu chuẩn xác
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

// ================== PUBLIC SERVICES (USER) ==================

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