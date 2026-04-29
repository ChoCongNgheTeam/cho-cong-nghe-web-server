import { z } from "zod";

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
  .strict();

export const resetPermissionsSchema = z.object({
  role: z.enum(["SALES", "MARKETING", "SUPPORT", "ACCOUNTING"], {
    errorMap: () => ({ message: "Role không hợp lệ. Chọn một trong: SALES, MARKETING, SUPPORT, ACCOUNTING" }),
  }),
});

export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
export type ResetPermissionsInput = z.infer<typeof resetPermissionsSchema>;
