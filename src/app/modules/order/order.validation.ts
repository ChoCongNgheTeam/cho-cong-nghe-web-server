import { z } from "zod";

export const updateOrderAdminSchema = z.object({
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
  shippingFee: z.number().min(0).optional(),
  voucherDiscount: z.number().min(0).optional(),
});

export const createOrderAdminSchema = z.object({
  // 1. Tùy chọn: Khách đã có tài khoản
  userId: z.string().uuid("ID khách hàng không hợp lệ").optional(), 
  shippingAddressId: z.string().uuid("ID địa chỉ giao hàng không hợp lệ").optional(),

  // 2. Tùy chọn: Khách mới hoàn toàn (Admin nhập tay)
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

  // 3. Sản phẩm & Chi phí
  items: z.array(
    z.object({
      productVariantId: z.string().uuid(),
      quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
      unitPrice: z.number().min(0),
    })
  ).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),

  voucherCode: z.string().optional(), 
  shippingFee: z.number().min(0, "Phí vận chuyển không được âm"),

  // 4. Thanh toán & Trạng thái
  paymentMethodId: z.string().uuid("Thiếu phương thức thanh toán"),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]),
  orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
}).refine(data => {
  // Ràng buộc: Phải truyền ID cũ HOẶC truyền data của khách mới
  const hasExistingUser = !!data.userId && !!data.shippingAddressId;
  const hasNewUser = !!data.customerInfo && !!data.newAddress;
  return hasExistingUser || hasNewUser;
}, {
  message: "Vui lòng cung cấp ID khách hàng/địa chỉ ĐÃ CÓ, HOẶC nhập thông tin khách hàng MỚI"
});

export type CreateOrderAdminInput = z.infer<typeof createOrderAdminSchema>;

export type UpdateOrderAdminInput = z.infer<typeof updateOrderAdminSchema>;