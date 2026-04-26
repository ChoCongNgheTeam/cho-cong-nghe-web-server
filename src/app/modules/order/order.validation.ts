import { z } from "zod";

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUND_PENDING", "REFUNDED"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type OrderQuery = z.infer<typeof orderQuerySchema>;

// ─── Export schema ────────────────────────────────────────────────────────────
// Dùng chung filter giống query nhưng KHÔNG có page/limit (lấy toàn bộ kết quả)
// Thêm giới hạn tối đa 5000 row để tránh OOM
export const exportOrderSchema = z.object({
  format: z.enum(["csv", "excel"]).default("excel"),
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUND_PENDING", "REFUNDED"]).optional(),
  search: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(5000).default(5000).optional(),
});

export type ExportOrderQuery = z.infer<typeof exportOrderSchema>;

// Ép Admin dùng API Cancel riêng để xử lý tồn kho an toàn
export const updateOrderAdminSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUND_PENDING", "REFUNDED"]).optional(),
  paymentMethodId: z.string().uuid().optional(),
  shippingFee: z.number().min(0).optional(),
  voucherDiscount: z.number().min(0).optional(),
});

// Schema riêng cho action confirm refund
export const confirmRefundSchema = z.object({
  refundNote: z.string().optional(),
});

export const createOrderAdminSchema = z
  .object({
    userId: z.string().uuid("ID khách hàng không hợp lệ").optional(),
    shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ").optional(),
    customerInfo: z
      .object({
        fullName: z.string().min(1, "Tên không được để trống"),
        phone: z.string().min(10, "Số điện thoại không hợp lệ"),
        email: z.string().email("Email không hợp lệ").optional(),
      })
      .optional(),
    newAddress: z
      .object({
        provinceCode: z.number().int("Mã tỉnh/thành phố phải là số nguyên"),
        wardCode: z.number().int("Mã phường/xã phải là số nguyên"),
        detailAddress: z.string().min(1),
      })
      .optional(),
    items: z
      .array(
        z.object({
          productVariantId: z.string().uuid(),
          quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
          unitPrice: z.number().min(0),
        }),
      )
      .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
    voucherCode: z.string().optional(),
    shippingFee: z.number().min(0, "Phí vận chuyển không được âm"),
    paymentMethodId: z.string().uuid("Thiếu phương thức thanh toán"),
    paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]),
    orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  })
  .refine(
    (data) => {
      const hasExistingUser = !!data.userId && !!data.shippingAddressId;
      const hasNewUser = !!data.customerInfo && !!data.newAddress;
      return hasExistingUser || hasNewUser;
    },
    { message: "Phải cung cấp User & Address có sẵn, HOẶC tạo Customer & Address mới" },
  );

export type CreateOrderAdminInput = z.infer<typeof createOrderAdminSchema>;
export type UpdateOrderAdminInput = z.infer<typeof updateOrderAdminSchema>;
