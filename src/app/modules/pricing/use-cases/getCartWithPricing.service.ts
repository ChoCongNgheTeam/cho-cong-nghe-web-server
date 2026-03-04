import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";
// 👇 Import data service vào Orchestrator
import { getCart } from "../../cart/cart.service";

/**
 * ===== MAIN USECASE (ORCHESTRATOR) =====
 * Tính giá giỏ hàng theo ĐÚNG pattern của ProductDetail
 */
export const getCartWithPricing = async (
  userId: string,
  voucherCode?: string,
) => {
  // 1. LẤY DỮ LIỆU THÔ TỪ CART SERVICE (HƯỚNG 1)
  const cartItems = await getCart(userId);

  if (cartItems.length === 0) {
    return {
      items: [],
      totalItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      totalPromotionDiscount: 0,
      totalVoucherDiscount: 0,
      totalDiscount: 0,
      finalTotal: 0,
      isValid: true,
      errors: []
    };
  }

  let subtotal = 0;
  let totalPromotionDiscount = 0;
  const errors: string[] = [];

  // 2. CHECK GIẢM GIÁ TỪNG ITEM TỪ PRICING LOGIC (HƯỚNG 2)
  const items = await Promise.all(
    cartItems.map(async (item) => {
      // Gọi chung 1 hàm tính giá của hệ thống
      const fullPricing = await getVariantPricing(
        item.productId,
        item.productVariantId,
        item.unitPrice, 
        item.brandId,
        item.categoryPath,
        userId
      );

      // Map format chuẩn
      const priceSummary = mapPricingToSummary(fullPricing);
      const finalPrice = fullPricing.final ?? fullPricing.base;

      // Tính tổng tiền cho dòng item này
      const itemTotalBasePrice = item.unitPrice * item.quantity;
      const itemTotalFinalPrice = finalPrice * item.quantity;

      // Cộng dồn vào tổng giỏ hàng
      subtotal += itemTotalBasePrice;
      totalPromotionDiscount += (item.unitPrice - finalPrice) * item.quantity;

      return {
        ...item, // Gộp lại các trường của CartResponse (id, name, color, storage...)
        price: priceSummary, // Đè object price
        totalBasePrice: itemTotalBasePrice,
        totalFinalPrice: itemTotalFinalPrice,
      };
    })
  );

  let totalVoucherDiscount = 0;
  let appliedVoucher = undefined;
  let finalTotal = subtotal - totalPromotionDiscount;

  // 3. TÍCH HỢP VOUCHER
  // if (voucherCode && finalTotal > 0) {
  //   const voucherInfo = await checkVoucher(voucherCode, finalTotal, userId);
  //   if (voucherInfo.isValid) {
  //     totalVoucherDiscount = voucherInfo.discountAmount;
  //     finalTotal -= totalVoucherDiscount;
  //     appliedVoucher = voucherInfo.details;
  //   } else {
  //     errors.push("Voucher không hợp lệ hoặc đã hết hạn");
  //   }
  // }

  return {
    items,
    totalItems: cartItems.length,
    totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    totalPromotionDiscount,
    totalVoucherDiscount,
    totalDiscount: totalPromotionDiscount + totalVoucherDiscount,
    finalTotal: Math.max(0, finalTotal),
    appliedVoucher,
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * ===== HELPER USECASES =====
 */
export const validateCartForCheckout = async (
  userId: string,
  voucherCode?: string,
) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const cartWithPricing = await getCartWithPricing(userId, voucherCode);

  if (cartWithPricing.items.length === 0) {
    errors.push("Giỏ hàng trống");
    return { isValid: false, errors, warnings };
  }

  cartWithPricing.items.forEach((item) => {
    if (item.quantity <= 0) {
      errors.push(`Số lượng không hợp lệ cho sản phẩm ${item.productName}`);
    }
  });

  if (!cartWithPricing.isValid) errors.push(...cartWithPricing.errors);
  if (cartWithPricing.finalTotal < 0) errors.push("Tổng giá trị đơn hàng không hợp lệ");

  return { isValid: errors.length === 0, errors, warnings };
};

export const applyVoucherToCart = async (
  userId: string,
  voucherCode: string,
) => {
  try {
    const cart = await getCartWithPricing(userId, voucherCode);

    if (!cart.isValid && cart.errors.length > 0) {
      return { success: false, message: cart.errors[0] };
    }

    if (!cart.appliedVoucher) {
      return { success: false, message: "Voucher không áp dụng được cho giỏ hàng này" };
    }

    return {
      success: true,
      message: `Đã áp dụng voucher. Giảm ${cart.totalVoucherDiscount.toLocaleString()}đ`,
      cart,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Lỗi khi áp dụng voucher" };
  }
};

export const removeVoucherFromCart = async (
  userId: string,
) => {
  return getCartWithPricing(userId);
};