import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";

/**
 * Cart Item Input từ database
 */
export interface CartItemInput {
  id: string; // cart_item id
  productId: string;
  variantId: string;
  quantity: number;
  basePrice: number; // Giá gốc từ variant

  // Context for pricing (Bắt buộc phải truyền vào từ Repo)
  brandId?: string;
  categoryId?: string;
  categoryPath?: string[];

  // Product info for display
  productName?: string;
  productSlug?: string;
  variantImage?: string;
}

/**
 * Cart Summary Response - Đã chuẩn hóa field `price`
 */
export interface CartWithPricingResponse {
  items: {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    productSlug: string;
    variantImage?: string;
    quantity: number;

    // 🔥 Dùng chung object price y hệt bên Product
    price: any; 
    
    // Tiền tổng của item này trong giỏ (giá * số lượng)
    totalBasePrice: number;
    totalFinalPrice: number;
  }[];

  // Summary toàn giỏ hàng
  subtotal: number;
  totalPromotionDiscount: number;
  totalVoucherDiscount: number;
  totalDiscount: number;
  finalTotal: number;

  appliedVoucher?: {
    id: string;
    code: string;
    discountAmount: number;
    description: string;
  };

  isValid: boolean;
  errors: string[];
}

/**
 * ===== MAIN USECASE =====
 * Tính giá giỏ hàng theo ĐÚNG pattern của ProductDetail
 */
export const getCartWithPricing = async (
  cartItems: CartItemInput[],
  userId?: string,
  voucherCode?: string,
): Promise<CartWithPricingResponse> => {
  let subtotal = 0;
  let totalPromotionDiscount = 0;
  const errors: string[] = [];

  // 1. Lặp qua từng item và tính khuyến mãi hệt như Product
  const items = await Promise.all(
    cartItems.map(async (item) => {
      // Gọi chung 1 hàm tính giá của hệ thống
      const fullPricing = await getVariantPricing(
        item.productId,
        item.variantId,
        item.basePrice,
        item.brandId,
        item.categoryPath,
        userId
      );

      // Map format chuẩn
      const priceSummary = mapPricingToSummary(fullPricing);
      const finalPrice = fullPricing.final ?? fullPricing.base;

      // Tính tổng tiền cho dòng item này
      const itemTotalBasePrice = item.basePrice * item.quantity;
      const itemTotalFinalPrice = finalPrice * item.quantity;

      // Cộng dồn vào tổng giỏ hàng
      subtotal += itemTotalBasePrice;
      totalPromotionDiscount += (item.basePrice - finalPrice) * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName || "",
        productSlug: item.productSlug || "",
        variantImage: item.variantImage,
        quantity: item.quantity,
        
        // Trả ra object price quen thuộc cho FE
        price: priceSummary,

        totalBasePrice: itemTotalBasePrice,
        totalFinalPrice: itemTotalFinalPrice,
      };
    })
  );

  let totalVoucherDiscount = 0;
  let appliedVoucher = undefined;
  let finalTotal = subtotal - totalPromotionDiscount;

  // 2. TÍCH HỢP VOUCHER (Nếu ông có module tính voucher riêng thì gọi ở đây)
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
  cartItems: CartItemInput[],
  userId?: string,
  voucherCode?: string,
) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (cartItems.length === 0) {
    errors.push("Giỏ hàng trống");
    return { isValid: false, errors, warnings };
  }

  cartItems.forEach((item) => {
    if (item.quantity <= 0) {
      errors.push(`Số lượng không hợp lệ cho sản phẩm ${item.productName}`);
    }
  });

  const cartWithPricing = await getCartWithPricing(cartItems, userId, voucherCode);

  if (!cartWithPricing.isValid) errors.push(...cartWithPricing.errors);
  if (cartWithPricing.finalTotal < 0) errors.push("Tổng giá trị đơn hàng không hợp lệ");

  return { isValid: errors.length === 0, errors, warnings };
};

export const applyVoucherToCart = async (
  cartItems: CartItemInput[],
  voucherCode: string,
  userId?: string,
) => {
  try {
    const cart = await getCartWithPricing(cartItems, userId, voucherCode);

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
  cartItems: CartItemInput[],
  userId?: string,
): Promise<CartWithPricingResponse> => {
  return getCartWithPricing(cartItems, userId);
};