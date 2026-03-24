import * as repo from "./checkout.repository";
import { CheckoutInput, CartValidationResult, CartItemValidation, CheckoutSummary } from "./checkout.types";
import { BadRequestError, NotFoundError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import prisma from "@/config/db";
import { nanoid } from "nanoid";
import { getCartWithPricing } from "../pricing/use-cases/getCartWithPricing.service";
import { sendOrderConfirmationEmail } from "../../../services/email.service";
import { sendOrderCreatedAdminNotification } from "../notification/notification.service";

// =======================================================
// 1. Cart validation (ĐÃ SỬA ĐỂ GHI NHẬN GIÁ PROMOTION)
// =======================================================

export const validateCartItems = async (userId: string): Promise<CartValidationResult> => {
  // Gọi hàm tính giá chung từ module Pricing thay vì gọi trực tiếp DB
  const cartPricing = await getCartWithPricing(userId);

  if (cartPricing.items.length === 0) {
    return {
      isValid: false,
      totalItems: 0,
      totalQuantity: 0,
      items: [],
      errors: ["Giỏ hàng trống, vui lòng thêm sản phẩm"],
    };
  }

  const errors: string[] = [];
  const validatedItems: CartItemValidation[] = [];

  if (!cartPricing.isValid && cartPricing.errors) {
    errors.push(...cartPricing.errors);
  }

  for (const item of cartPricing.items) {
    // 🔥 LẤY GIÁ ĐÃ GIẢM TỪ PROMOTION
    // Công thức: Dùng giá final nếu có, hoặc dùng (Tổng giá cuối / số lượng) cho an toàn tuyệt đối
    const finalUnitPrice = item.price?.hasPromotion && item.price?.final ? item.price.final : item.totalFinalPrice ? item.totalFinalPrice / item.quantity : item.unitPrice;

    validatedItems.push({
      productVariantId: item.productVariantId as string,
      quantity: item.quantity,
      unitPrice: finalUnitPrice, // 🔥 Ghi nhận giá đã giảm vào đây để lưu xuống Bảng Order Items
      isValid: true,
      errors: [],
      productName: item.productName,
      variantCode: item.variantCode,
    });
  }

  return {
    isValid: errors.length === 0,
    totalItems: cartPricing.totalItems,
    totalQuantity: cartPricing.totalQuantity,
    items: validatedItems,
    errors,
  };
};

// =======================================================
// 2. Tính phí vận chuyển
// =======================================================
export const calculateShippingFee = async (subtotal: number, addressId: string): Promise<number> => {
  const address = await repo.findAddressWithProvince(addressId).catch(handlePrismaError);
  if (!address) throw new NotFoundError("Địa chỉ giao hàng");

  // Freeship cho đơn từ 5tr
  if (subtotal >= 5000000) return 0;

  // Phí ship: HCM 30k, tỉnh khác 50k
  return address.province.name.includes("Hồ Chí Minh") ? 30000 : 50000;
};

// =======================================================
// 3. Tính Voucher
// =======================================================
export const validateAndApplyVoucher = async (voucherId: string | undefined, subtotal: number, userId: string): Promise<{ discount: number; id: string | null }> => {
  if (!voucherId) return { discount: 0, id: null };

  const voucher = await repo.findVoucherWithUser(voucherId, userId).catch(handlePrismaError);

  if (!voucher) throw new NotFoundError("Mã khuyến mãi");

  const now = new Date();
  if (!voucher.isActive || (voucher.startDate && now < voucher.startDate) || (voucher.endDate && now > voucher.endDate)) {
    throw new BadRequestError("Voucher đã hết hạn hoặc không khả dụng");
  }

  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    throw new BadRequestError("Voucher đã hết lượt sử dụng trên hệ thống");
  }

  if (Number(voucher.minOrderValue) > subtotal) {
    throw new BadRequestError(`Đơn hàng chưa đạt giá trị tối thiểu ${Number(voucher.minOrderValue).toLocaleString()}đ để áp dụng voucher này`);
  }

  const userUsage = voucher.voucherUsers[0];
  if (userUsage && voucher.maxUsesPerUser && userUsage.usedCount >= voucher.maxUsesPerUser) {
    throw new BadRequestError("Bạn đã hết lượt sử dụng mã khuyến mãi này");
  }

  let discount = 0;
  if (voucher.discountType === "DISCOUNT_FIXED") {
    discount = Number(voucher.discountValue);
  } else if (voucher.discountType === "DISCOUNT_PERCENT") {
    discount = Math.floor((subtotal * Number(voucher.discountValue)) / 100);
    if (voucher.maxDiscountValue) discount = Math.min(discount, Number(voucher.maxDiscountValue));
  }

  // Không giảm quá giá trị đơn hàng
  discount = Math.min(discount, subtotal);

  return { discount, id: voucher.id };
};

