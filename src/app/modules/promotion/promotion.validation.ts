import { z } from "zod";

// =====================
// === ENUMS ===
// =====================

export const TargetTypeEnum = z.enum(["ALL", "PRODUCT", "CATEGORY", "BRAND"]);
export const PromotionActionTypeEnum = z.enum(["DISCOUNT_PERCENT", "DISCOUNT_FIXED", "BUY_X_GET_Y", "GIFT_PRODUCT", "FREE_SHIPPING"]);

// =====================
// === QUERY SCHEMAS ===
// =====================

// Helper: parse query string boolean đúng cách (giống brand)
const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const listPromotionsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: queryBoolean,

  // ← THÊM: filter theo status rõ ràng
  status: z.enum(["active", "inactive", "expired", "upcoming"]).optional(),

  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(["createdAt", "name", "priority", "startDate", "endDate"]).default("startDate"), // ← đổi default sang startDate
  sortOrder: z.enum(["asc", "desc"]).default("asc"), // ← đổi default sang asc để sort theo ngày tăng dần
  includeDeleted: queryBoolean.pipe(z.boolean().optional().default(false)),
});

// =====================
// === PARAMS SCHEMAS ===
// =====================

export const promotionParamsSchema = z.object({
  id: z.string().uuid({ message: "ID promotion không hợp lệ" }),
});

export const productParamsSchema = z.object({
  productId: z.string().uuid({ message: "productId không hợp lệ" }),
});

export const categoryParamsSchema = z.object({
  categoryId: z.string().uuid({ message: "categoryId không hợp lệ" }),
});

export const brandParamsSchema = z.object({
  brandId: z.string().uuid({ message: "brandId không hợp lệ" }),
});

// =====================
// === BULK DELETE SCHEMA ===
// =====================

export const bulkDeletePromotionSchema = z.object({
  ids: z.array(z.string().uuid({ message: "ID promotion không hợp lệ" })).min(1, "Cần ít nhất 1 ID để xóa"),
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
    // targetCode/targetValue: cột thật trong DB (promotion_targets.targetCode/targetValue).
    // targetName KHÔNG lưu DB — chỉ được resolve (tên brand/category/product) lúc đọc ở
    // repository.findById(), nên không khai ở input schema để tránh lỗi "field không tồn tại"
    // khi tạo/update.
    targetCode: z.string().trim().optional(),
    targetValue: z.string().trim().optional(),
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
    name: z.string().trim().min(3, "Tên khuyến mãi phải có ít nhất 3 ký tự"),
    description: z.string().trim().optional(),
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
    name: z.string().trim().min(3).optional(),
    description: z.string().trim().optional(),
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

export const listDeletedPromotionsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

// =====================
// === TYPE EXPORTS ===
// =====================

export type ListPromotionsQuery = z.infer<typeof listPromotionsSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type BulkDeletePromotionInput = z.infer<typeof bulkDeletePromotionSchema>;
export type ListDeletedPromotionsQuery = z.infer<typeof listDeletedPromotionsSchema>;
