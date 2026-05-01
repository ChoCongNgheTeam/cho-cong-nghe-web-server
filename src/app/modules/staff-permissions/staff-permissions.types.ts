import { Prisma } from "@prisma/client";

// ── Select ─────────────────────────────────────────────────────────────────

export const staffPermissionsSelect = {
  userId: true,
  // Đơn hàng
  canViewOrders: true,
  canCreateOrder: true,
  canUpdateOrder: true,
  // Sản phẩm / kho
  canViewProducts: true,
  canUpdateStock: true,
  // Marketing
  canBlogs: true,
  canMedia: true,
  canCampaigns: true,
  canVouchers: true,
  canPromotions: true,
  canAiContent: true,
  // CSKH
  canReviews: true,
  canComments: true,
  canNotifications: true,
  canViewUsers: true,
  // Báo cáo
  canAnalytics: true,
  canPaymentView: true,

  updatedAt: true,
} satisfies Prisma.staff_permissionsSelect;

export type StaffPermissionsData = Prisma.staff_permissionsGetPayload<{
  select: typeof staffPermissionsSelect;
}>;

export type PermissionKey = keyof Omit<StaffPermissionsData, "userId" | "updatedAt">;

// ── Default presets theo role ──────────────────────────────────────────────

type PermissionPreset = Omit<StaffPermissionsData, "userId" | "updatedAt">;

export const DEFAULT_PERMISSIONS: Record<string, PermissionPreset> = {
  SALES: {
    canViewOrders: true,
    canCreateOrder: true,
    canUpdateOrder: true,
    canViewProducts: true,
    canUpdateStock: false,
    canBlogs: false,
    canMedia: false,
    canCampaigns: false,
    canVouchers: false,
    canPromotions: false,
    canAiContent: false,
    canReviews: false,
    canComments: false,
    canNotifications: false,
    canViewUsers: false,
    canAnalytics: false,
    canPaymentView: false,
  },
  MARKETING: {
    canViewOrders: false,
    canCreateOrder: false,
    canUpdateOrder: false,
    canViewProducts: true,
    canUpdateStock: false,
    canBlogs: true,
    canMedia: true,
    canCampaigns: true,
    canVouchers: true,
    canPromotions: true,
    canAiContent: true,
    canReviews: true,
    canComments: true,
    canNotifications: true,
    canViewUsers: false,
    canAnalytics: false,
    canPaymentView: false,
  },
  SUPPORT: {
    canViewOrders: true,
    canCreateOrder: false,
    canUpdateOrder: true,
    canViewProducts: false,
    canUpdateStock: false,
    canBlogs: false,
    canMedia: false,
    canCampaigns: false,
    canVouchers: false,
    canPromotions: false,
    canAiContent: false,
    canReviews: true,
    canComments: true,
    canNotifications: false,
    canViewUsers: true,
    canAnalytics: false,
    canPaymentView: false,
  },
  ACCOUNTING: {
    canViewOrders: true,
    canCreateOrder: false,
    canUpdateOrder: false,
    canViewProducts: true,
    canUpdateStock: false,
    canBlogs: false,
    canMedia: false,
    canCampaigns: false,
    canVouchers: false,
    canPromotions: false,
    canAiContent: false,
    canReviews: false,
    canComments: false,
    canNotifications: false,
    canViewUsers: false,
    canAnalytics: true,
    canPaymentView: true,
  },
};

export const STAFF_ROLES = ["SALES", "MARKETING", "SUPPORT", "ACCOUNTING"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
