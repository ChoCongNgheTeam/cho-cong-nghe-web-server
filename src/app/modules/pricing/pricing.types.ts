import { DiscountType, TargetType, PromotionActionType } from "@prisma/client";

// ===== INPUT TYPES =====

export interface PricingProductInput {
  productId: string;
  variantId: string;
  basePrice: number;
  quantity: number;
  brandId?: string;
  categoryPath?: string[];
}

export interface PricingCartInput {
  items: PricingProductInput[];
  voucherCode?: string;
  userId?: string;
}

// ===== PROMOTION DATA =====

export interface PromotionTargetData {
  id: string;
  targetType: TargetType;
  targetId: string | null;
  buyQuantity: number | null;
  actionType: PromotionActionType;
  discountValue: number | null;
  giftProductVariantId: string | null;
  getQuantity: number | null;
}

export interface PromotionData {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  targets: PromotionTargetData[];
}

// ===== VOUCHER DATA =====

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
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usesCount: number;
  startDate: Date | null;
  endDate: Date | null;
  priority: number;
  isActive: boolean;

  // Relations
  targets: VoucherTargetData[];

  // User-specific data
  userUsedCount?: number;
  userMaxUses?: number;
}

// ===== OUTPUT TYPES =====

export interface AppliedDiscount {
  type: "PROMOTION" | "VOUCHER";
  id: string;
  name: string;
  discountAmount: number;
  description: string;
  actionType?: PromotionActionType | DiscountType;
}

export interface PricedProduct {
  productId: string;
  variantId: string;
  quantity: number;

  // Prices
  basePrice: number;
  finalPrice: number;
  totalBasePrice: number;
  totalFinalPrice: number;
  totalDiscount: number;

  // Applied promotions
  appliedPromotions: AppliedDiscount[];

  // Gifts (if any)
  giftProducts?: {
    variantId: string;
    quantity: number;
  }[];

  // Metadata
  hasPromotion: boolean;
  discountPercentage: number;
}

export interface PricingResult {
  items: PricedProduct[];

  // Summary
  subtotal: number;
  totalPromotionDiscount: number;
  totalVoucherDiscount: number;
  totalDiscount: number;
  finalTotal: number;

  // Applied
  appliedVoucher?: AppliedDiscount;

  // Gifts
  totalGifts: {
    variantId: string;
    quantity: number;
  }[];

  // Validation
  isValid: boolean;
  errors: string[];
}

// ===== PRICING CONTEXT =====

export interface PricingContext {
  userId?: string;
  currentDate: Date;
  availablePromotions: PromotionData[];
  voucher?: VoucherData;

  categoryPath?: string[];
  brandId?: string;
}

export interface PricingContextInput {
  brandId?: string;
  categoryId?: string;
  categoryPath?: string[];
}
