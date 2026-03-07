// =====================
// === ENUMS ===
// =====================

export enum TargetType {
  PRODUCT = "PRODUCT",
  CATEGORY = "CATEGORY",
  BRAND = "BRAND",
  ALL = "ALL",
}

export enum PromotionActionType {
  DISCOUNT_PERCENT = "DISCOUNT_PERCENT",
  DISCOUNT_FIXED = "DISCOUNT_FIXED",
  BUY_X_GET_Y = "BUY_X_GET_Y",
  GIFT_PRODUCT = "GIFT_PRODUCT",
}

// =====================
// === BASIC TYPES ===
// =====================

/**
 * Promotion Rule - what action to perform
 */
export interface PromotionRule {
  id: string;
  actionType: PromotionActionType;
  discountValue?: number;
  buyQuantity?: number;
  getQuantity?: number;
  giftProductVariantId?: string;
}

/**
 * Promotion Target - who/what to apply to
 */
export interface PromotionTarget {
  id: string;
  targetType: TargetType;
  targetId?: string;
}

// =====================
// === PROMOTION CARD (For Listing) ===
// =====================

export interface PromotionCard {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  isExpired: boolean;
  isAvailable: boolean;
  ruleCount: number;
  targetCount: number;
}

// =====================
// === PROMOTION DETAIL ===
// =====================

export interface PromotionDetail {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimit?: number;
  usedCount: number;
  isExpired: boolean;
  isAvailable: boolean;
  createdAt: Date;
  rules: PromotionRule[];
  targets: PromotionTarget[];
}

// =====================
// === PROMOTION APPLICATION RESULT ===
// =====================

export interface PromotionApplicationResult {
  promotionId: string;
  promotionName: string;
  ruleId: string;
  actionType: PromotionActionType;
  discountValue?: number;
  discount?: number; // Calculated discount amount
  giftProductVariantId?: string;
  getQuantity?: number;
}

// =====================
// === RESPONSE TYPES ===
// =====================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PromotionListResponse extends PaginatedResponse<PromotionCard> {}

// =====================
// === RAW DB TYPES ===
// =====================

export interface RawPromotion {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  minOrderValue: any;
  maxDiscountValue: any;
  usageLimit: number | null;
  usedCount: number;
  createdAt: Date;
  rules?: any[];
  targets?: any[];
}

export interface RawPromotionRule {
  id: string;
  promotionId: string;
  actionType: any;
  discountValue: any;
  buyQuantity: number | null;
  getQuantity: number | null;
  giftProductVariantId: string | null;
}

export interface RawPromotionTarget {
  id: string;
  promotionId: string;
  targetType: any;
  targetId: string | null;
}
