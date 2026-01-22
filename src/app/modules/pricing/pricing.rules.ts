import {
  PromotionData,
  VoucherData,
  PricingContext,
  PromotionTargetData,
  VoucherTargetData,
} from "./pricing.types";
import { TargetType, PromotionActionType, DiscountType } from "@prisma/client";
import { DISCOUNT_CALCULATION } from "./pricing.constants";

/**
 * Kiểm tra promotion target có áp dụng cho sản phẩm không
 */
export const isPromotionTargetApplicable = (
  target: PromotionTargetData,
  productId: string,
  brandId?: string,
  context?: PricingContext,
): boolean => {
  switch (target.targetType) {
    case TargetType.PRODUCT:
      return target.targetId === productId;

    // case TargetType.CATEGORY:
    //   return categoryId ? target.targetId === categoryId : false;
    case TargetType.CATEGORY:
      return !!target.targetId && context?.categoryPath?.includes(target.targetId) === true;

    case TargetType.BRAND:
      return brandId ? target.targetId === brandId : false;

    case TargetType.ALL:
      return true;

    default:
      return false;
  }
};

/**
 * Kiểm tra promotion có valid không (time-based)
 */
export const isPromotionValid = (promotion: PromotionData, context?: PricingContext): boolean => {
  if (!promotion.isActive) return false;

  if (context) {
    const now = context.currentDate;
    if (promotion.startDate && now < promotion.startDate) return false;
    if (promotion.endDate && now > promotion.endDate) return false;
  }

  return true;
};

/**
 * Lấy promotion targets áp dụng cho sản phẩm
 */
export const getApplicablePromotionTargets = (
  promotion: PromotionData,
  productId: string,
  quantity: number,
  brandId?: string,
  context?: PricingContext,
): PromotionTargetData[] => {
  // Check promotion validity
  if (!isPromotionValid(promotion, context)) {
    return [];
  }

  // Filter applicable targets
  const applicable = promotion.targets.filter((target) => {
    // Check target scope
    if (!isPromotionTargetApplicable(target, productId, brandId, context)) {
      return false;
    }

    // Check buy quantity requirement
    if (target.buyQuantity && quantity < target.buyQuantity) {
      return false;
    }

    return true;
  });

  return applicable;
};

/**
 * Tính discount amount từ promotion target
 */
export const calculatePromotionTargetDiscount = (
  target: PromotionTargetData,
  basePrice: number,
  quantity: number,
): { discountAmount: number; applicableQuantity: number } => {
  let discountAmount = 0;
  let applicableQuantity = quantity;

  // Calculate based on action type
  switch (target.actionType) {
    case PromotionActionType.DISCOUNT_PERCENT:
      if (target.discountValue) {
        discountAmount = DISCOUNT_CALCULATION.DISCOUNT_PERCENT(
          basePrice * quantity,
          target.discountValue,
        );
      }
      break;

    case PromotionActionType.DISCOUNT_FIXED:
      if (target.discountValue) {
        discountAmount = DISCOUNT_CALCULATION.DISCOUNT_FIXED(
          basePrice * quantity,
          target.discountValue,
        );
      }
      break;

    case PromotionActionType.BUY_X_GET_Y:
      // Mua X tặng Y: giảm giá cho Y sản phẩm
      if (target.buyQuantity && target.getQuantity) {
        const sets = Math.floor(quantity / target.buyQuantity);
        const freeItems = Math.min(sets * target.getQuantity, quantity);
        discountAmount = freeItems * basePrice;
        applicableQuantity = freeItems;
      }
      break;

    case PromotionActionType.GIFT_PRODUCT:
      // Gift product không giảm giá, chỉ tặng quà
      discountAmount = 0;
      break;

    default:
      break;
  }

  return { discountAmount: Math.round(discountAmount), applicableQuantity };
};

/**
 * Lấy promotion target tốt nhất cho sản phẩm
 */
