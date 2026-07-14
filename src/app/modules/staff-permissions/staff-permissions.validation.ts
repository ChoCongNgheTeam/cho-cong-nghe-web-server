import { z } from "zod";
import { STAFF_ROLES } from "./staff-permissions.types";

export const userIdParamsSchema = z.object({
  userId: z.string().uuid("userId không hợp lệ"),
});

export const updatePermissionsSchema = z
  .object({
    canViewOrders: z.boolean().optional(),
    canCreateOrder: z.boolean().optional(),
    canUpdateOrder: z.boolean().optional(),
    canViewProducts: z.boolean().optional(),
    canUpdateStock: z.boolean().optional(),
    canBlogs: z.boolean().optional(),
    canMedia: z.boolean().optional(),
    canCampaigns: z.boolean().optional(),
    canVouchers: z.boolean().optional(),
    canPromotions: z.boolean().optional(),
    canAiContent: z.boolean().optional(),
    canReviews: z.boolean().optional(),
    canComments: z.boolean().optional(),
    canNotifications: z.boolean().optional(),
    canViewUsers: z.boolean().optional(),
    canAnalytics: z.boolean().optional(),
    canPaymentView: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần ít nhất 1 permission để cập nhật",
  });

export const listStaffPermissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const resetPermissionsSchema = z.object({
  role: z.enum(STAFF_ROLES, {
    message: "Role không hợp lệ. Chọn một trong: SALES, MARKETING, SUPPORT, ACCOUNTING",
  }),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
export type ResetPermissionsInput = z.infer<typeof resetPermissionsSchema>;
export type ListStaffPermissionsQuery = z.infer<typeof listStaffPermissionsQuerySchema>;
