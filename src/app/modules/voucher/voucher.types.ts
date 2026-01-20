// =====================
// === ENUMS ===
// =====================

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum VoucherActionType {
  DISCOUNT = "DISCOUNT",
  FREE_SHIPPING = "FREE_SHIPPING",
  BUY_X_GET_Y = "BUY_X_GET_Y",
}

export enum VoucherTargetType {
  ALL = "all",
  PRODUCT = "product",
  CATEGORY = "category",
  BRAND = "brand",
}

// =====================
// === BASIC TYPES ===
// =====================

export interface VoucherAction {
  id: string;
  actionType: VoucherActionType;
  value?: string;
  buyQuantity?: number;
  getQuantity?: number;
  giftProductVariantId?: string;
}

export interface VoucherTarget {
  id: string;
  targetType: VoucherTargetType;
  targetId?: string;
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
  minOrderValue: number;
  maxUses?: number;
  usesCount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isExpired: boolean;
  isAvailable: boolean; // Còn lượt sử dụng và chưa hết hạn
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
  actions: VoucherAction[];
  targets: VoucherTarget[];
}

// =====================
// === USER VOUCHER (For User) ===
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
  remainingUses: number; // maxUsesPerUser - usedCount
  startDate?: Date;
  endDate?: Date;
  isExpired: boolean;
  canUse: boolean; // Còn lượt sử dụng và chưa hết hạn
}

// =====================
// === VOUCHER VALIDATION RESULT ===
// =====================

export interface VoucherValidationResult {
  isValid: boolean;
  message?: string;
  discount?: number;
  voucher?: VoucherDetail;
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
  description?: string;
  discountType: any;
  discountValue: any;
  minOrderValue: any;
  maxUses?: number;
  maxUsesPerUser?: number;
  usesCount: number;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  actions?: any[];
  targets?: any[];
  voucherUsers?: any[];
}
