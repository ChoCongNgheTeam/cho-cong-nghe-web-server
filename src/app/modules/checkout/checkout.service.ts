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

export const validateCartItems = async (userId: string, cartItemIds?: string[]): Promise<CartValidationResult> => {
  // Gọi hàm tính giá chung từ module Pricing thay vì gọi trực tiếp DB
  const cartPricing = await getCartWithPricing(userId, cartItemIds);

  if (cartPricing.items.length === 0) {
    return {
      isValid: false,
      totalItems: 0,
      totalQuantity: 0,
      items: [],
      errors: ["Giỏ hàng trống hoặc chưa có sản phẩm nào được chọn, vui lòng chọn sản phẩm"],
      totalPromotionDiscount: 0,
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
    totalPromotionDiscount: cartPricing.totalPromotionDiscount || 0,
  };
};

// =======================================================
// 2. Tính phí vận chuyển (Đã nâng cấp theo vùng miền)
// =======================================================

// Helper: Phân loại tỉnh thành theo khu vực (Có thể đưa ra file config riêng sau này)
const REGION_MAP = {
  HCM: ["Hồ Chí Minh"],
  MIEN_BAC: [
    "Hà Nội", "Hải Phòng", "Hà Giang", "Cao Bằng", "Lai Châu", "Lào Cai",
    "Điện Biên", "Yên Bái", "Sơn La", "Hòa Bình", "Thái Nguyên", "Tuyên Quang",
    "Phú Thọ", "Bắc Giang", "Bắc Kạn", "Lạng Sơn", "Quảng Ninh", "Bắc Ninh",
    "Hà Nam", "Hải Dương", "Hưng Yên", "Nam Định", "Ninh Bình", "Thái Bình", "Vĩnh Phúc"
  ],
  MIEN_TRUNG: [
    "Đà Nẵng", "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị",
    "Thừa Thiên Huế", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên",
    "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk",
    "Đắk Nông", "Lâm Đồng"
  ],
  // Các tỉnh Miền Nam còn lại (ngoài HCM)
  MIEN_NAM: [
    "Cần Thơ", "Bình Phước", "Bình Dương", "Đồng Nai", "Tây Ninh",
    "Bà Rịa - Vũng Tàu", "Long An", "Đồng Tháp", "Tiền Giang", "An Giang",
    "Bến Tre", "Vĩnh Long", "Trà Vinh", "Hậu Giang", "Kiên Giang", "Sóc Trăng",
    "Bạc Liêu", "Cà Mau"
  ]
};

// Hàm tìm khu vực dựa vào tên tỉnh
const getRegionCategory = (provinceName: string): string => {
  if (REGION_MAP.HCM.some(p => provinceName.includes(p))) return "HCM";
  if (REGION_MAP.MIEN_BAC.some(p => provinceName.includes(p))) return "MIEN_BAC";
  if (REGION_MAP.MIEN_TRUNG.some(p => provinceName.includes(p))) return "MIEN_TRUNG";
  return "MIEN_NAM";
};

// 🔥 Đã xóa logic query DB. Bây giờ hàm này tính toán tức thì (Synchronous)
export const calculateShippingFee = (subtotal: number, provinceName: string): number => {
  const region = getRegionCategory(provinceName);

  if (region === "HCM") {
    if (subtotal >= 3000000) return 0;     // Đơn > 3 triệu -> Freeship hoàn toàn
    return 30000;                         // Đơn < 3 triệu -> Mặc định 30k
  }

  // 2. Khu vực Miền Trung
  if (region === "MIEN_TRUNG") {
    if (subtotal >= 10000000) return 0;    // Đơn > 10 triệu -> Freeship
    if (subtotal >= 2000000) return 20000; // Đơn > 2 triệu -> Được trợ giá còn 20k
    return 40000;                         // Đơn < 2 triệu -> Phí cơ bản 40k
  }

  // 3. Khu vực Miền Bắc
  if (region === "MIEN_BAC") {
    if (subtotal >= 20000000) return 0;    // Vì xa kho trung tâm (giả sử kho ở Nam/Trung), đơn > 2tr mới freeship
    if (subtotal >= 3000000) return 30000; // Đơn > 3 triệu -> Trợ giá còn 30k
    if (provinceName.includes("Hà Nội")) return 30000; // Nội thành HN
    return 50000;                         // Liên tỉnh/Vùng xa
  }

  // 4. Các tỉnh Miền Nam còn lại (Đồng bằng Sông Cửu Long, Đông Nam Bộ)
  if (region === "MIEN_NAM") {
    if (subtotal >= 5000000) return 0;    // Đơn > 5 triệu -> Freeship
    if (subtotal >= 1000000) return 20000; // Trợ giá
    return 35000;                         // Phí cơ bản
  }

  // Fallback an toàn (trường hợp tên tỉnh bị lỗi không map được)
  return 40000;
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
// 5. Chuẩn bị dữ liệu Checkout (Gom tất cả lại)
// =======================================================
export const prepareCheckoutData = async (userId: string, input: CheckoutInput): Promise<CheckoutSummary> => {
  const { paymentMethodId, shippingAddressId, voucherId, cartItemIds } = input;

  // 🔥 TỐI ƯU PERFORMANCE: Bắn đồng loạt 3 Query Validation + Payment + Address cùng một lúc
  const [validation, paymentMethod, address] = await Promise.all([
    validateCartItems(userId, cartItemIds),
    repo.findPaymentMethodById(paymentMethodId).catch(handlePrismaError),
    repo.findAddressWithProvince(shippingAddressId).catch(handlePrismaError) // Fetch address ở đây
  ]);

  // Xử lý các lỗi nếu có
  if (!validation.isValid) throw new BadRequestError(`Giỏ hàng không hợp lệ: ${validation.errors.join(", ")}`);
  if (!paymentMethod) throw new NotFoundError("Phương thức thanh toán");
  if (!address) throw new NotFoundError("Địa chỉ giao hàng");

  // Tính tổng tiền giỏ hàng
  const items = validation.items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.unitPrice) * item.quantity,
    productName: item.productName || "Unknown Product",
    variantCode: item.variantCode ?? null,
  }));
  const subtotalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  // 🔥 Lấy thêm tổng tiền giảm giá khuyến mãi từ hàm validate 
  const totalPromotionDiscount = validation.totalPromotionDiscount || 0; 

  // 🔥 TÍNH PHÍ SHIP CỰC NHANH: Dùng Pure Function, truyền thẳng tên Tỉnh/Thành
  const shippingFee = calculateShippingFee(subtotalAmount, address.province.name);

  // Validate Voucher (Cần có subtotalAmount nên phải chạy sau)
  const { discount: voucherDiscount } = await validateAndApplyVoucher(voucherId, subtotalAmount, userId);

  const totalAmount = subtotalAmount + shippingFee - voucherDiscount;

  const isBankTransfer = paymentMethod.code === "BANK_TRANSFER";
  const bankTransferCode = isBankTransfer ? `TT${nanoid(8).toUpperCase()}` : undefined;

  return {
    items,
    subtotalAmount,
    shippingFee,
    voucherDiscount,
    totalPromotionDiscount, 
    totalAmount,
    paymentMethodId,
    paymentMethodCode: paymentMethod.code,
    shippingAddressId,
    voucherId,
    bankTransferCode,
    cartItemIds,
  };
};