// =======================================================
// 4. Tính Thuế
// =======================================================
const VAT_RATE = 0.1;
export const calculateTax = (subtotal: number, shippingFee: number, voucherDiscount: number): number => {
  const taxableAmount = subtotal + shippingFee - voucherDiscount;
  return Math.round(Math.max(taxableAmount, 0) * VAT_RATE);
};

// =======================================================
// 5. Chuẩn bị dữ liệu Checkout (Gom tất cả lại)
// =======================================================
export const prepareCheckoutData = async (userId: string, input: CheckoutInput): Promise<CheckoutSummary> => {
  const { paymentMethodId, shippingAddressId, voucherId } = input;

  const [validation, paymentMethod] = await Promise.all([validateCartItems(userId), repo.findPaymentMethodById(paymentMethodId).catch(handlePrismaError)]);

  if (!validation.isValid) {
    throw new BadRequestError(`Giỏ hàng không hợp lệ: ${validation.errors.join(", ")}`);
  }

  if (!paymentMethod) {
    throw new NotFoundError("Phương thức thanh toán");
  }

  const items = validation.items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice), // 🔥 Tại đây nó sẽ bốc đúng cái giá Promotion đã được gán ở hàm validateCartItems
    subtotal: Number(item.unitPrice) * item.quantity,
    productName: item.productName || "Unknown Product",
    variantCode: item.variantCode ?? null,
  }));

  const subtotalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  // Parallel: shipping fee + voucher
  const [shippingFee, { discount: voucherDiscount }] = await Promise.all([calculateShippingFee(subtotalAmount, shippingAddressId), validateAndApplyVoucher(voucherId, subtotalAmount, userId)]);

  const taxAmount = calculateTax(subtotalAmount, shippingFee, voucherDiscount);
  const totalAmount = subtotalAmount + shippingFee - voucherDiscount + taxAmount;

  const isBankTransfer = paymentMethod.code === "BANK_TRANSFER";
  const bankTransferCode = isBankTransfer ? `TT${nanoid(8).toUpperCase()}` : undefined;

  return {
    items,
    subtotalAmount,
    shippingFee,
    voucherDiscount,
    taxAmount,
    totalAmount,
    paymentMethodId,
    paymentMethodCode: paymentMethod.code,
    shippingAddressId,
    voucherId,
    bankTransferCode,
  };
};

// =======================================================
// 6. DB Transactions
// =======================================================
export const createOrderFromCheckout = async (userId: string, checkoutSummary: CheckoutSummary) => {
  try {
    // Gọi sang hàm lưu Database của Checkout Repository (Đã có Address Snapshot)
    const order = await repo.executeOrderTransaction(userId, checkoutSummary);

    // 🎉 GỬI EMAIL XÁC NHẬN ĐẶT HÀNG SAU KHI ORDER TẠO THÀNH CÔNG
    try {
      const [user, paymentMethod] = await Promise.all([
        prisma.users.findUnique({
          where: { id: userId },
          select: { email: true, fullName: true }
        }),
        prisma.payment_methods.findUnique({
          where: { id: checkoutSummary.paymentMethodId },
          select: { name: true }
        })
      ]);

      if (user?.email) {
        // Lấy thông tin sản phẩm từ order items
        const firstItem = order.orderItems[0];
        const productName = firstItem?.productVariant?.product?.name || 'Sản phẩm';
        const variantName = firstItem?.productVariant?.code || 'Phiên bản';

        await sendOrderConfirmationEmail(
          user.email,
          user.fullName || 'Khách hàng',
          order.orderCode,
          {
            productName,
            variantName,
            quantity: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
            unitPrice: Number(order.orderItems[0]?.unitPrice || 0),
            totalAmount: Number(order.totalAmount),
            shippingAddress: order.shippingDetail,
            paymentMethod: paymentMethod?.name || 'Chưa xác định'
          }
        );

        console.log(`📧 Email xác nhận đơn hàng ${order.orderCode} đã gửi tới ${user.email}`);
      }
    } catch (emailError) {
      console.warn(`⚠️ Lỗi gửi email xác nhận (nhưng order đã tạo):`, emailError);
      // Không throw error - order đã tạo rồi, không nên lỗi vì email
    }

    // 🔔 GỬI THÔNG BÁO CHO ADMIN/STAFF KHI CÓ ĐƠN HÀNG MỚI
    try {
      await sendOrderCreatedAdminNotification(order.orderCode);
      console.log(`🔔 Thông báo đơn hàng mới ${order.orderCode} đã gửi cho ADMIN/STAFF`);
    } catch (adminNotifError) {
      console.warn(`⚠️ Lỗi gửi thông báo admin (nhưng order đã tạo):`, adminNotifError);
      // Không throw error - order đã tạo rồi, không nên lỗi vì notification
    }

    return order;
  } catch (error: any) {
    throw new BadRequestError(`Order creation failed: ${error.message}`);
  }
};

export const releaseOrderInventory = async (orderId: string) => {
  try {
    await repo.cancelOrderAndRestoreInventory(orderId);
  } catch (error: any) {
    throw new BadRequestError(`Failed to restore inventory: ${error.message}`);
  }
};
