import { Decimal } from "@prisma/client/runtime/library";

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: Decimal | number;
  createdAt: Date;
}

export interface OrderItemResponse {
  id: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName?: string;
  variantCode?: string;
  image?: string | null;
}

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
  orderStatus: string;
  paymentStatus: string;
  bankTransferCode?: string | null;
  momoOrderId?: string | null;
  vnpayTxnRef?: string | null;
  zaloPayTransId?: string | null;
  stripePaymentIntentId?: string | null;
  orderDate: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
}

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
