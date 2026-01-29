import {
  PromotionData,
  VoucherData,
  PricingContext,
  PromotionTargetData,
  PromotionRuleData,
  VoucherTargetData,
  DisplayPromotion,
} from "./pricing.types";
import { TargetType, PromotionActionType, DiscountType } from "@prisma/client";
import { DISCOUNT_CALCULATION } from "./pricing.constants";

/**
 * Kiểm tra target có áp dụng cho sản phẩm không
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
 * Kiểm tra promotion có valid không (time-based và usage limit)
 */
export const isPromotionValid = (promotion: PromotionData, context?: PricingContext): boolean => {
  if (!promotion.isActive) return false;

  if (context) {
    const now = context.currentDate;
    if (promotion.startDate && now < promotion.startDate) return false;
    if (promotion.endDate && now > promotion.endDate) return false;
  }

  // Check usage limit
  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
    return false;
  }

  return true;
};

/**
 * Lấy các rule áp dụng được cho sản phẩm (WITH quantity check)
 * Trả về các rule của promotion nếu có ít nhất 1 target match
 */
export const getApplicablePromotionRules = (
  promotion: PromotionData,
  productId: string,
  quantity: number,
  brandId?: string,
  context?: PricingContext,
): PromotionRuleData[] => {
  // Check promotion validity
  if (!isPromotionValid(promotion, context)) {
    return [];
  }

  // Check if ANY target applies to this product
  const hasApplicableTarget = promotion.targets.some((target) =>
    isPromotionTargetApplicable(target, productId, brandId, context),
  );

  if (!hasApplicableTarget) {
    return [];
  }

  // Filter rules based on quantity requirement
  const applicableRules = promotion.rules.filter((rule) => {
    // Check buy quantity requirement
    if (rule.buyQuantity && quantity < rule.buyQuantity) {
      return false;
    }

    return true;
  });

  return applicableRules;
};

/**
 * Lấy TẤT CẢ promotions có thể áp dụng (KHÔNG check quantity)
 * Dùng cho product detail để hiển thị tất cả chương trình
 */
export const getAllAvailablePromotions = (
  productId: string,
  brandId?: string,
  context?: PricingContext,
): DisplayPromotion[] => {
  if (!context?.availablePromotions) return [];

  const promotions: DisplayPromotion[] = [];
  const addedPromotionRules = new Set<string>();

  for (const promotion of context.availablePromotions) {
    // Check time validity only
    if (!isPromotionValid(promotion, context)) {
      continue;
    }

    // Check if any target applies to this product (NO quantity check)
    const hasApplicableTarget = promotion.targets.some((target) =>
      isPromotionTargetApplicable(target, productId, brandId, context),
    );

    if (!hasApplicableTarget) continue;

    // Add all rules of this promotion
    for (const rule of promotion.rules) {
      const ruleKey = `${promotion.id}-${rule.actionType}`;

      if (!addedPromotionRules.has(ruleKey)) {
        promotions.push({
          id: promotion.id,
          name: promotion.name,
          description: promotion.description,
          actionType: rule.actionType,
          buyQuantity: rule.buyQuantity,
          getQuantity: rule.getQuantity,
          discountValue: rule.discountValue ? Number(rule.discountValue) : undefined,
        });

        addedPromotionRules.add(ruleKey);
      }
    }
  }

  return promotions;
};

/**
 * Tính discount amount từ promotion rule
 */
export const calculatePromotionRuleDiscount = (
  rule: PromotionRuleData,
  basePrice: number,
  quantity: number,
  maxDiscountValue?: number | null,
): { discountAmount: number; applicableQuantity: number } => {
  let discountAmount = 0;
  let applicableQuantity = quantity;

  // Calculate based on action type
  switch (rule.actionType) {
    case PromotionActionType.DISCOUNT_PERCENT:
      if (rule.discountValue) {
        discountAmount = DISCOUNT_CALCULATION.DISCOUNT_PERCENT(
          basePrice * quantity,
          Number(rule.discountValue),
          maxDiscountValue ? Number(maxDiscountValue) : undefined,
        );
      }
      break;

    case PromotionActionType.DISCOUNT_FIXED:
      if (rule.discountValue) {
        discountAmount = DISCOUNT_CALCULATION.DISCOUNT_FIXED(
          basePrice * quantity,
          Number(rule.discountValue),
        );
      }
      break;

    case PromotionActionType.BUY_X_GET_Y:
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
 * Lấy promotion rule tốt nhất cho sản phẩm
 */
export const getBestPromotionRule = (
  productId: string,
  basePrice: number,
  quantity: number,
  categoryPath?: string[],
  brandId?: string,
  context?: PricingContext,
): { promotion: PromotionData; rule: PromotionRuleData } | null => {
  if (!context?.availablePromotions) return null;

  let bestResult: {
    promotion: PromotionData;
    rule: PromotionRuleData;
    discountAmount: number;
  } | null = null;

  const PRICE_AFFECTING_ACTIONS: PromotionActionType[] = [
    PromotionActionType.DISCOUNT_PERCENT,
    PromotionActionType.DISCOUNT_FIXED,
  ];

  // Check each promotion
  for (const promotion of context.availablePromotions) {
    const applicableRules = getApplicablePromotionRules(
      promotion,
      productId,
      quantity,
      brandId,
      context,
    );

    // Find best rule in this promotion
    for (const rule of applicableRules) {
      if (!PRICE_AFFECTING_ACTIONS.includes(rule.actionType)) {
        continue;
      }

      const { discountAmount } = calculatePromotionRuleDiscount(
        rule,
        basePrice,
        quantity,
        promotion.maxDiscountValue,
      );

      if (!bestResult || discountAmount > bestResult.discountAmount) {
        bestResult = { promotion, rule, discountAmount };
      } else if (
        discountAmount === bestResult.discountAmount &&
        promotion.priority < bestResult.promotion.priority
      ) {
        bestResult = { promotion, rule, discountAmount };
      }
    }
  }

  return bestResult ? { promotion: bestResult.promotion, rule: bestResult.rule } : null;
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
    categoryPath?: string[];
    brandId?: string;
    totalPrice: number;
  }>,
): number => {
  // Filter items that voucher applies to
  const applicableItems = items.filter((item) =>
    voucher.targets.some((target) =>
      isVoucherTargetApplicable(target, item.productId, item.categoryPath?.[0], item.brandId),
    ),
  );

  if (applicableItems.length === 0) return 0;

  // Calculate total of applicable items
  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.totalPrice, 0);

  let discount = 0;

  if (voucher.discountType === DiscountType.DISCOUNT_PERCENT) {
    discount = DISCOUNT_CALCULATION.DISCOUNT_PERCENT(
      applicableTotal,
      Number(voucher.discountValue),
      voucher.maxDiscountValue ? Number(voucher.maxDiscountValue) : undefined,
    );
  } else {
    // DISCOUNT_FIXED
    discount = DISCOUNT_CALCULATION.DISCOUNT_FIXED(applicableTotal, Number(voucher.discountValue));
  }

  return Math.round(discount);
};
