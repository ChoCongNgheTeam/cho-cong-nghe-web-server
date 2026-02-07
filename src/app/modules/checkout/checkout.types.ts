import { Decimal } from "@prisma/client/runtime/library";

/**
 * Checkout request
 */
export interface CheckoutInput {
  paymentMethodId: string;
  shippingAddressId: string;
  voucherId?: string;
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
 * Checkout summary with calculated totals
 * 🔥 UPDATED: Added taxAmount field
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
  taxAmount: number; // 🔥 NEW: VAT tax amount
  totalAmount: number;
  paymentMethodId: string;
  shippingAddressId: string;
  voucherId?: string;
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