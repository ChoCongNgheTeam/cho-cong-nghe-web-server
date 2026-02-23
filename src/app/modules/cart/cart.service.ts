import * as repo from "./cart.repository";
import prisma from "@/config/db";
import { AddToCartInput, UpdateCartItemInput, LocalStorageCartItem, SyncCartResult } from "./cart.types";

export const validateCartItemStatus = async (variantId: string, quantity: number) => {
  const variant = await prisma.products_variants.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) throw new Error("Sản phẩm không tồn tại");

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
  const items = await repo.findByUserId(userId);
  const formattedItems = items.map(repo.transformToCartResponse);

  return {
    items: formattedItems,
    totalItems: formattedItems.length,
    totalQuantity: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: formattedItems.reduce((sum, item) => sum + item.totalPrice, 0),
  };
};

export const addToCart = async (userId: string, input: AddToCartInput) => {
  const check = await validateCartItemStatus(input.productVariantId, input.quantity);
  if (!check.isValid) throw new Error(check.errors.join(", "));

  const existing = await repo.findByUserAndVariant(userId, input.productVariantId);

  if (existing) {
    const newQty = existing.quantity + input.quantity;
    if (check.availableQuantity < newQty) throw new Error("Vượt quá số lượng tồn kho");
    
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
  if (!item || item.userId !== userId) throw new Error("Không có quyền chỉnh sửa");

  const check = await validateCartItemStatus(item.productVariantId, input.quantity);
  if (!check.isValid) throw new Error(check.errors.join(", "));

  const updated = await repo.update(cartItemId, { quantity: input.quantity, unitPrice: check.currentPrice });
  return repo.transformToCartResponse(updated);
};

export const removeFromCart = (userId: string, id: string) => repo.remove(id);

export const clearCart = (userId: string) => repo.clearCart(userId);