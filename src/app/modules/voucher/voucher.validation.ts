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
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  discountType: DiscountTypeEnum.optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(["active", "inactive", "expired", "upcoming"]).optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(["createdAt", "code", "discountValue", "usesCount", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  cartTotal: z.coerce.number().nonnegative().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  categoryPath: z.array(z.string()).optional(),
  // Giá sau khi đã áp promotion (unit_price × quantity)
  itemTotal: z.coerce.number().nonnegative().optional(),
});

export const validateVoucherSchema = z.object({
  code: z.string().min(1, "Mã voucher không được để trống"),
  orderTotal: z.coerce.number().positive("Tổng đơn hàng phải lớn hơn 0"),
  userId: z.string().uuid().optional(),
  cartItems: z.array(cartItemSchema).optional().default([]),
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
    maxDiscountValue: z.coerce.number().positive().optional(),
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
      if (data.discountType === "DISCOUNT_PERCENT" && data.discountValue > 100) return false;
      return true;
    },
    { message: "Giảm giá theo % không được vượt quá 100", path: ["discountValue"] },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate > data.endDate) return false;
      return true;
    },
    { message: "Ngày bắt đầu phải trước ngày kết thúc", path: ["endDate"] },
  );

export const updateVoucherSchema = z
  .object({
    code: z.string().min(3).toUpperCase().optional(),
    description: z.string().optional(),
    discountType: DiscountTypeEnum.optional(),
    discountValue: z.coerce.number().positive().optional(),
    minOrderValue: z.coerce.number().nonnegative().optional(),
    maxDiscountValue: z.coerce.number().positive().optional().nullable(),
    maxUses: z.coerce.number().int().positive().optional().nullable(),
    maxUsesPerUser: z.coerce.number().int().positive().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    priority: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
    targets: z.array(voucherTargetSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.discountType === "DISCOUNT_PERCENT" && data.discountValue && data.discountValue > 100) return false;
      return true;
    },
    { message: "Giảm giá theo % không được vượt quá 100", path: ["discountValue"] },
  );

export const assignVoucherToUsersSchema = z.object({
  voucherId: z.string().uuid(),
  userIds: z.array(z.string().uuid()).min(1, "Phải chọn ít nhất 1 user"),
  maxUsesPerUser: z.coerce.number().int().positive().default(1),
});

export const bulkDeleteVouchersSchema = z.object({
  ids: z.array(z.string().uuid("ID không hợp lệ")).min(1, "Phải chọn ít nhất 1 voucher"),
});

// =====================
// === TYPE EXPORTS ===
// =====================

export type ListVouchersQuery = z.infer<typeof listVouchersSchema>;
export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>;
export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type AssignVoucherToUsersInput = z.infer<typeof assignVoucherToUsersSchema>;
export type BulkDeleteVouchersInput = z.infer<typeof bulkDeleteVouchersSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
