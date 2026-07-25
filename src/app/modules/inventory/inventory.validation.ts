import { z } from "zod";
import { StockMovementType, StockMovementReason, StocktakeStatus } from "@prisma/client";

const queryBoolean = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean().optional());

export const variantParamsSchema = z.object({
  variantId: z.string().uuid("ID biến thể không hợp lệ"),
});

export const stocktakeParamsSchema = z.object({
  id: z.string().uuid("ID phiếu kiểm kê không hợp lệ"),
});

// ─── Tồn kho sản phẩm ──────────────────────────────────────────────────────

export const stockStatusEnum = z.enum(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).default("ALL");

export const listInventoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  stockStatus: stockStatusEnum,
});

// ─── Nhập kho / Xuất kho ───────────────────────────────────────────────────

export const stockInItemSchema = z.object({
  productVariantId: z.string().uuid("ID biến thể không hợp lệ"),
  quantity: z.coerce.number().int().positive("Số lượng phải > 0"),
  unitCost: z.coerce.number().nonnegative("Đơn giá không hợp lệ").optional(),
});

export const stockInSchema = z.object({
  warehouseId: z.string().uuid("ID kho không hợp lệ").optional(), // optional → dùng kho mặc định
  supplierId: z.string().uuid("ID nhà cung cấp không hợp lệ").optional(),
  reason: z.nativeEnum(StockMovementReason).default("PURCHASE"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(stockInItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
});

export const stockOutItemSchema = z.object({
  productVariantId: z.string().uuid("ID biến thể không hợp lệ"),
  quantity: z.coerce.number().int().positive("Số lượng phải > 0"),
});

export const stockOutSchema = z.object({
  warehouseId: z.string().uuid("ID kho không hợp lệ").optional(),
  reason: z.nativeEnum(StockMovementReason).default("DAMAGE"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(stockOutItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
});

// ─── Lịch sử nhập/xuất ─────────────────────────────────────────────────────

export const listMovementsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  type: z.nativeEnum(StockMovementType).optional(),
  reason: z.nativeEnum(StockMovementReason).optional(),
  warehouseId: z.string().uuid().optional(),
  productVariantId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// ─── Cảnh báo tồn kho thấp ─────────────────────────────────────────────────

export const listAlertsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  warehouseId: z.string().uuid().optional(),
});

export const updateLowStockThresholdSchema = z.object({
  warehouseId: z.string().uuid("ID kho không hợp lệ").optional(),
  lowStockThreshold: z.coerce.number().int().min(0, "Ngưỡng cảnh báo không được âm"),
});

// ─── Khởi tạo tồn kho ban đầu (chạy 1 lần khi mới tạo kho) ─────────────────

export const initializeStockSchema = z.object({
  warehouseId: z.string().uuid("ID kho không hợp lệ").optional(),
});

// ─── Kiểm kê kho ───────────────────────────────────────────────────────────

export const createStocktakeSchema = z.object({
  warehouseId: z.string().uuid("ID kho không hợp lệ").optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  // Nếu không truyền → snapshot toàn bộ variant active đang có tồn kho ở kho này
  productVariantIds: z.array(z.string().uuid()).optional(),
});

export const listStocktakesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  status: z.nativeEnum(StocktakeStatus).optional(),
  warehouseId: z.string().uuid().optional(),
});

export const updateStocktakeItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productVariantId: z.string().uuid(),
        actualQuantity: z.coerce.number().int().min(0, "Số lượng thực tế không được âm"),
        note: z.string().trim().max(255).optional().or(z.literal("")),
      }),
    )
    .min(1, "Cần ít nhất 1 dòng cập nhật"),
});

export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
export type ListMovementsQuery = z.infer<typeof listMovementsQuerySchema>;
export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type UpdateLowStockThresholdInput = z.infer<typeof updateLowStockThresholdSchema>;
export type CreateStocktakeInput = z.infer<typeof createStocktakeSchema>;
export type ListStocktakesQuery = z.infer<typeof listStocktakesQuerySchema>;
export type UpdateStocktakeItemsInput = z.infer<typeof updateStocktakeItemsSchema>;
