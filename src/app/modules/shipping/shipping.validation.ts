import { z } from "zod";

export const shipmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  status: z.enum(["PENDING", "CREATED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED", "CANCELLED"]).optional(),
  providerCode: z.enum(["GHN", "GHTK", "VTP"]).optional(),
  search: z.string().optional(), // theo orderCode hoặc providerOrderCode
  sortBy: z.enum(["createdAt", "expectedDeliveryAt"]).default("createdAt").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export type ShipmentQuery = z.infer<typeof shipmentQuerySchema>;

// Tạo vận đơn cho 1 đơn hàng đơn lẻ
export const createShipmentSchema = z.object({
  orderId: z.string().uuid("ID đơn hàng không hợp lệ"),
  providerCode: z.enum(["GHN", "GHTK", "VTP"]),
  weightGram: z.number().min(1, "Khối lượng phải lớn hơn 0").default(500),
  note: z.string().optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;

// Tạo vận đơn hàng loạt — nhiều đơn hàng cùng lúc, cùng 1 provider
export const bulkCreateShipmentSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1, "Cần chọn ít nhất 1 đơn hàng"),
  providerCode: z.enum(["GHN", "GHTK", "VTP"]),
  weightGram: z.number().min(1).default(500),
});

export type BulkCreateShipmentInput = z.infer<typeof bulkCreateShipmentSchema>;

export const bulkPrintLabelSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1, "Cần chọn ít nhất 1 vận đơn"),
});

export type BulkPrintLabelInput = z.infer<typeof bulkPrintLabelSchema>;

export const upsertShippingProviderSchema = z.object({
  code: z.enum(["GHN", "GHTK", "VTP"]),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  config: z.record(z.string(), z.any()).default({}),
});

export type UpsertShippingProviderInput = z.infer<typeof upsertShippingProviderSchema>;