export const getBestPromotionTarget = (
  productId: string,
  basePrice: number,
  quantity: number,
  categoryPath?: string[],
  brandId?: string,
  context?: PricingContext,
): { promotion: PromotionData; target: PromotionTargetData } | null => {
  if (!context?.availablePromotions) return null;

  let bestResult: {
    promotion: PromotionData;
    target: PromotionTargetData;
    discountAmount: number;
  } | null = null;

  // Check each promotion
  for (const promotion of context.availablePromotions) {
    const applicableTargets = getApplicablePromotionTargets(
      promotion,
      productId,
      quantity,
      brandId,
      context,
    );

    // Find best target in this promotion
    for (const target of applicableTargets) {
      const { discountAmount } = calculatePromotionTargetDiscount(target, basePrice, quantity);

      if (!bestResult || discountAmount > bestResult.discountAmount) {
        bestResult = { promotion, target, discountAmount };
      } else if (
        discountAmount === bestResult.discountAmount &&
        promotion.priority < bestResult.promotion.priority
      ) {
        // Same discount, check priority (lower = better)
        bestResult = { promotion, target, discountAmount };
      }
    }
  }

  return bestResult ? { promotion: bestResult.promotion, target: bestResult.target } : null;
};

/**
 * Kiểm tra voucher target có áp dụng cho sản phẩm không
 */
export const isVoucherTargetApplicable = (
  target: VoucherTargetData,
  productId: string,
  categoryId?: string,
  brandId?: string,
): boolean => {
  switch (target.targetType) {
    case TargetType.PRODUCT:
      return target.targetId === productId;

    case TargetType.CATEGORY:
      return categoryId ? target.targetId === categoryId : false;

    case TargetType.BRAND:
      return brandId ? target.targetId === brandId : false;

    case TargetType.ALL:
      return true;

    default:
      return false;
  }
};

/**
 * Kiểm tra voucher có thể áp dụng không
 */
export const isVoucherValid = (
  voucher: VoucherData,
  cartTotal: number,
  context?: PricingContext,
): { valid: boolean; error?: string } => {
  if (!voucher.isActive) {
    return { valid: false, error: "Voucher không còn hoạt động" };
  }

  const now = context?.currentDate ?? new Date();

  // Check time
  if (voucher.startDate && now < voucher.startDate) {
    return { valid: false, error: "Voucher chưa có hiệu lực" };
  }
  if (voucher.endDate && now > voucher.endDate) {
    return { valid: false, error: "Voucher đã hết hạn" };
  }

  // Check min order value
  if (cartTotal < voucher.minOrderValue) {
    return {
      valid: false,
      error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ`,
    };
  }

  // Check max uses
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    return { valid: false, error: "Voucher đã hết lượt sử dụng" };
  }

  // Check user usage limit
  if (
    voucher.maxUsesPerUser &&
    voucher.userUsedCount !== undefined &&
    voucher.userUsedCount >= voucher.maxUsesPerUser
  ) {
    return { valid: false, error: "Bạn đã dùng hết lượt sử dụng voucher này" };
  }

  // Check user-specific max uses (from voucher_user)
  if (
    voucher.userMaxUses !== undefined &&
    voucher.userUsedCount !== undefined &&
    voucher.userUsedCount >= voucher.userMaxUses
  ) {
    return { valid: false, error: "Bạn đã dùng hết lượt sử dụng voucher này" };
  }

  return { valid: true };
};

/**
 * Tính discount từ voucher cho các items áp dụng được
 */
export const calculateVoucherDiscount = (
  voucher: VoucherData,
  items: Array<{
    productId: string;
    categoryId?: string;
    brandId?: string;
    totalPrice: number;
  }>,
): number => {
  // Filter items that voucher applies to
  const applicableItems = items.filter((item) =>
    voucher.targets.some((target) =>
      isVoucherTargetApplicable(target, item.productId, item.categoryId, item.brandId),
    ),
  );

  if (applicableItems.length === 0) return 0;

  // Calculate total of applicable items
  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.totalPrice, 0);

  let discount = 0;

  if (voucher.discountType === DiscountType.DISCOUNT_PERCENT) {
    discount = DISCOUNT_CALCULATION.DISCOUNT_PERCENT(applicableTotal, voucher.discountValue);
  } else {
    // DISCOUNT_FIXED
    discount = DISCOUNT_CALCULATION.DISCOUNT_FIXED(applicableTotal, voucher.discountValue);
  }

  return Math.round(discount);
};
