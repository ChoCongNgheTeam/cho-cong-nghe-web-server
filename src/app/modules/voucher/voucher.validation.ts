import { z } from "zod";

// =====================
// === ENUMS ===
// =====================

export const DiscountTypeEnum = z.enum(["DISCOUNT_PERCENT", "DISCOUNT_FIXED"]);
export const TargetTypeEnum = z.enum(["ALL", "PRODUCT", "CATEGORY", "BRAND"]);

// =====================
// === QUERY SCHEMAS ===
// =====================

export const listVouchersSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(12),
  search: z.string().optional(),
  discountType: DiscountTypeEnum.optional(),
  isActive: z.coerce.boolean().optional(),
  isExpired: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "code", "discountValue", "usesCount", "priority"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const validateVoucherSchema = z.object({
  code: z.string().min(1, "Mã voucher không được để trống"),
  orderTotal: z.coerce.number().positive("Tổng đơn hàng phải lớn hơn 0"),
  userId: z.string().uuid().optional(),
});

// =====================
// === PARAMS SCHEMAS ===
// =====================

export const voucherParamsSchema = z.object({
  id: z.string().uuid({ message: "ID voucher không hợp lệ" }),
});

export const voucherCodeParamsSchema = z.object({
  code: z.string().min(1, { message: "Mã voucher không được để trống" }),
});

// =====================
// === CREATE/UPDATE SCHEMAS ===
// =====================

const voucherTargetSchema = z.object({
  targetType: TargetTypeEnum,
  targetId: z.string().uuid().optional(),
});

export const createVoucherSchema = z
  .object({
    code: z.string().min(3, "Mã voucher phải có ít nhất 3 ký tự").toUpperCase(),
    description: z.string().optional(),
    discountType: DiscountTypeEnum,
    discountValue: z.coerce.number().positive("Giá trị giảm giá phải lớn hơn 0"),
    minOrderValue: z.coerce.number().nonnegative().default(0),
    maxUses: z.coerce.number().int().positive().optional(),
    maxUsesPerUser: z.coerce.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    priority: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),
    targets: z.array(voucherTargetSchema).optional().default([]),
    userIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.discountType === "DISCOUNT_PERCENT" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Giảm giá theo % không được vượt quá 100",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "Ngày bắt đầu phải trước ngày kết thúc",
      path: ["endDate"],
    },
  );

export const updateVoucherSchema = z
  .object({
    code: z.string().min(3).toUpperCase().optional(),
    description: z.string().optional(),
    discountType: DiscountTypeEnum.optional(),
    discountValue: z.coerce.number().positive().optional(),
    minOrderValue: z.coerce.number().nonnegative().optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    maxUsesPerUser: z.coerce.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    priority: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
    targets: z.array(voucherTargetSchema).optional(),
  })
  .refine(
    (data) => {
      if (
        data.discountType === "DISCOUNT_PERCENT" &&
        data.discountValue &&
        data.discountValue > 100
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Giảm giá theo % không được vượt quá 100",
      path: ["discountValue"],
    },
  );

export const assignVoucherToUsersSchema = z.object({
  voucherId: z.string().uuid(),
  userIds: z.array(z.string().uuid()).min(1, "Phải chọn ít nhất 1 user"),
  maxUsesPerUser: z.coerce.number().int().positive().default(1),
});

// =====================
// === TYPE EXPORTS ===
// =====================

export type ListVouchersQuery = z.infer<typeof listVouchersSchema>;
export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>;
export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type AssignVoucherToUsersInput = z.infer<typeof assignVoucherToUsersSchema>;
