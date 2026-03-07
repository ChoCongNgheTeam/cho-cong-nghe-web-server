import { PromotionActionType } from "@prisma/client";
import { PromotionRuleData } from "./pricing.types";

export const formatPrice = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + "đ";
};

export const formatPromotionDescription = (rule: PromotionRuleData): string => {
  switch (rule.actionType) {
    case PromotionActionType.DISCOUNT_PERCENT:
      return `Giảm ${rule.discountValue}%`;

    case PromotionActionType.DISCOUNT_FIXED:
      return `Giảm ${Number(rule.discountValue).toLocaleString()}đ`;

    case PromotionActionType.BUY_X_GET_Y:
      return `Mua ${rule.buyQuantity} tặng ${rule.getQuantity}`;

    case PromotionActionType.GIFT_PRODUCT:
      return `Tặng quà khi mua ${rule.buyQuantity || 1} sản phẩm`;

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
