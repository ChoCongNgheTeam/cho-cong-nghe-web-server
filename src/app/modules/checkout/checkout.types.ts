import { Decimal } from "@prisma/client/runtime/library";
import { PaymentFields } from "./payment-info.builder";

/**
 * Checkout request
 */
export interface CheckoutInput {
  paymentMethodId: string;
  shippingAddressId: string;
  voucherId?: string;
  cartItemIds?: string[];
}

/**
 * Cart item validation result
 */
export interface CartItemValidation {
  productVariantId: string;
  quantity: number;
  unitPrice: Decimal | number;
  isValid: boolean;
  errors: string[];
  productName?: string;
  variantCode?: string;
}

/**
 * Cart validation result
 */
export interface CartValidationResult {
  isValid: boolean;
  totalItems: number;
  totalQuantity: number;
  items: CartItemValidation[];
  errors: string[];
}

/**
 * Checkout summary with calculated totals.
 * paymentFields được merge vào trước khi gọi executeOrderTransaction
 * → tất cả ghi vào DB trong 1 transaction duy nhất (atomic).
 */
export interface CheckoutSummary {
  items: Array<{
    productVariantId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    productName: string;
    variantCode: string | null;
  }>;
  subtotalAmount: number;
  shippingFee: number;
  voucherDiscount: number;
  totalAmount: number;
  paymentMethodId: string;
  paymentMethodCode: string;
  shippingAddressId: string;
  voucherId?: string;
  bankTransferCode?: string;
  // orderCode pre-generated in controller to use as payment provider ref
  orderCode?: string;
  // Payment fields — populated by buildPaymentInfo() TRƯỚC transaction
  paymentFields?: PaymentFields;
  cartItemIds?: string[];
}

/**
 * Checkout response
 */
export interface CheckoutResponse {
  orderId: string;
  orderDate: Date;
  summary: CheckoutSummary;
  orderStatus: string;
  paymentStatus: string;
}
