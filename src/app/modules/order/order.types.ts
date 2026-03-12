import { Decimal } from "@prisma/client/runtime/library";

/**
 * Order Item in database
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: Decimal | number;
  createdAt: Date;
}

/**
 * Order Item for API response
 */
export interface OrderItemResponse {
  id: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number; // calculated
  productName?: string;
  variantCode?: string;
  image?: string | null;
}

/**
 * Order for database
 */
export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  paymentMethodId: string;
  voucherId?: string | null;
  shippingAddressId?: string | null;
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  subtotalAmount: Decimal | number;
  shippingFee: Decimal | number;
  voucherDiscount: Decimal | number;
  totalAmount: Decimal | number;
  orderStatus: string; // OrderStatus enum
  paymentStatus: string; // PaymentStatus enum
  bankTransferCode?: string | null;
  momoOrderId?: string | null;
  vnpayTxnRef?: string | null;
  zaloPayTransId?: string | null;
  stripePaymentIntentId?: string | null;
  orderDate: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  orderItems?: OrderItem[];
}

/**
 * Order for API response
 */
export interface OrderResponse {
  id: string;
  orderCode: string;
  userId: string;
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  subtotalAmount: number;
  shippingFee: number;
  voucherDiscount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: Date;
  updatedAt: Date;
  items?: OrderItemResponse[];
}

/**
 * Order list for dashboard/admin
 */
export interface OrderListItem {
  id: string;
  orderCode: string;
  userId: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: Date;
  itemCount?: number;
}

/**
 * Order statistics
 */
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
