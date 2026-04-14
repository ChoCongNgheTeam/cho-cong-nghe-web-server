import { getVariantPricing } from "../pricing.service";
import { mapPricingToSummary } from "../pricing.helpers";
import { getCart } from "../../cart/cart.service";

// 👇 THÊM: cartItemIds?: string[] vào vị trí tham số thứ 2
export const getCartWithPricing = async (userId: string, cartItemIds?: string[], voucherCode?: string) => {
  // 👇 Đẩy mảng ID xuống hàm getCart để filter ngay tại Database
  const cartItems = await getCart(userId, cartItemIds);

  if (cartItems.length === 0) {
    return {
      items: [],
      totalItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      totalPromotionDiscount: 0,
      totalVoucherDiscount: 0,
      totalDiscount: 0,
      finalTotal: 0,
      isValid: true,
      errors: [],
    };
  }

  let subtotal = 0;
  let totalPromotionDiscount = 0;
  const errors: string[] = [];

  const items = await Promise.all(
    cartItems.map(async (item) => {
      const variantAttributes = (item.variantAttributes ?? []).map((va: any) => ({
        code: va.code ?? va.attributeOption?.attribute?.code,
        value: va.value ?? va.attributeOption?.value,
      }));

      const fullPricing = await getVariantPricing(item.productId, item.productVariantId, item.unitPrice, item.brandId, item.categoryPath, userId, variantAttributes);

      const priceSummary = mapPricingToSummary(fullPricing);
      const finalPrice = fullPricing.final ?? fullPricing.base;
      const itemTotalBase = item.unitPrice * item.quantity;
      const itemTotalFinal = finalPrice * item.quantity;

      subtotal += itemTotalBase;
      totalPromotionDiscount += (item.unitPrice - finalPrice) * item.quantity;

      return {
        ...item,
        price: priceSummary,
        totalBasePrice: itemTotalBase,
        totalFinalPrice: itemTotalFinal,
      };
    }),
  );

  const finalTotal = subtotal - totalPromotionDiscount;

  return {
    items,
    totalItems: cartItems.length,
    totalQuantity: cartItems.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    totalPromotionDiscount,
    totalVoucherDiscount: 0,
    totalDiscount: totalPromotionDiscount,
    finalTotal: Math.max(0, finalTotal),
    appliedVoucher: undefined,
    isValid: errors.length === 0,
    errors,
  };
};

// Các đoạn code bị comment bên dưới cũng được cập nhật lại vị trí tham số cho đồng bộ
// export const validateCartForCheckout = async (userId: string, cartItemIds?: string[], voucherCode?: string) => {
//   const errors: string[] = [];
//   const warnings: string[] = [];
//   const cart = await getCartWithPricing(userId, cartItemIds, voucherCode);

//   if (cart.items.length === 0) {
//     errors.push("Giỏ hàng trống");
//     return { isValid: false, errors, warnings };
//   }

//   cart.items.forEach((item: any) => {
//     if (item.quantity <= 0) errors.push(`Số lượng không hợp lệ cho sản phẩm ${item.productName}`);
//   });

//   if (!cart.isValid) errors.push(...cart.errors);
//   if (cart.finalTotal < 0) errors.push("Tổng giá trị đơn hàng không hợp lệ");

//   return { isValid: errors.length === 0, errors, warnings };
// };

// export const applyVoucherToCart = async (userId: string, cartItemIds?: string[], voucherCode: string) => {
//   try {
//     const cart = await getCartWithPricing(userId, cartItemIds, voucherCode);
//     if (!cart.isValid && cart.errors.length > 0) return { success: false, message: cart.errors[0] };
//     if (!cart.appliedVoucher) return { success: false, message: "Voucher không áp dụng được cho giỏ hàng này" };
//     return {
//       success: true,
//       message: `Đã áp dụng voucher. Giảm ${cart.totalVoucherDiscount.toLocaleString()}đ`,
//       cart,
//     };
//   } catch (e: any) {
//     return { success: false, message: e.message || "Lỗi khi áp dụng voucher" };
//   }
// };

// export const removeVoucherFromCart = async (userId: string, cartItemIds?: string[]) => getCartWithPricing(userId, cartItemIds);