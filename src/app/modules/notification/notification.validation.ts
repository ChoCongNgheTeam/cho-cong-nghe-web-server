import { z } from "zod";

// FCM TOKEN
export const saveFcmTokenSchema = z.object({
  token: z.string().trim().min(1, "FCM token không được để trống"),
  device: z.enum(["web", "ios", "android"]).optional(),
});
export type SaveFcmTokenInput = z.infer<typeof saveFcmTokenSchema>;

export const deleteFcmTokenSchema = z.object({
  token: z.string().trim().min(1, "FCM token không được để trống"),
});
export type DeleteFcmTokenInput = z.infer<typeof deleteFcmTokenSchema>;

// CAMPAIGN
export const sendCampaignSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống"),
  body: z.string().trim().min(1, "Nội dung không được để trống"),
  data: z.record(z.string(), z.any()).optional(),
  targetAll: z.boolean().optional().default(false),
  userIds: z.array(z.string().uuid()).optional(),
});
export type SendCampaignInput = z.infer<typeof sendCampaignSchema>;
