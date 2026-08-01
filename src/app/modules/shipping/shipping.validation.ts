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

// Danh sách đơn hàng CHƯA có vận đơn — dùng cho picker chọn đơn khi tạo vận đơn hàng loạt.
export const eligibleOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(), // theo orderCode, tên/SĐT người nhận
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]).optional(),
});

export type EligibleOrdersQuery = z.infer<typeof eligibleOrdersQuerySchema>;

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

// In tem hàng loạt — đổi thành GET + query (thay vì POST + body) vì apiRequest
// bên FE chỉ hỗ trợ responseType: "blob" ở GET (giống pattern exportOrders),
// không hỗ trợ ở POST.
export const bulkPrintLabelQuerySchema = z.object({
  shipmentIds: z
    .string()
    .min(1, "Cần chọn ít nhất 1 vận đơn")
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
});

export type BulkPrintLabelQuery = z.infer<typeof bulkPrintLabelQuerySchema>;

export const upsertShippingProviderSchema = z.object({
  code: z.enum(["GHN", "GHTK", "VTP"]),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  config: z.record(z.string(), z.any()).default({}),
});

export type UpsertShippingProviderInput = z.infer<typeof upsertShippingProviderSchema>;
