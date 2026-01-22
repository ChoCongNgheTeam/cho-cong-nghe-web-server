import { PricedProduct, AppliedDiscount } from "./pricing.types";

export const formatPrice = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + "đ";
};

/**
 * Tính discount percentage
 */
export const calculateDiscountPercentage = (basePrice: number, finalPrice: number): number => {
  if (basePrice === 0) return 0;
  const percentage = ((basePrice - finalPrice) / basePrice) * 100;
  return Math.round(percentage);
};

export const validatePricingInput = (
  basePrice: number,
  quantity: number,
): { valid: boolean; error?: string } => {
  if (basePrice < 0) {
    return { valid: false, error: "Giá không hợp lệ" };
  }

  if (quantity <= 0) {
    return { valid: false, error: "Số lượng phải lớn hơn 0" };
  }

  return { valid: true };
};

/**
 * Create pricing summary for display
 */
export const createPricingSummary = (pricedProduct: PricedProduct) => {
  return {
    basePrice: formatPrice(pricedProduct.basePrice),
    finalPrice: formatPrice(pricedProduct.finalPrice),
    discount: formatPrice(pricedProduct.totalDiscount),
    discountPercentage: `${pricedProduct.discountPercentage}%`,
    hasDiscount: pricedProduct.hasPromotion,
    promotions: pricedProduct.appliedPromotions.map((p) => ({
      name: p.name,
      discount: formatPrice(p.discountAmount),
    })),
  };
};
