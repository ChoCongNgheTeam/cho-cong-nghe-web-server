import {
  PromotionCard,
  PromotionDetail,
  RawPromotion,
  TargetType,
  PromotionActionType,
} from "./promotion.types";

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

/**
 * Check if promotion is available
 */
export const isPromotionAvailable = (promotion: RawPromotion): boolean => {
  const expired = isPromotionExpired(promotion.endDate);
  const started = hasPromotionStarted(promotion.startDate);

  return !expired && started && promotion.isActive;
};

/**
 * Transform promotion card data (for listing)
 */
export const transformPromotionCard = (promotion: RawPromotion): PromotionCard => {
  return {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description ?? undefined,
    priority: promotion.priority,
    isActive: promotion.isActive,
    startDate: promotion.startDate ?? undefined,
    endDate: promotion.endDate ?? undefined,
    isExpired: isPromotionExpired(promotion.endDate),
    isAvailable: isPromotionAvailable(promotion),
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
    isExpired: isPromotionExpired(promotion.endDate),
    isAvailable: isPromotionAvailable(promotion),
    createdAt: promotion.createdAt,
    targets:
      promotion.targets?.map((target) => ({
        id: target.id,
        targetType: target.targetType as TargetType,
        targetId: target.targetId ?? undefined,
        buyQuantity: target.buyQuantity ?? undefined,
        actionType: target.actionType as PromotionActionType,
        discountValue: target.discountValue ? Number(target.discountValue) : undefined,
        giftProductVariantId: target.giftProductVariantId ?? undefined,
        getQuantity: target.getQuantity ?? undefined,
      })) || [],
  };
};

/**
 * Calculate discount for promotion target
 */
export const calculatePromotionDiscount = (
  actionType: PromotionActionType,
  discountValue: number,
  itemPrice: number,
  quantity: number = 1,
): number => {
  if (actionType === PromotionActionType.DISCOUNT_PERCENT) {
    return Math.round((itemPrice * quantity * discountValue) / 100);
  }

  if (actionType === PromotionActionType.DISCOUNT_FIXED) {
    return discountValue * quantity;
  }

  return 0;
};
