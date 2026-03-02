import * as repo from "./cart.repository";
import { AddToCartInput, UpdateCartItemInput, LocalStorageCartItem, SyncCartResult, ChangeVariantInput } from "./cart.types";
import { NotFoundError, BadRequestError } from "@/errors";

// 👉 IMPORT SERVICE TÍNH GIÁ MỚI 
import { getCartWithPricing } from "../pricing/use-cases/getCartWithPricing.service";

export const validateCartItemStatus = async (variantId: string, quantity: number) => {
  const variant = await repo.findVariantWithProductById(variantId);

  if (!variant) throw new NotFoundError("Sản phẩm không tồn tại");

  const errors: string[] = [];
  if (!variant.isActive || !variant.product.isActive) {
    errors.push("Sản phẩm ngừng kinh doanh");
  }

  const available = variant.quantity || 0;
  if (available < quantity) {
    errors.push(`Chỉ còn ${available} sản phẩm`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    availableQuantity: available,
    currentPrice: Number(variant.price),
    productName: variant.product.name,
  };
};

export const getCart = async (userId: string) => {
  // 1. Lấy dữ liệu giỏ hàng thô từ DB
  const items = await repo.findByUserId(userId);
  const formattedItems = items.map(repo.transformToCartResponse);

  // Xử lý nhanh nếu giỏ hàng trống
  if (formattedItems.length === 0) {
    return {
      items: [],
      totalItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      totalPromotionDiscount: 0,
      totalVoucherDiscount: 0,
      totalDiscount: 0,
      finalTotal: 0
    };
  }

  // 2. Chuyển đổi dữ liệu sang Format mà Pricing Service yêu cầu
  const cartInputForPricing = formattedItems.map(item => ({
    id: item.id,
    productId: item.productId,
    variantId: item.productVariantId,
    quantity: item.quantity,
    basePrice: item.unitPrice,     // Giá gốc từ db
    brandId: item.brandId,
    categoryId: item.categoryId,
    categoryPath: item.categoryPath,
    productName: item.productName,
    productSlug: item.productSlug,
    variantImage: item.image,
  }));

  // 3. 🚀 GỌI HÀM TÍNH GIÁ KHUYẾN MÃI TỪ MODULE PRICING
  const pricedCart = await getCartWithPricing(cartInputForPricing, userId);

  // 4. Gộp thông tin UI (màu sắc, dung lượng) với thông tin Giá mới tính
  const finalItems = pricedCart.items.map(pricedItem => {
    const originalItem = formattedItems.find(i => i.id === pricedItem.id);
    return {
      ...originalItem,  // Lấy lại color, storage, brandName...
      ...pricedItem,    // Đè lên thông tin giá mới (object price, totalFinalPrice...)
    };
  });

  // 5. Trả dữ liệu về cho Controller
  return {
    items: finalItems,
    totalItems: formattedItems.length,
    totalQuantity: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
    
    // Các field giá tiền đã được tính toán kỹ lưỡng từ Pricing Service
    subtotal: pricedCart.subtotal,
    totalPromotionDiscount: pricedCart.totalPromotionDiscount,
    totalVoucherDiscount: pricedCart.totalVoucherDiscount,
    totalDiscount: pricedCart.totalDiscount,
    finalTotal: pricedCart.finalTotal, // ĐÂY LÀ SỐ TIỀN KHÁCH THỰC SỰ PHẢI TRẢ
    appliedVoucher: pricedCart.appliedVoucher
  };
};

export const addToCart = async (userId: string, input: AddToCartInput) => {
  const check = await validateCartItemStatus(input.productVariantId, input.quantity);
  if (!check.isValid) throw new BadRequestError(check.errors.join(", "));

  const existing = await repo.findByUserAndVariant(userId, input.productVariantId);

  if (existing) {
    const newQty = existing.quantity + input.quantity;
    if (check.availableQuantity < newQty) throw new BadRequestError("Vượt quá số lượng tồn kho");
    
    const updated = await repo.update(existing.id, { 
      quantity: newQty, 
      unitPrice: check.currentPrice 
    });
    return repo.transformToCartResponse(updated);
  }

  const newItem = await repo.create({
    userId,
    productVariantId: input.productVariantId,
    quantity: input.quantity,
    unitPrice: check.currentPrice,
  });
  return repo.transformToCartResponse(newItem);
};

export const syncLocalStorageToDatabase = async (userId: string, items: LocalStorageCartItem[]): Promise<SyncCartResult> => {
  const result: SyncCartResult = { synced: 0, failed: 0, warnings: [] };

  for (const item of items) {
    try {
      const check = await validateCartItemStatus(item.productVariantId, item.quantity);
      
      if (check.availableQuantity === 0 || check.errors.includes("Sản phẩm ngừng kinh doanh")) {
        result.failed++;
        result.warnings.push(`"${check.productName}" đã hết hàng hoặc ngừng kinh doanh.`);
        continue;
      }

      const finalQty = Math.min(item.quantity, check.availableQuantity);
      if (item.quantity > check.availableQuantity) {
        result.warnings.push(`"${check.productName}" đã được điều chỉnh về số lượng tối đa.`);
      }

      const existing = await repo.findByUserAndVariant(userId, item.productVariantId);
      if (existing) {
        const safeQty = Math.min(existing.quantity + finalQty, check.availableQuantity);
        await repo.update(existing.id, { quantity: safeQty, unitPrice: check.currentPrice });
      } else {
        await repo.create({ userId, productVariantId: item.productVariantId, quantity: finalQty, unitPrice: check.currentPrice });
      }
      result.synced++;
    } catch (error) {
      result.failed++;
    }
  }
  return result;
};

export const updateCartItem = async (userId: string, cartItemId: string, input: UpdateCartItemInput) => {
  const item = await repo.findById(cartItemId);
  if (!item || item.userId !== userId) throw new BadRequestError("Không có quyền chỉnh sửa");

  const check = await validateCartItemStatus(item.productVariantId, input.quantity);
  if (!check.isValid) throw new BadRequestError(check.errors.join(", "));

  const updated = await repo.update(cartItemId, { quantity: input.quantity, unitPrice: check.currentPrice });
  return repo.transformToCartResponse(updated);
};

export const changeCartItemVariant = async (userId: string, cartItemId: string, input: ChangeVariantInput) => {
  const oldItem = await repo.findById(cartItemId);
  if (!oldItem || oldItem.userId !== userId) throw new BadRequestError("Không tìm thấy sản phẩm trong giỏ hàng");

  const check = await validateCartItemStatus(input.newVariantId, input.quantity);
  if (!check.isValid) throw new BadRequestError(check.errors.join(", "));

  const existingNewVariantItem = await repo.findByUserAndVariant(userId, input.newVariantId);

  if (existingNewVariantItem && existingNewVariantItem.id !== cartItemId) {
    const newQty = existingNewVariantItem.quantity + input.quantity;
    const safeQty = Math.min(newQty, check.availableQuantity);
    
    const updated = await repo.update(existingNewVariantItem.id, { 
      quantity: safeQty, 
      unitPrice: check.currentPrice 
    });
    
    await repo.remove(cartItemId);
    
    return repo.transformToCartResponse(updated);
  } else {
    const safeQty = Math.min(input.quantity, check.availableQuantity);
    const updated = await repo.update(cartItemId, { 
      productVariantId: input.newVariantId, 
      quantity: safeQty, 
      unitPrice: check.currentPrice 
    });
    
    return repo.transformToCartResponse(updated);
  }
};

export const removeFromCart = (userId: string, id: string) => repo.remove(id);

export const clearCart = (userId: string) => repo.clearCart(userId);