/**
 * ===== PRICING MODULE - PUBLIC API =====
 * Central export file for all pricing usecases
 */

// ===== PRODUCT USECASES =====
export { getProductsWithPricing } from "./usecases/getProductsWithPricing.service";
export { getProductDetailWithPricing } from "./usecases/getProductDetailWithPricing.service";
export { getProductVariantWithPricing } from "./usecases/getProductVariantPricing.service";
export { getRelatedProductsWithPricing } from "./usecases/getRelatedProductsWithPricing.service";

// ===== CART USECASES =====
export {
  getCartWithPricing,
  validateCartForCheckout,
  applyVoucherToCart,
  removeVoucherFromCart,
} from "./usecases/getCartWithPricing.service";

export type { CartItemInput, CartWithPricingResponse } from "./usecases/getCartWithPricing.service";

// ===== CHECKOUT USECASES =====
export {
  getCheckoutWithPricing,
  validateCheckoutBeforeOrder,
  calculateShippingFee,
  previewOrder,
  prepareOrderData,
} from "./usecases/getCheckoutWithPricing.service";

export type {
  CheckoutItemInput,
  CheckoutWithPricingResponse,
  ShippingMethod,
  PaymentMethod,
} from "./usecases/getCheckoutWithPricing.service";

// ===== CORE PRICING (if needed directly) =====
export { getVariantPricing } from "./pricing.service";

// ===== TYPES =====
export type {
  PricingProductInput,
  PricingCartInput,
  PricingResult,
  PricedProduct,
  PromotionData,
  VoucherData,
  DisplayPromotion,
} from "./pricing.types";

// ===== HELPERS =====
export { formatPrice, calculateDiscountPercentage, mapPricingToSummary } from "./pricing.helpers";
