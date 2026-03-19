import { z } from "zod";

// =====================
// === ENUMS ===
// =====================

export const TargetTypeEnum = z.enum(["ALL", "PRODUCT", "CATEGORY", "BRAND"]);
export const PromotionActionTypeEnum = z.enum(["DISCOUNT_PERCENT", "DISCOUNT_FIXED", "BUY_X_GET_Y", "GIFT_PRODUCT"]);

// =====================
// === QUERY SCHEMAS ===
// =====================

// Helper: parse query string boolean đúng cách (giống brand)
const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const listPromotionsSchema = z.object({
  // Pagination
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),

  // Search & filter
  search: z.string().optional(),
  isActive: queryBoolean,
  isExpired: queryBoolean,

  // Date range filter (theo createdAt)
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),

  // Sort
  sortBy: z.enum(["createdAt", "name", "priority", "startDate", "endDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  // Admin only: xem cả promotion đã soft delete
  includeDeleted: queryBoolean.pipe(z.boolean().optional().default(false)),
});

// =====================
// === PARAMS SCHEMAS ===
// =====================

export const promotionParamsSchema = z.object({
  id: z.string().uuid({ message: "ID promotion không hợp lệ" }),
});

// =====================
// === CREATE/UPDATE SCHEMAS ===
// =====================

const promotionRuleSchema = z
  .object({
    actionType: PromotionActionTypeEnum,
    discountValue: z.coerce.number().positive().optional(),
    buyQuantity: z.coerce.number().int().positive().optional(),
    getQuantity: z.coerce.number().int().positive().optional(),
    giftProductVariantId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.actionType === "DISCOUNT_PERCENT" && data.discountValue && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    { message: "Giảm giá theo % không được vượt quá 100", path: ["discountValue"] },
  )
  .refine(
    (data) => {
      if ((data.actionType === "DISCOUNT_PERCENT" || data.actionType === "DISCOUNT_FIXED") && !data.discountValue) {
        return false;
      }
      return true;
    },
    { message: "discountValue bắt buộc cho action DISCOUNT", path: ["discountValue"] },
  )
  .refine(
    (data) => {
      if (data.actionType === "BUY_X_GET_Y" && (!data.buyQuantity || !data.getQuantity)) {
        return false;
      }
      return true;
    },
    {
      message: "buyQuantity và getQuantity bắt buộc cho action BUY_X_GET_Y",
      path: ["buyQuantity"],
    },
  )
  .refine(
    (data) => {
      if (data.actionType === "GIFT_PRODUCT" && !data.giftProductVariantId) {
        return false;
      }
      return true;
    },
    {
      message: "giftProductVariantId bắt buộc cho action GIFT_PRODUCT",
      path: ["giftProductVariantId"],
    },
  );

const promotionTargetSchema = z
  .object({
    targetType: TargetTypeEnum,
    targetId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.targetType !== "ALL" && !data.targetId) {
        return false;
      }
      return true;
    },
    { message: "targetId bắt buộc khi targetType không phải ALL", path: ["targetId"] },
  );

export const createPromotionSchema = z
  .object({
    name: z.string().min(3, "Tên khuyến mãi phải có ít nhất 3 ký tự"),
    description: z.string().optional(),
    priority: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    minOrderValue: z.coerce.number().positive().optional(),
    maxDiscountValue: z.coerce.number().positive().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    rules: z.array(promotionRuleSchema).min(1, "Promotion phải có ít nhất 1 rule"),
    targets: z.array(promotionTargetSchema).min(1, "Promotion phải có ít nhất 1 target"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    { message: "Ngày bắt đầu phải trước ngày kết thúc", path: ["endDate"] },
  );

export const updatePromotionSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    priority: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    minOrderValue: z.coerce.number().positive().optional(),
    maxDiscountValue: z.coerce.number().positive().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    rules: z.array(promotionRuleSchema).optional(),
    targets: z.array(promotionTargetSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    { message: "Ngày bắt đầu phải trước ngày kết thúc", path: ["endDate"] },
  );

// =====================
// === TYPE EXPORTS ===
// =====================

export type ListPromotionsQuery = z.infer<typeof listPromotionsSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
