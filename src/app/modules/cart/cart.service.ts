import * as repo from "./cart.repository";
import {
  AddToCartInput,
  UpdateCartItemInput,
  CartSummary,
  LocalStorageCartItem,
  SyncCartResult
} from "./cart.types";
import prisma from "@/config/db";

/**
 * 1. GET: Lấy giỏ hàng từ DB (Logged-in User)
 */
export const getCart = async (userId: string): Promise<CartSummary> => {
  const items = await repo.findByUserId(userId);

  return {
    items: items.map(repo.transformToCartResponse),
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce(
      (sum, item) => sum + item.quantity * Number(item.unitPrice),
      0
    ),
  };
};

/**
 * 2. Helper: Validate chi tiết 1 variant
 */
export const validateCartItem = async (
  productVariantId: string,
  quantity: number
): Promise<any> => {
  const variant = await prisma.products_variants.findUnique({
    where: { id: productVariantId },
    select: {
      id: true,
      code: true,
      price: true,
      quantity: true,
      isActive: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          brand: { select: { name: true } },
          img: { select: { imageUrl: true } },
        },
      },
      variantAttributes: {
        select: {
          attributeOption: {
            select: {
              label: true,
              value: true,
              attribute: {   
                select: {
                  name: true,
                  code: true, 
                }
              }
            },
          },
        },
      },
    },
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

  const colorAttr = variant.variantAttributes.find((attr: any) => {
    const attrName = (attr.attributeOption.attribute?.code || attr.attributeOption.attribute?.name || "").toLowerCase();
    return ["color", "màu", "màu sắc"].includes(attrName);
  });

  return {
    variant,
    productName: variant.product.name,
    availableQuantity: available,
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    colorAttr,
  };
};

/**
 * 3. SYNC: LocalStorage -> Database (Khi User Login)
 * Xử lý Soft Validate: Tự điều chỉnh số lượng nếu vượt tồn kho thay vì quăng lỗi
 */
export const syncLocalStorageToDatabase = async (
  userId: string,
  items: LocalStorageCartItem[]
): Promise<SyncCartResult> => {
  const result: SyncCartResult = { synced: 0, failed: 0, warnings: [] };

  for (const item of items) {
    try {
      const check = await validateCartItem(item.productVariantId, item.quantity);
      
      // Bỏ qua sản phẩm ngưng kinh doanh
      if (!check.variant || !check.variant.isActive || !check.variant.product.isActive) {
        result.failed++;
        result.warnings.push(`"${check.productName || 'Sản phẩm ẩn'}" đã ngừng kinh doanh và bị loại khỏi giỏ hàng.`);
        continue;
      }

      // Xử lý vượt tồn kho
      let finalQuantity = item.quantity;
      if (check.availableQuantity === 0) {
        result.failed++;
        result.warnings.push(`"${check.productName}" đã hết hàng.`);
        continue;
      } else if (item.quantity > check.availableQuantity) {
        finalQuantity = check.availableQuantity;
        result.warnings.push(`"${check.productName}" chỉ còn ${check.availableQuantity} sản phẩm. Đã tự động điều chỉnh.`);
      }

      const existingItem = await repo.findByUserAndVariant(userId, item.productVariantId);

      if (existingItem) {
        // Đảm bảo tổng số lượng (sau khi cộng) không vượt tồn kho
        const newTotalQty = existingItem.quantity + finalQuantity;
        const safeQty = Math.min(newTotalQty, check.availableQuantity);
        
        await repo.update(existingItem.id, { quantity: safeQty, unitPrice: Number(check.variant.price) });
        result.synced++;
      } else {
        await repo.create({
          userId,
          productVariantId: item.productVariantId,
          quantity: finalQuantity,
          unitPrice: Number(check.variant.price),
        });
        result.synced++;
      }
    } catch (error: any) {
      result.failed++;
      console.error(`Lỗi sync item ${item.productVariantId}:`, error.message);
    }
  }
  return result;
};

/**
 * 4. USER: Add to Cart (Database)
 */
export const addToCart = async (userId: string, input: AddToCartInput) => {
  const check = await validateCartItem(input.productVariantId, input.quantity);
  
  if (!check.isValid) {
    throw new Error(check.errors?.join(", "));
  }

  const existingItem = await repo.findByUserAndVariant(userId, input.productVariantId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + input.quantity;
    if (check.availableQuantity < newQuantity) {
      throw new Error(`Kho chỉ còn ${check.availableQuantity}, không đủ thêm.`);
    }
    const updated = await repo.update(existingItem.id, { 
      quantity: newQuantity, 
      unitPrice: Number(check.variant.price) 
    });
    return repo.transformToCartResponse(updated);
  }

  const newItem = await repo.create({
    userId,
    productVariantId: input.productVariantId,
    quantity: input.quantity,
    unitPrice: Number(check.variant.price),
  });

  return repo.transformToCartResponse(newItem);
};

/**
 * 5. USER: Update Cart Item
 */
export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  input: UpdateCartItemInput
) => {
  const item = await repo.findById(cartItemId);
  if (!item || item.userId !== userId) {
    throw new Error("Sản phẩm không tồn tại hoặc không có quyền truy cập");
  }

  const check = await validateCartItem(item.productVariantId, input.quantity);
  if (!check.isValid) {
    throw new Error(check.errors?.join(", "));
  }

  const updated = await repo.update(cartItemId, { 
    quantity: input.quantity,
    unitPrice: Number(check.variant.price) 
  });
  return repo.transformToCartResponse(updated);
};

/**
 * 6. USER: Remove Item
 */
export const removeFromCart = async (userId: string, cartItemId: string) => {
  const item = await repo.findById(cartItemId);
  if (!item || item.userId !== userId) {
    throw new Error("Không tìm thấy sản phẩm");
  }
  await repo.remove(cartItemId);
  return { message: "Đã xóa sản phẩm" };
};

/**
 * 7. USER: Clear Cart
 */
export const clearCart = async (userId: string) => {
  await repo.clearCart(userId);
  return { message: "Giỏ hàng đã được làm trống" };
};