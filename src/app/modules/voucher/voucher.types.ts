// =====================
// === ENUMS ===
// =====================

import { Decimal } from "@prisma/client/runtime/library";
import { DiscountType } from "@prisma/client";

export enum TargetType {
  PRODUCT = "PRODUCT",
  CATEGORY = "CATEGORY",
  BRAND = "BRAND",
  ALL = "ALL",
}

// =====================
// === BASIC TYPES ===
// =====================

export interface VoucherTarget {
  id: string;
  targetType: TargetType;
  targetId?: string;
  targetName?: string;
}

export interface VoucherUser {
  id: string;
  userId: string;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
}

export interface VoucherUsage {
  id: string;
  userId: string;
  orderId: string;
  usedAt: Date;
}

// =====================
// === VOUCHER CARD (For Listing) ===
// =====================

export interface VoucherCard {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue?: number;
  minOrderValue: number;
  maxUses?: number;
  usesCount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isExpired: boolean;
  isAvailable: boolean;
}

// =====================
// === VOUCHER DETAIL ===
// =====================

export interface VoucherDetail {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue?: number;
  minOrderValue: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  usesCount: number;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  isExpired: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  targets: VoucherTarget[];
}

// =====================
// === USER VOUCHER ===
// =====================

export interface UserVoucher {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUsesPerUser?: number;
  usedCount: number;
  remainingUses: number;
  startDate?: Date;
  endDate?: Date;
  isExpired: boolean;
  canUse: boolean;
}

// =====================
// === VOUCHER VALIDATION RESULT ===
// =====================

export interface VoucherValidationResult {
  isValid: boolean;
  message?: string;
  discount?: number;
  voucher?: VoucherDetail;

  eligibleTotal?: number;
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

export interface VoucherListResponse extends PaginatedResponse<VoucherCard> {}
export interface UserVoucherListResponse extends PaginatedResponse<UserVoucher> {}

// =====================
// === RAW DB TYPES ===
// =====================

export interface RawVoucher {
  id: string;
  code: string;
  description: string | null;
  discountType: any;
  discountValue: any;
  maxDiscountValue: any;
  minOrderValue: any;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usesCount: number;
  startDate: Date | null;
  endDate: Date | null;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  targets?: any[];
  voucherUsers?: any[];
}

export interface VoucherListItem {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: Decimal;
  minOrderValue: Decimal;
  maxDiscountValue: Decimal | null;
  maxUses: number | null;
  usesCount: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface VoucherAvailabilityInput {
  startDate: Date | null;
  endDate: Date | null;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
}
