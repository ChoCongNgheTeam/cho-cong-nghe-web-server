import {
  PromotionData,
  VoucherData,
  PricingContext,
  PromotionTargetData,
  PromotionRuleData,
  VoucherTargetData,
  DisplayPromotion,
  AppliedDiscount,
  StackingGroup,
  StackedPromotionResult,
} from "./pricing.types";
import { TargetType, PromotionActionType, DiscountType } from "@prisma/client";
import { DISCOUNT_CALCULATION } from "./pricing.constants";
import { formatPromotionDescription } from "./pricing.helpers";

// ─────────────────────────────────────────────────────────────────────────────
// TARGET MATCHING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * isPromotionTargetApplicable
 *
 * Priority hierarchy (cao → thấp):
 *   PRODUCT (100) > FLASH_SALE/ALL (50) > ATTRIBUTE (30) > CATEGORY (20) > BRAND (10) > GLOBAL/ALL (5)
 *
 * Promotion priority được set ở promotion.priority, không ở đây.
 * Hàm này chỉ check: target có match variant này không?
 */
export const isPromotionTargetApplicable = (target: PromotionTargetData, productId: string, brandId?: string, context?: PricingContext): boolean => {
  switch (target.targetType) {
    case TargetType.PRODUCT:
      // targetId = product UUID
      return target.targetId === productId;

    case TargetType.CATEGORY:
      // targetId = category UUID — match bất kỳ node nào trong categoryPath (bao gồm ancestors)
      return !!target.targetId && (context?.categoryPath?.includes(target.targetId) ?? false);

    case TargetType.BRAND:
      // targetId = brand UUID
      return !!brandId && target.targetId === brandId;

    case TargetType.ATTRIBUTE: {
      // targetCode = attribute code (e.g. "storage")
      // targetValue = attribute value (e.g. "128GB") — case-insensitive match
      if (!target.targetCode || !target.targetValue) return false;
      const attrs = context?.variantAttributes ?? [];
      return attrs.some((a) => a.code.toLowerCase() === target.targetCode!.toLowerCase() && a.value.toLowerCase() === target.targetValue!.toLowerCase());
    }

    case TargetType.ALL:
      return true;

    default:
      return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROMOTION VALIDITY
// ─────────────────────────────────────────────────────────────────────────────

export const isPromotionValid = (promotion: PromotionData, context?: PricingContext): boolean => {
  if (!promotion.isActive) return false;

  if (context) {
    const now = context.currentDate;
    if (promotion.startDate && now < promotion.startDate) return false;
    if (promotion.endDate && now > promotion.endDate) return false;
  }

  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) return false;

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLICABLE RULES (with quantity check — for cart/apply)
// ─────────────────────────────────────────────────────────────────────────────

export const getApplicablePromotionRules = (promotion: PromotionData, productId: string, quantity: number, brandId?: string, context?: PricingContext): PromotionRuleData[] => {
  if (!isPromotionValid(promotion, context)) return [];

  const hasApplicableTarget = promotion.targets.some((t) => isPromotionTargetApplicable(t, productId, brandId, context));
  if (!hasApplicableTarget) return [];

  return promotion.rules.filter((rule) => {
    if (rule.buyQuantity && quantity < rule.buyQuantity) return false;
    return true;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ALL AVAILABLE PROMOTIONS (no quantity check — for product detail display)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllAvailablePromotions = (productId: string, brandId?: string, context?: PricingContext): DisplayPromotion[] => {
  if (!context?.availablePromotions) return [];

  const promotions: DisplayPromotion[] = [];
  const addedKeys = new Set<string>();

  for (const promotion of context.availablePromotions) {
    if (!isPromotionValid(promotion, context)) continue;

    const hasApplicableTarget = promotion.targets.some((t) => isPromotionTargetApplicable(t, productId, brandId, context));
    if (!hasApplicableTarget) continue;

    for (const rule of promotion.rules) {
      const key = `${promotion.id}-${rule.actionType}`;
      if (!addedKeys.has(key)) {
        promotions.push({
          id: promotion.id,
          name: promotion.name,
          description: promotion.description,
          actionType: rule.actionType,
          buyQuantity: rule.buyQuantity,
          getQuantity: rule.getQuantity,
          discountValue: rule.discountValue ? Number(rule.discountValue) : undefined,
        });
        addedKeys.add(key);
      }
    }
  }

  return promotions;
};

// ─────────────────────────────────────────────────────────────────────────────
// DISCOUNT CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

export const calculatePromotionRuleDiscount = (
  rule: PromotionRuleData,
  basePrice: number,
  quantity: number,
  maxDiscountValue?: number | null,
): { discountAmount: number; applicableQuantity: number } => {
  let discountAmount = 0;

  switch (rule.actionType) {
    case PromotionActionType.DISCOUNT_PERCENT:
      if (rule.discountValue) {
        discountAmount = DISCOUNT_CALCULATION.DISCOUNT_PERCENT(basePrice * quantity, Number(rule.discountValue), maxDiscountValue ? Number(maxDiscountValue) : undefined);
      }
      break;

    case PromotionActionType.DISCOUNT_FIXED:
      if (rule.discountValue) {
        discountAmount = DISCOUNT_CALCULATION.DISCOUNT_FIXED(basePrice * quantity, Number(rule.discountValue));
      }
      break;

    case PromotionActionType.BUY_X_GET_Y:
    case PromotionActionType.GIFT_PRODUCT:
      discountAmount = 0;
      break;

    default:
      break;
  }

  return { discountAmount: Math.round(discountAmount), applicableQuantity: quantity };
};

// ─────────────────────────────────────────────────────────────────────────────
// BEST PROMOTION SELECTOR
//
// Luật chọn:
//   1. Lấy promotion có discountAmount cao nhất
//   2. Nếu bằng nhau → promotion có priority NUMBER CAO HƠN thắng
//      (PRODUCT=100 > FLASH_SALE=50 > ATTRIBUTE=30 > CATEGORY=20 > BRAND=10 > GLOBAL=5)
//
// Chỉ 1 promotion được áp dụng per product (MAX_PROMOTIONS_PER_PRODUCT = 1)
// ─────────────────────────────────────────────────────────────────────────────

// const PRICE_AFFECTING_ACTIONS: PromotionActionType[] = [PromotionActionType.DISCOUNT_PERCENT, PromotionActionType.DISCOUNT_FIXED];

// export const getBestPromotionRule = (
//   productId: string,
//   basePrice: number,
//   quantity: number,
//   categoryPath?: string[],
//   brandId?: string,
//   context?: PricingContext,
// ): { promotion: PromotionData; rule: PromotionRuleData } | null => {
//   if (!context?.availablePromotions) return null;

//   let best: {
//     promotion: PromotionData;
//     rule: PromotionRuleData;
//     discountAmount: number;
//   } | null = null;

//   for (const promotion of context.availablePromotions) {
//     const applicableRules = getApplicablePromotionRules(promotion, productId, quantity, brandId, context);

//     for (const rule of applicableRules) {
//       if (!PRICE_AFFECTING_ACTIONS.includes(rule.actionType)) continue;

//       const { discountAmount } = calculatePromotionRuleDiscount(rule, basePrice, quantity, promotion.maxDiscountValue);

//       if (!best) {
//         best = { promotion, rule, discountAmount };
//         continue;
//       }

//       // Rule 1: higher discount wins
//       if (discountAmount > best.discountAmount) {
//         best = { promotion, rule, discountAmount };
//         continue;
//       }

//       // Rule 2: tie-break by priority (higher number = more specific = wins)
//       if (discountAmount === best.discountAmount && promotion.priority > best.promotion.priority) {
//         best = { promotion, rule, discountAmount };
//       }
//     }
//   }

//   return best ? { promotion: best.promotion, rule: best.rule } : null;
// };

// ─────────────────────────────────────────────────────────────────────────────
// STACKED PROMOTIONS ENGINE
// Thay thế getBestPromotionRule — hỗ trợ stack nhiều promotion theo rules
// ─────────────────────────────────────────────────────────────────────────────

export const getStackedPromotions = (productId: string, basePrice: number, quantity: number, categoryPath?: string[], brandId?: string, context?: PricingContext): StackedPromotionResult => {
  if (!context?.availablePromotions) {
    return {
      appliedPromotions: [],
      availablePromotions: [],
      finalPrice: basePrice,
      totalDiscount: 0,
      discountBreakdown: {},
      giftProducts: [],
    };
  }

  // 1. Lọc promotions applicable + sort priority DESC
  const candidates: Array<{
    promotion: PromotionData;
    rule: PromotionRuleData;
  }> = [];

  for (const promotion of context.availablePromotions) {
    const applicableRules = getApplicablePromotionRules(promotion, productId, quantity, brandId, context);
    if (applicableRules.length === 0) continue;

    // Lấy rule price-affecting đầu tiên (PERCENT/FIXED) để compete
    // Gift/BuyXGetY xử lý riêng bên dưới
    const priceRule = applicableRules.find((r) => PRICE_AFFECTING_ACTIONS.includes(r.actionType));
    if (priceRule) {
      candidates.push({ promotion, rule: priceRule });
    }

    // Gift rules — collect riêng, không compete với price rules
    const giftRules = applicableRules.filter((r) => r.actionType === PromotionActionType.GIFT_PRODUCT);
    for (const gr of giftRules) {
      candidates.push({ promotion, rule: gr });
    }
  }

  // Sort priority DESC
  candidates.sort((a, b) => b.promotion.priority - a.promotion.priority);

  // 2. Build availablePromotions (tất cả applicable — cho UI)
  const availablePromotions: DisplayPromotion[] = [];
  const seenAvailable = new Set<string>();
  let stoppedForAvailable = false;

  for (const { promotion, rule } of candidates) {
    if (stoppedForAvailable) break;

    if (!seenAvailable.has(promotion.id)) {
      availablePromotions.push({
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        actionType: rule.actionType,
        buyQuantity: rule.buyQuantity,
        getQuantity: rule.getQuantity,
        discountValue: rule.discountValue ? Number(rule.discountValue) : undefined,
      });
      seenAvailable.add(promotion.id);
    }

    // Nếu EXCLUSIVE → chỉ show promotion đó, dừng
    if (promotion.applyType === "EXCLUSIVE") {
      stoppedForAvailable = true;
    }
  }

  // 3. Apply stacking logic
  let currentPrice = basePrice;
  const appliedPromotions: AppliedDiscount[] = [];
  const discountBreakdown: Partial<Record<StackingGroup, number>> = {};
  const usedGroups = new Set<StackingGroup>();
  const giftProducts: { variantId: string; quantity: number }[] = [];
  let stopped = false;

  for (const { promotion, rule } of candidates) {
    if (stopped) break;

    // Gift rules — luôn apply, không tính vào stacking group
    if (rule.actionType === PromotionActionType.GIFT_PRODUCT) {
      if (rule.giftProductVariantId && rule.getQuantity) {
        const sets = rule.buyQuantity ? Math.floor(quantity / rule.buyQuantity) : 1;
        const giftQty = sets * rule.getQuantity;
        if (giftQty > 0) {
          giftProducts.push({
            variantId: rule.giftProductVariantId,
            quantity: giftQty,
          });
          appliedPromotions.push({
            type: "PROMOTION",
            id: promotion.id,
            name: promotion.name,
            discountAmount: 0,
            description: formatPromotionDescription(rule),
            actionType: rule.actionType,
            stackingGroup: promotion.stackingGroup,
          });
        }
      }
      continue;
    }

    // EXCLUSIVE — apply và dừng hẳn
    if (promotion.applyType === "EXCLUSIVE") {
      const { discountAmount } = calculatePromotionRuleDiscount(rule, currentPrice, quantity, promotion.maxDiscountValue);
      if (discountAmount > 0) {
        currentPrice = currentPrice - discountAmount / quantity;
        appliedPromotions.push({
          type: "PROMOTION",
          id: promotion.id,
          name: promotion.name,
          discountAmount,
          description: formatPromotionDescription(rule),
          actionType: rule.actionType,
          stackingGroup: promotion.stackingGroup,
        });
        discountBreakdown[promotion.stackingGroup] = (discountBreakdown[promotion.stackingGroup] ?? 0) + discountAmount;
      }
      stopped = true;
      break;
    }

    // STACKABLE — check group đã dùng chưa
    if (usedGroups.has(promotion.stackingGroup)) continue;

    const { discountAmount } = calculatePromotionRuleDiscount(rule, currentPrice, quantity, promotion.maxDiscountValue);
    if (discountAmount <= 0) continue;

    currentPrice = currentPrice - discountAmount / quantity;
    usedGroups.add(promotion.stackingGroup);

    appliedPromotions.push({
      type: "PROMOTION",
      id: promotion.id,
      name: promotion.name,
      discountAmount,
      description: formatPromotionDescription(rule),
      actionType: rule.actionType,
      stackingGroup: promotion.stackingGroup,
    });

    discountBreakdown[promotion.stackingGroup] = (discountBreakdown[promotion.stackingGroup] ?? 0) + discountAmount;

    if (promotion.stopProcessing) {
      stopped = true;
      break;
    }
  }

  const totalDiscount = basePrice * quantity - currentPrice * quantity;

  return {
    appliedPromotions,
    availablePromotions,
    finalPrice: currentPrice,
    totalDiscount: Math.round(totalDiscount),
    discountBreakdown,
    giftProducts,
  };
};

const PRICE_AFFECTING_ACTIONS: PromotionActionType[] = [PromotionActionType.DISCOUNT_PERCENT, PromotionActionType.DISCOUNT_FIXED];

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHER
// ─────────────────────────────────────────────────────────────────────────────

export const isVoucherTargetApplicable = (target: VoucherTargetData, productId: string, categoryId?: string, brandId?: string): boolean => {
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

export const isVoucherValid = (voucher: VoucherData, cartTotal: number, context?: PricingContext): { valid: boolean; error?: string } => {
  if (!voucher.isActive) return { valid: false, error: "Voucher không còn hoạt động" };

  const now = context?.currentDate ?? new Date();

  if (voucher.startDate && now < voucher.startDate) return { valid: false, error: "Voucher chưa có hiệu lực" };
  if (voucher.endDate && now > voucher.endDate) return { valid: false, error: "Voucher đã hết hạn" };

  if (cartTotal < voucher.minOrderValue) {
    return { valid: false, error: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ` };
  }

  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    return { valid: false, error: "Voucher đã hết lượt sử dụng" };
  }

  if (voucher.maxUsesPerUser && voucher.userUsedCount !== undefined && voucher.userUsedCount >= voucher.maxUsesPerUser) {
    return { valid: false, error: "Bạn đã dùng hết lượt sử dụng voucher này" };
  }

  if (voucher.userMaxUses !== undefined && voucher.userUsedCount !== undefined && voucher.userUsedCount >= voucher.userMaxUses) {
    return { valid: false, error: "Bạn đã dùng hết lượt sử dụng voucher này" };
  }

  return { valid: true };
};

export const calculateVoucherDiscount = (voucher: VoucherData, items: Array<{ productId: string; categoryPath?: string[]; brandId?: string; totalPrice: number }>): number => {
  const applicableItems = items.filter((item) => voucher.targets.some((t) => isVoucherTargetApplicable(t, item.productId, item.categoryPath?.[0], item.brandId)));

  if (applicableItems.length === 0) return 0;

  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.totalPrice, 0);

  let discount = 0;
  if (voucher.discountType === DiscountType.DISCOUNT_PERCENT) {
    discount = DISCOUNT_CALCULATION.DISCOUNT_PERCENT(applicableTotal, Number(voucher.discountValue), voucher.maxDiscountValue ? Number(voucher.maxDiscountValue) : undefined);
  } else {
    discount = DISCOUNT_CALCULATION.DISCOUNT_FIXED(applicableTotal, Number(voucher.discountValue));
  }

  return Math.round(discount);
};
