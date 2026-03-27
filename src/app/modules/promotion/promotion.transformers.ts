import { PromotionCard, PromotionDetail, RawPromotion, TargetType, PromotionActionType } from "./promotion.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * Check if promotion is expired
 */
export const isPromotionExpired = (endDate: Date | null | undefined): boolean => {
  if (!endDate) return false;
  return new Date() > new Date(endDate);
};

/**
 * Check if promotion has started
 */
export const hasPromotionStarted = (startDate: Date | null | undefined): boolean => {
  if (!startDate) return true;
  return new Date() >= new Date(startDate);
};

type PromotionAvailabilityInput = {
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
};

/**
 * Check if promotion is available
 */
export const isPromotionAvailable = (promotion: PromotionAvailabilityInput): boolean => {
  const expired = isPromotionExpired(promotion.endDate);
  const started = hasPromotionStarted(promotion.startDate);

  const limitReached = promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit;

  return !expired && started && promotion.isActive && !limitReached;
};

export type PromotionCardSource = {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  rules?: any[];
  targets?: any[];
};
/**
 * Transform promotion card data (for listing)
 */
export const transformPromotionCard = (promotion: PromotionCardSource): PromotionCard => {
  return {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description ?? undefined,
    priority: promotion.priority,
    isActive: promotion.isActive,
    startDate: promotion.startDate ?? undefined,
    endDate: promotion.endDate ?? undefined,
    isExpired: isPromotionExpired(promotion.endDate),
    isAvailable: isPromotionAvailable({
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
      usageLimit: null,
      usedCount: 0,
    }),
    ruleCount: promotion.rules?.length ?? 0,
    targetCount: promotion.targets?.length ?? 0,
  };
};

/**
 * Transform promotion detail data
 */
export const transformPromotionDetail = (promotion: RawPromotion): PromotionDetail => {
  return {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description ?? undefined,
    priority: promotion.priority,
    isActive: promotion.isActive,
    startDate: promotion.startDate ?? undefined,
    endDate: promotion.endDate ?? undefined,
    minOrderValue: promotion.minOrderValue ? Number(promotion.minOrderValue) : undefined,
    maxDiscountValue: promotion.maxDiscountValue ? Number(promotion.maxDiscountValue) : undefined,
    usageLimit: promotion.usageLimit ?? undefined,
    usedCount: promotion.usedCount,
    isExpired: isPromotionExpired(promotion.endDate),
    isAvailable: isPromotionAvailable(promotion),
    createdAt: promotion.createdAt,
    rules:
      promotion.rules?.map((rule) => ({
        id: rule.id,
        actionType: rule.actionType as PromotionActionType,
        discountValue: rule.discountValue ? Number(rule.discountValue) : undefined,
        buyQuantity: rule.buyQuantity ?? undefined,
        getQuantity: rule.getQuantity ?? undefined,
        giftProductVariantId: rule.giftProductVariantId ?? undefined,
      })) || [],
    targets:
      promotion.targets?.map((target) => ({
        id: target.id,
        targetType: target.targetType as TargetType,
        targetId: target.targetId ?? undefined,
        targetName: target.targetName ?? undefined,
      })) || [],
  };
};

export const transformPromotionDetailWithExisting = (promotion: RawPromotion, existingTargets?: RawPromotion["targets"]): PromotionDetail => {
  const targetMap = new Map(existingTargets?.map((t) => [t.targetId, t.targetName]));

  return {
    ...transformPromotionDetail(promotion),

    targets:
      promotion.targets?.map((target) => ({
        id: target.id,
        targetType: target.targetType as TargetType,
        targetId: target.targetId ?? undefined,
        targetName: target.targetName ?? targetMap.get(target.targetId) ?? undefined,
      })) || [],
  };
};

/**
 * Calculate discount for promotion rule
 */
export const calculatePromotionDiscount = (actionType: PromotionActionType, discountValue: number, itemPrice: number, quantity: number = 1, maxDiscountValue?: number): number => {
  let discount = 0;

  if (actionType === PromotionActionType.DISCOUNT_PERCENT) {
    discount = Math.round((itemPrice * quantity * discountValue) / 100);
  } else if (actionType === PromotionActionType.DISCOUNT_FIXED) {
    discount = discountValue * quantity;
  }

  // Apply max discount cap if provided
  if (maxDiscountValue && discount > maxDiscountValue) {
    discount = maxDiscountValue;
  }

  return discount;
};
