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
  FREE_GIFT = "GIFT_PRODUCT",
}

// =====================
// === BASIC TYPES ===
// =====================

export interface PromotionTarget {
  id: string;
  targetType: TargetType;
  targetId?: string;
  buyQuantity?: number;
  actionType: PromotionActionType;
  discountValue?: number;
  giftProductVariantId?: string;
  getQuantity?: number;
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
  isExpired: boolean;
  isAvailable: boolean;
  createdAt: Date;
  targets: PromotionTarget[];
}

// =====================
// === PROMOTION APPLICATION RESULT ===
// =====================

export interface PromotionApplicationResult {
  promotionId: string;
  promotionName: string;
  targetId: string;
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
  createdAt: Date;
  targets?: any[];
}

export interface RawPromotionTarget {
  id: string;
  targetType: any;
  targetId: string | null;
  buyQuantity: number | null;
  actionType: any;
  discountValue: any;
  giftProductVariantId: string | null;
  getQuantity: number | null;
}