// =======================================================
// 6. DB Transactions
// =======================================================
export const createOrderFromCheckout = async (userId: string, checkoutSummary: CheckoutSummary) => {
  try {
    // Gọi sang hàm lưu Database của Checkout Repository (Đã có Address Snapshot)
    const order = await repo.executeOrderTransaction(userId, checkoutSummary);

    // 🎉 GỬI EMAIL XÁC NHẬN ĐẶT HÀNG (ASYNC — không chặn response)
    // Chạy ở background, không cần await
    (async () => {
      try {
        const [user, paymentMethod] = await Promise.all([
          prisma.users.findUnique({
            where: { id: userId },
            select: { email: true, fullName: true },
          }),
          prisma.payment_methods.findUnique({
            where: { id: checkoutSummary.paymentMethodId },
            select: { name: true, code: true },
          }),
        ]);

        if (user?.email) {
          const firstItem = order.orderItems[0];
          const productName = firstItem?.productVariant?.product?.name || "Sản phẩm";
          const variantName = firstItem?.productVariant?.code || "Phiên bản";

          const { paymentRedirectUrl, bankTransferQrUrl } = checkoutSummary.paymentFields || {};
          const fullShippingAddress = `${order.shippingContactName} - ${order.shippingPhone} | ${order.shippingDetail}, ${order.shippingWard}, ${order.shippingProvince}`;

          await sendOrderConfirmationEmail(
            user.email,
            user.fullName || order.shippingContactName,
            order.orderCode,
            {
              productName,
              variantName,
              quantity: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
              unitPrice: Number(order.orderItems[0]?.unitPrice || 0),
              totalAmount: Number(order.totalAmount),
              shippingAddress: fullShippingAddress,
              paymentMethod: paymentMethod?.name || "Chưa xác định",
            },
            {
              paymentMethodCode: paymentMethod?.code || "",
              paymentLink: paymentRedirectUrl || bankTransferQrUrl || undefined,
            },
          );
        }
      } catch (emailError) {
        console.warn(`⚠️ Lỗi gửi email xác nhận:`, emailError);
      }
    })(); // Fire and forget

    // 🔔 GỬI THÔNG BÁO CHO ADMIN/STAFF (ASYNC — không chặn response)
    (async () => {
      try {
        await sendOrderCreatedAdminNotification(order.orderCode);
      } catch (adminNotifError) {
        console.warn(`⚠️ Lỗi gửi thông báo admin:`, adminNotifError);
      }
    })(); // Fire and forget

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