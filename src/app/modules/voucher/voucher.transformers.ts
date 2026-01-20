import {
  VoucherCard,
  VoucherDetail,
  UserVoucher,
  RawVoucher,
  DiscountType,
  VoucherActionType,
  VoucherTargetType,
} from "./voucher.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * Check if voucher is expired
 */
export const isVoucherExpired = (endDate?: Date): boolean => {
  if (!endDate) return false;
  return new Date() > new Date(endDate);
};

/**
 * Check if voucher has started
 */
export const hasVoucherStarted = (startDate?: Date): boolean => {
  if (!startDate) return true;
  return new Date() >= new Date(startDate);
};

/**
 * Check if voucher is available (not expired, started, has uses left)
 */
export const isVoucherAvailable = (voucher: RawVoucher): boolean => {
  const expired = isVoucherExpired(voucher.endDate);
  const started = hasVoucherStarted(voucher.startDate);
  const hasUsesLeft = !voucher.maxUses || voucher.usesCount < voucher.maxUses;

  return !expired && started && hasUsesLeft && voucher.isActive;
};

/**
 * Transform voucher card data (for listing)
 */
export const transformVoucherCard = (voucher: RawVoucher): VoucherCard => {
  return {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType as DiscountType,
    discountValue: Number(voucher.discountValue),
    minOrderValue: Number(voucher.minOrderValue),
    maxUses: voucher.maxUses ?? undefined,
    usesCount: voucher.usesCount,
    startDate: voucher.startDate ?? undefined,
    endDate: voucher.endDate ?? undefined,
    isActive: voucher.isActive,
    isExpired: isVoucherExpired(voucher.endDate),
    isAvailable: isVoucherAvailable(voucher),
  };
};

/**
 * Transform voucher detail data
 */
export const transformVoucherDetail = (voucher: RawVoucher): VoucherDetail => {
  return {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType as DiscountType,
    discountValue: Number(voucher.discountValue),
    minOrderValue: Number(voucher.minOrderValue),
    maxUses: voucher.maxUses ?? undefined,
    maxUsesPerUser: voucher.maxUsesPerUser ?? undefined,
    usesCount: voucher.usesCount,
    startDate: voucher.startDate ?? undefined,
    endDate: voucher.endDate ?? undefined,
    priority: voucher.priority,
    isActive: voucher.isActive,
    isExpired: isVoucherExpired(voucher.endDate),
    isAvailable: isVoucherAvailable(voucher),
    createdAt: voucher.createdAt,
    updatedAt: voucher.updatedAt,
    actions:
      voucher.actions?.map((action) => ({
        id: action.id,
        actionType: action.actionType as VoucherActionType,
        value: action.value ?? undefined,
        buyQuantity: action.buyQuantity ?? undefined,
        getQuantity: action.getQuantity ?? undefined,
        giftProductVariantId: action.giftProductVariantId ?? undefined,
      })) || [],
    targets:
      voucher.targets?.map((target) => ({
        id: target.id,
        targetType: target.targetType as VoucherTargetType,
        targetId: target.targetId ?? undefined,
      })) || [],
  };
};

/**
 * Transform user voucher data
 */
export const transformUserVoucher = (voucher: RawVoucher, userVoucherData?: any): UserVoucher => {
  const usedCount = userVoucherData?.usedCount ?? 0;
  const maxUsesPerUser = voucher.maxUsesPerUser ?? Infinity;
  const remainingUses = maxUsesPerUser === Infinity ? Infinity : maxUsesPerUser - usedCount;

  return {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType as DiscountType,
    discountValue: Number(voucher.discountValue),
    minOrderValue: Number(voucher.minOrderValue),
    maxUsesPerUser: voucher.maxUsesPerUser ?? undefined,
    usedCount,
    remainingUses: remainingUses === Infinity ? -1 : remainingUses, // -1 means unlimited
    startDate: voucher.startDate ?? undefined,
    endDate: voucher.endDate ?? undefined,
    isExpired: isVoucherExpired(voucher.endDate),
    canUse: isVoucherAvailable(voucher) && remainingUses > 0,
  };
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (
  discountType: DiscountType,
  discountValue: number,
  orderTotal: number,
): number => {
  if (discountType === "PERCENTAGE") {
    return Math.round((orderTotal * discountValue) / 100);
  }
  // FIXED
  return Math.min(discountValue, orderTotal);
};
