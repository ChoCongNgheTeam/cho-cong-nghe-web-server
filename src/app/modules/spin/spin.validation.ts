import { z } from "zod";

export const prizeParamsSchema = z.object({
  id: z.string().uuid("ID phần thưởng không hợp lệ"),
});

export const createPrizeSchema = z.object({
  label: z.string().trim().min(1, "Tên phần thưởng không được để trống").max(100, "Tên phần thưởng tối đa 100 ký tự"),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ, dùng định dạng #RRGGBB")
    .optional(),
  voucherId: z.string().uuid("ID voucher không hợp lệ").optional(),
  weight: z.coerce.number().int().min(1, "Trọng số phải >= 1").default(1),
  totalBudget: z.coerce.number().int().min(1, "Ngân sách phải >= 1").optional(), // bỏ trống = không giới hạn
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true),
});

export const updatePrizeSchema = z.object({
  label: z.string().trim().min(1).max(100).optional(),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ, dùng định dạng #RRGGBB")
    .optional(),
  voucherId: z.string().uuid("ID voucher không hợp lệ").nullable().optional(),
  weight: z.coerce.number().int().min(1).optional(),
  totalBudget: z.coerce.number().int().min(1).nullable().optional(), // truyền null = bỏ giới hạn
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;
export type UpdatePrizeInput = z.infer<typeof updatePrizeSchema>;
