import { z } from "zod";

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
  includeDeleted: z.coerce.boolean().optional().default(false), // Bổ sung cho Archive
});

export type OrderQuery = z.infer<typeof orderQuerySchema>;

// Ép Admin dùng API Cancel riêng để xử lý Tồn kho an toàn
export const updateOrderAdminSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
  shippingFee: z.number().min(0).optional(),
  voucherDiscount: z.number().min(0).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

export const createOrderAdminSchema = z.object({
  userId: z.string().uuid("ID khách hàng không hợp lệ").optional(), 
  shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ").optional(),
  customerInfo: z.object({
    fullName: z.string().min(1, "Tên không được để trống"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").optional(), 
  }).optional(),
  newAddress: z.object({
    provinceId: z.string().uuid(),
    wardId: z.string().uuid(),
    detailAddress: z.string().min(1),
  }).optional(),
  items: z.array(
    z.object({
      productVariantId: z.string().uuid(),
      quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
      unitPrice: z.number().min(0),
    })
  ).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
  voucherCode: z.string().optional(), 
  shippingFee: z.number().min(0, "Phí vận chuyển không được âm"),
  paymentMethodId: z.string().uuid("Thiếu phương thức thanh toán"),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]),
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
}).refine(data => {
  const hasExistingUser = !!data.userId && !!data.shippingAddressId;
  const hasNewUser = !!data.customerInfo && !!data.newAddress;
  return hasExistingUser || hasNewUser;
}, {
  message: "Phải cung cấp User & Address có sẵn, HOẶC tạo Customer & Address mới",
});

export type CreateOrderAdminInput = z.infer<typeof createOrderAdminSchema>;
export type UpdateOrderAdminInput = z.infer<typeof updateOrderAdminSchema>;