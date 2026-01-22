import { z } from "zod";

// =====================
// === ENUMS ===
// =====================

export const TargetTypeEnum = z.enum(["ALL", "PRODUCT", "CATEGORY", "BRAND"]);
export const PromotionActionTypeEnum = z.enum([
  "DISCOUNT_PERCENT",
  "DISCOUNT_FIXED",
  "BUY_X_GET_Y",
  "GIFT_PRODUCT",
]);

// =====================
// === QUERY SCHEMAS ===
// =====================

export const listPromotionsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(12),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isExpired: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "name", "priority", "startDate", "endDate"]).default("priority"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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

const promotionTargetSchema = z
  .object({
    targetType: TargetTypeEnum,
    targetId: z.string().uuid().optional(),
    buyQuantity: z.coerce.number().int().positive().optional(),
    actionType: PromotionActionTypeEnum,
    discountValue: z.coerce.number().positive().optional(),
    giftProductVariantId: z.string().uuid().optional(),
    getQuantity: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // If targetType is not ALL, targetId is required
      if (data.targetType !== "ALL" && !data.targetId) {
        return false;
      }
      return true;
    },
    {
      message: "targetId bắt buộc khi targetType không phải ALL",
      path: ["targetId"],
    },
  )
  .refine(
    (data) => {
      // DISCOUNT_PERCENT requires discountValue <= 100
      if (
        data.actionType === "DISCOUNT_PERCENT" &&
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
  )
  .refine(
    (data) => {
      // DISCOUNT actions require discountValue
      if (
        (data.actionType === "DISCOUNT_PERCENT" || data.actionType === "DISCOUNT_FIXED") &&
        !data.discountValue
      ) {
        return false;
      }
      return true;
    },
    {
      message: "discountValue bắt buộc cho action DISCOUNT",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // BUY_X_GET_Y requires buyQuantity and getQuantity
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
      // FREE_GIFT requires giftProductVariantId
      if (data.actionType === "GIFT_PRODUCT" && !data.giftProductVariantId) {
        return false;
      }
      return true;
    },
    {
      message: "giftProductVariantId bắt buộc cho action FREE_GIFT",
      path: ["giftProductVariantId"],
    },
  );

export const createPromotionSchema = z
  .object({
    name: z.string().min(3, "Tên khuyến mãi phải có ít nhất 3 ký tự"),
    description: z.string().optional(),
    priority: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    targets: z.array(promotionTargetSchema).min(1, "Promotion phải có ít nhất 1 target"),
  })
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

export const updatePromotionSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    priority: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    targets: z.array(promotionTargetSchema).optional(),
  })
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

// =====================
// === TYPE EXPORTS ===
// =====================

export type ListPromotionsQuery = z.infer<typeof listPromotionsSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
