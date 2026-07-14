// =====================
// === ENUMS ===
// =====================
// Re-export trực tiếp từ Prisma Client thay vì tự khai `enum` riêng.
// Lý do: TS `enum` tạo ra nominal type, không gán được từ union string-literal
// mà Prisma trả về ($Enums.PromotionActionType), gây lỗi "Type '\"DISCOUNT_PERCENT\"'
// is not assignable to type 'PromotionActionType'" ở mọi nơi map dữ liệu từ Prisma.
export { PromotionActionType, TargetType, ApplyType, StackingGroup } from "@prisma/client";
import type { PromotionActionType, TargetType, ApplyType, StackingGroup, Prisma } from "@prisma/client";

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
// Các type dưới đây mô tả đúng shape trả về từ Prisma `select` trong
// promotion.repository.ts (selectPromotionFull), cộng thêm field `targetName`
// được resolve thêm ở findById().
// Dùng type cụ thể (thay vì `any`) để service.ts không cần `as any`.

export interface RawPromotionRuleRow {
  id: string;
  actionType: PromotionActionType;
  discountValue: Prisma.Decimal | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  giftProductVariantId: string | null;
}

export interface RawPromotionTargetRow {
  id: string;
  targetType: TargetType;
  targetId: string | null;
  targetCode?: string | null;
  targetValue?: string | null;
  /** Được resolve thêm ở repository.findById() (tên brand/category/product) */
  targetName?: string;
}

export interface RawPromotion {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  minOrderValue: Prisma.Decimal | null;
  maxDiscountValue: Prisma.Decimal | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: Date;
  // Có mặt trong select (selectPromotionFull) nhưng KHÔNG lộ ra ngoài qua PromotionDetail —
  // transformPromotionDetail() không map các field này vào DTO trả về client.
  deletedAt?: Date | null;
  deletedBy?: string | null;
  applyType?: ApplyType;
  stackingGroup?: StackingGroup;
  stopProcessing?: boolean;
  rules?: RawPromotionRuleRow[];
  targets?: RawPromotionTargetRow[];
}

/** @deprecated Dùng RawPromotionRuleRow — giữ lại để tránh phá cross-module import cũ */
export type RawPromotionRule = RawPromotionRuleRow & { promotionId: string };

/** @deprecated Dùng RawPromotionTargetRow — giữ lại để tránh phá cross-module import cũ */
export type RawPromotionTarget = RawPromotionTargetRow & { promotionId: string };
