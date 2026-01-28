import { PromotionActionType } from "@prisma/client";
import { PricedProduct, AppliedDiscount } from "./pricing.types";

export const formatPrice = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + "đ";
};

export const formatPromotionDescription = (target: any): string => {
  switch (target.actionType) {
    case PromotionActionType.DISCOUNT_PERCENT:
      return `Giảm ${target.discountValue}%`;

    case PromotionActionType.DISCOUNT_FIXED:
      return `Giảm ${Number(target.discountValue).toLocaleString()}đ`;

    case PromotionActionType.BUY_X_GET_Y:
      return `Mua ${target.buyQuantity} tặng ${target.getQuantity}`;

    case PromotionActionType.GIFT_PRODUCT:
      return `Tặng quà khi mua ${target.description || 1} sản phẩm`;

    default:
      return "Khuyến mãi đặc biệt";
  }
};

export const formatVoucherDescription = (voucher: any): string => {
  if (voucher.discountType === "DISCOUNT_PERCENT") {
    return `Giảm ${voucher.discountValue}%`;
  }
  return `Giảm ${Number(voucher.discountValue).toLocaleString()}đ`;
};

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

// export const createPricingSummary = (pricedProduct: PricedProduct) => {
//   return {
//     basePrice: formatPrice(pricedProduct.basePrice),
//     finalPrice: formatPrice(pricedProduct.finalPrice),
//     discount: formatPrice(pricedProduct.totalDiscount),
//     discountPercentage: `${pricedProduct.discountPercentage}%`,
//     hasDiscount: pricedProduct.hasPromotion,
//     promotions: pricedProduct.appliedPromotions.map((p) => ({
//       name: p.name,
//       discount: formatPrice(p.discountAmount),
//     })),
//   };
// };

export const mapPricingToSummary = (pricing: any) => {
  if (!pricing) return null;

  return {
    base: pricing.base,
    final: pricing.final,
    discountAmount: pricing.discountAmount,
    discountPercentage: pricing.discountPercentage,
    hasPromotion: pricing.hasPromotion,
  };
};
