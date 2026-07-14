import { z } from "zod";

export const SETTING_GROUPS = ["general", "ecommerce", "checkout", "customer", "order", "wallet", "invoice", "tax", "seo", "notification_admin"] as const;

export type SettingGroup = (typeof SETTING_GROUPS)[number];

/**
 * Các group được phép đọc công khai (không cần đăng nhập) — dùng cho client site
 * để render logo, favicon, maintenance_mode, SEO meta tags...
 * Các group còn lại (wallet, tax, invoice, notification_admin...) có thể chứa cấu hình
 * nhạy cảm nên bắt buộc phải là admin mới đọc được.
 */
export const PUBLIC_SETTING_GROUPS: SettingGroup[] = ["general", "seo"];

export const groupParamSchema = z.object({
  group: z.enum(SETTING_GROUPS),
});
export type GroupParamInput = z.infer<typeof groupParamSchema>;

// FIX: hỗ trợ cả JSON body { settings: {...} } lẫn FormData
// Khi FormData: field "settings" là JSON string → parse trước khi validate
export const updateSettingsSchema = z.object({
  settings: z
    .union([
      // JSON body thông thường
      z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])),
      // FormData gửi settings là JSON string
      z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val);
          if (typeof parsed !== "object" || parsed === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "settings phải là object" });
            return z.NEVER;
          }
          return parsed as Record<string, string | boolean | number>;
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "settings không phải JSON hợp lệ" });
          return z.NEVER;
        }
      }),
    ])
    .pipe(z.record(z.string(), z.union([z.string(), z.boolean(), z.number()]))),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
