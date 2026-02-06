import * as repo from "./cart.repository";
import {
  AddToCartInput,
  UpdateCartItemInput,
  CartResponse,
  CartSummary,
  LocalStorageCartItem,
  ValidatedLocalStorageCart,
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
 * 2. Helper: Validate chi tiết 1 variant (Dùng chung cho cả Guest và User check)
 */
export const validateCartItem = async (
  productVariantId: string,
  quantity: number
) => {
  const variant = await prisma.products_variants.findUnique({
    where: { id: productVariantId },
    select: {
      id: true,
      code: true,
      price: true,
      isActive: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          brand: { select: { name: true } },
        },
      },
      images: { select: { imageUrl: true }, take: 1 },
      variantAttributes: {
        select: {
          attributeOption: {
            select: {
              attribute: { select: { name: true } },
              label: true,
              value: true,
            },
          },
        },
      },
      inventory: { select: { quantity: true, reservedQuantity: true } },
    },
  });

  if (!variant) throw new Error("Sản phẩm không tồn tại");

  const errors: string[] = [];
  if (!variant.isActive || !variant.product.isActive) {
    errors.push("Sản phẩm ngừng kinh doanh");
  }

  const available =
    (variant.inventory?.quantity || 0) - (variant.inventory?.reservedQuantity || 0);

  if (available < quantity) {
    errors.push(`Chỉ còn ${available} sản phẩm`);
  }

  // Tìm màu sắc
  const colorAttr = variant.variantAttributes.find((attr) =>
    ["color", "màu"].includes(attr.attributeOption.attribute.name.toLowerCase())
  );

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
 * 3. GUEST: Validate toàn bộ localStorage cart
 * FE gửi lên danh sách ID + Qty, BE trả về full info + giá mới nhất
 */
export const validateLocalStorageCart = async (
  items: LocalStorageCartItem[]
): Promise<ValidatedLocalStorageCart> => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      validItems: [],
      totalItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      hasErrors: false,
    };
  }

  const validItems: CartResponse[] = [];
  const invalidItems: Array<{ productVariantId: string; productName: string; reason: string }> = [];

  for (const item of items) {
    try {
      const check = await validateCartItem(item.productVariantId, item.quantity);

      if (!check.isValid) {
        invalidItems.push({
          productVariantId: item.productVariantId,
          productName: check.productName,
          reason: check.errors?.join(", ") || "Invalid",
        });
        continue;
      }

      // Map sang response format
      validItems.push({
        id: `temp-${check.variant.id}`, // ID tạm
        productVariantId: check.variant.id,
        productId: check.variant.product.id,
        productName: check.variant.product.name,
        productSlug: check.variant.product.slug,
        brandName: check.variant.product.brand.name,
        variantCode: check.variant.code || undefined,
        image: check.variant.images[0]?.imageUrl || undefined,
        color: check.colorAttr?.attributeOption.label,
        colorValue: check.colorAttr?.attributeOption.value,
        quantity: item.quantity,
        unitPrice: Number(check.variant.price),
        totalPrice: item.quantity * Number(check.variant.price),
        availableQuantity: check.availableQuantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      invalidItems.push({
        productVariantId: item.productVariantId,
        productName: "Unknown",
        reason: error.message,
      });
    }
  }

  return {
    validItems,
    invalidItems: invalidItems.length > 0 ? invalidItems : undefined,
    totalItems: validItems.length,
    totalQuantity: validItems.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: validItems.reduce((sum, i) => sum + i.totalPrice, 0),
    hasErrors: invalidItems.length > 0,
  };
};

/**
 * 4. SYNC: LocalStorage -> Database (Khi User Login)
 */
export const syncLocalStorageToDatabase = async (
  userId: string,
  items: LocalStorageCartItem[]
) => {
  const result = { synced: 0, failed: 0, errors: [] as any[] };

  for (const item of items) {
    try {
      // Tái sử dụng hàm addToCart để xử lý logic merge/cộng dồn
      await addToCart(userId, {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      });
      result.synced++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({ id: item.productVariantId, reason: error.message });
    }
  }
  return result;
};

/**
 * 5. USER: Add to Cart (Database)
 */
export const addToCart = async (userId: string, input: AddToCartInput) => {
  // Validate Inventory & Price
  const check = await validateCartItem(input.productVariantId, input.quantity);
  
  if (!check.isValid) {
    throw new Error(check.errors?.join(", "));
  }

  // Check existing
  const existingItem = await repo.findByUserAndVariant(userId, input.productVariantId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + input.quantity;
    if (check.availableQuantity < newQuantity) {
      throw new Error(`Kho chỉ còn ${check.availableQuantity}, không đủ thêm.`);
    }
    const updated = await repo.update(existingItem.id, { quantity: newQuantity });
    return repo.transformToCartResponse(updated);
  }

  // Create new
  const newItem = await repo.create({
    userId,
    productVariantId: input.productVariantId,
    quantity: input.quantity,
    unitPrice: Number(check.variant.price),
  });

  return repo.transformToCartResponse(newItem);
};

/**
 * 6. USER: Update Cart Item
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

  // Check inventory cho số lượng mới
  const check = await validateCartItem(item.productVariantId, input.quantity);
  if (!check.isValid) {
    throw new Error(check.errors?.join(", "));
  }

  const updated = await repo.update(cartItemId, { quantity: input.quantity });
  return repo.transformToCartResponse(updated);
};

/**
 * 7. USER: Remove Item
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
 * 8. USER: Clear Cart
 */
export const clearCart = async (userId: string) => {
  await repo.clearCart(userId);
  return { message: "Giỏ hàng đã được làm trống" };
};