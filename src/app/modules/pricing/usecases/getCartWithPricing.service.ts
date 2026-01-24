import { calculateCartPrice } from "../pricing.service";
import { PricingProductInput } from "../pricing.types";

/**
 * Cart Item Input từ database
 */
export interface CartItemInput {
  id: string; // cart_item id
  productId: string;
  variantId: string;
  quantity: number;
  basePrice: number; // Giá gốc từ variant

  // Context for pricing
  brandId?: string;
  categoryId?: string;
  categoryPath?: string[];

  // Product info for display
  productName?: string;
  productSlug?: string;
  variantImage?: string;
}

/**
 * Cart Summary Response
 */
export interface CartWithPricingResponse {
  items: {
    id: string; // cart_item id
    productId: string;
    variantId: string;
    productName: string;
    productSlug: string;
    variantImage?: string;
    quantity: number;

    // Pricing
    basePrice: number;
    finalPrice: number;
    totalBasePrice: number;
    totalFinalPrice: number;
    totalDiscount: number;
    discountPercentage: number;

    // Promotions
    appliedPromotions: {
      id: string;
      name: string;
      description: string;
      discountAmount: number;
      actionType: string;
    }[];

    // Gifts
    gifts?: {
      variantId: string;
      quantity: number;
    }[];
  }[];

  // Summary
  subtotal: number;
  totalPromotionDiscount: number;
  totalVoucherDiscount: number;
  totalDiscount: number;
  finalTotal: number;

  // Applied voucher
  appliedVoucher?: {
    id: string;
    code: string;
    discountAmount: number;
    description: string;
  };

  // Total gifts
  totalGifts: {
    variantId: string;
    quantity: number;
    productName?: string; // Fetch from DB
    productImage?: string;
  }[];

  // Validation
  isValid: boolean;
  errors: string[];
}

/**
 * ===== MAIN USECASE =====
 * Get cart with pricing calculation
 * Dùng cho: Cart page, Mini cart
 */
export const getCartWithPricing = async (
  cartItems: CartItemInput[],
  userId?: string,
  voucherCode?: string,
): Promise<CartWithPricingResponse> => {
  // Convert to pricing input format
  const pricingInput: PricingProductInput[] = cartItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    basePrice: item.basePrice,
    quantity: item.quantity,
    brandId: item.brandId,
    categoryPath: item.categoryPath,
  }));

  // Calculate pricing (CART MODE)
  const pricingResult = await calculateCartPrice({
    items: pricingInput,
    userId,
    voucherCode,
  });

  // Map to response format
  const items = pricingResult.items.map((pricedItem, index) => {
    const originalItem = cartItems[index];

    return {
      id: originalItem.id,
      productId: pricedItem.productId,
      variantId: pricedItem.variantId,
      productName: originalItem.productName || "",
      productSlug: originalItem.productSlug || "",
      variantImage: originalItem.variantImage,
      quantity: pricedItem.quantity,

      // Pricing
      basePrice: pricedItem.basePrice,
      finalPrice: pricedItem.finalPrice,
      totalBasePrice: pricedItem.totalBasePrice,
      totalFinalPrice: pricedItem.totalFinalPrice,
      totalDiscount: pricedItem.totalDiscount,
      discountPercentage: pricedItem.discountPercentage,

      // Promotions
      appliedPromotions: pricedItem.appliedPromotions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        discountAmount: p.discountAmount,
        actionType: p.actionType?.toString() || "",
      })),

      // Gifts
      gifts: pricedItem.giftProducts,
    };
  });

  return {
    items,
    subtotal: pricingResult.subtotal,
    totalPromotionDiscount: pricingResult.totalPromotionDiscount,
    totalVoucherDiscount: pricingResult.totalVoucherDiscount,
    totalDiscount: pricingResult.totalDiscount,
    finalTotal: pricingResult.finalTotal,
    appliedVoucher: pricingResult.appliedVoucher
      ? {
          id: pricingResult.appliedVoucher.id,
          code: pricingResult.appliedVoucher.name,
          discountAmount: pricingResult.appliedVoucher.discountAmount,
          description: pricingResult.appliedVoucher.description,
        }
      : undefined,
    totalGifts: pricingResult.totalGifts.map((gift) => ({
      variantId: gift.variantId,
      quantity: gift.quantity,
      // Note: Fetch product info separately if needed
    })),
    isValid: pricingResult.isValid,
    errors: pricingResult.errors,
  };
};

/**
 * ===== HELPER USECASE =====
 * Validate cart before checkout
 */
export const validateCartForCheckout = async (
  cartItems: CartItemInput[],
  userId?: string,
  voucherCode?: string,
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check empty cart
  if (cartItems.length === 0) {
    errors.push("Giỏ hàng trống");
    return { isValid: false, errors, warnings };
  }

  // Check quantity
  cartItems.forEach((item) => {
    if (item.quantity <= 0) {
      errors.push(`Số lượng không hợp lệ cho sản phẩm ${item.productName}`);
    }
  });

  // Get pricing to validate
  const cartWithPricing = await getCartWithPricing(cartItems, userId, voucherCode);

  // Collect pricing errors
  if (!cartWithPricing.isValid) {
    errors.push(...cartWithPricing.errors);
  }

  // Check if final total is valid
  if (cartWithPricing.finalTotal <= 0) {
    errors.push("Tổng giá trị đơn hàng không hợp lệ");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * ===== HELPER USECASE =====
 * Apply voucher to cart
 */
export const applyVoucherToCart = async (
  cartItems: CartItemInput[],
  voucherCode: string,
  userId?: string,
): Promise<{
  success: boolean;
  message: string;
  cart?: CartWithPricingResponse;
}> => {
  try {
    const cart = await getCartWithPricing(cartItems, userId, voucherCode);

    if (!cart.isValid && cart.errors.length > 0) {
      return {
        success: false,
        message: cart.errors[0],
      };
    }

    if (!cart.appliedVoucher) {
      return {
        success: false,
        message: "Voucher không áp dụng được cho giỏ hàng này",
      };
    }

    return {
      success: true,
      message: `Đã áp dụng voucher. Giảm ${cart.totalVoucherDiscount.toLocaleString()}đ`,
      cart,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Lỗi khi áp dụng voucher",
    };
  }
};

/**
 * ===== HELPER USECASE =====
 * Remove voucher from cart
 */
export const removeVoucherFromCart = async (
  cartItems: CartItemInput[],
  userId?: string,
): Promise<CartWithPricingResponse> => {
  return getCartWithPricing(cartItems, userId);
};
