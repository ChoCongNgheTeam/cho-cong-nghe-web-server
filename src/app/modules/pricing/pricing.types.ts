import { DiscountType, TargetType, PromotionActionType } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// INPUT TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attribute của 1 variant — dùng để match ATTRIBUTE promotion target.
 * Map từ: variantAttributes[].attributeOption.attribute.code + .value
 */
export interface VariantAttributeInput {
  code: string; // e.g. "storage", "color", "ram"
  value: string; // e.g. "128GB", "black", "8GB"
}

export interface PricingProductInput {
  productId: string;
  variantId: string;
  basePrice: number;
  quantity: number;
  brandId?: string;
  categoryPath?: string[];
  /** Attributes của variant — cần để match ATTRIBUTE target */
  variantAttributes?: VariantAttributeInput[];
}

export interface PricingContext {
  userId?: string;
  currentDate: Date;
  availablePromotions: PromotionData[];
  voucher?: VoucherData;

  categoryPath?: string[];
  brandId?: string;
  /** Forward từ PricingProductInput */
  variantAttributes?: VariantAttributeInput[];
}

export interface PricingContextInput {
  brandId?: string;
  categoryPath?: string[];
  variantAttributes?: VariantAttributeInput[];
}

export interface PricingCartInput {
  items: PricingProductInput[];
  voucherCode?: string;
  userId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMOTION DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface PromotionRuleData {
  id: string;
  promotionId: string;
  actionType: PromotionActionType;
  discountValue: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  giftProductVariantId: string | null;
}

/**
 * Promotion Target — thêm targetCode + targetValue cho ATTRIBUTE type
 */
export interface PromotionTargetData {
  id: string;
  promotionId: string;
  targetType: TargetType;
  targetId: string | null;
  /** ATTRIBUTE: attribute code, e.g. "storage" */
  targetCode: string | null;
  /** ATTRIBUTE: attribute value, e.g. "128GB" */
  targetValue: string | null;
}

export interface PromotionData {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  minOrderValue: number | null;
  maxDiscountValue: number | null;
  usageLimit: number | null;
  usedCount: number;

  rules: PromotionRuleData[];
  targets: PromotionTargetData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHER DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface VoucherTargetData {
  id: string;
  targetType: TargetType;
  targetId: string | null;
}

export interface VoucherData {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue: number | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usesCount: number;
  startDate: Date | null;
  endDate: Date | null;
  priority: number;
  isActive: boolean;

  targets: VoucherTargetData[];

  userUsedCount?: number;
  userMaxUses?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AppliedDiscount {
  type: "PROMOTION" | "VOUCHER";
  id: string;
  name: string;
  discountAmount: number;
  description: string;
  actionType?: PromotionActionType | DiscountType;
}

export interface DisplayPromotion {
  id: string;
  name: string;
  description: string | null;
  actionType: PromotionActionType | DiscountType;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  discountValue?: number;
  isApplicable?: boolean;
}

export interface PricedProduct {
  productId: string;
  variantId: string;
  quantity: number;

  basePrice: number;
  finalPrice: number;
  totalBasePrice: number;
  totalFinalPrice: number;
  totalDiscount: number;

  appliedPromotions: AppliedDiscount[];
  availablePromotions: DisplayPromotion[];

  giftProducts?: { variantId: string; quantity: number }[];

  hasPromotion: boolean;
  discountPercentage: number;
}

export interface PricingResult {
  items: PricedProduct[];

  subtotal: number;
  totalPromotionDiscount: number;
  totalVoucherDiscount: number;
  totalDiscount: number;
  finalTotal: number;

  appliedVoucher?: AppliedDiscount;

  totalGifts: { variantId: string; quantity: number }[];

  isValid: boolean;
  errors: string[];
}
