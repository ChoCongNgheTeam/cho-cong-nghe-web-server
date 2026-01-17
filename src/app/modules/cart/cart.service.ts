import * as repo from "./cart.repository";
import { AddToCartInput, UpdateCartItemInput, CartResponse, CartSummary } from "./cart.types";
import prisma from "@/config/db";

/**
 * Lấy giỏ hàng của user
 */
export const getCart = async (userId: string) => {
  const items = await repo.findByUserId(userId);
  
  return {
    items: items.map(repo.transformToCartResponse),
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce(
      (sum, item) => sum + item.quantity * Number(item.unitPrice),
      0
    ),
  } as CartSummary;
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const addToCart = async (userId: string, input: AddToCartInput) => {
  // Kiểm tra variant có tồn tại không
  const variant = await prisma.products_variants.findUnique({
    where: { id: input.productVariantId },
    select: {
      id: true,
      price: true,
      isActive: true,
      product: { select: { isActive: true } },
      inventory: { select: { quantity: true, reservedQuantity: true } },
    },
  });

  if (!variant) {
    throw new Error("Sản phẩm không tồn tại");
  }

  if (!variant.isActive || !variant.product.isActive) {
    throw new Error("Sản phẩm hiện không khả dụng");
  }

  const availableQuantity =
    (variant.inventory?.quantity || 0) -
    (variant.inventory?.reservedQuantity || 0);

  if (availableQuantity < input.quantity) {
    throw new Error(
      `Sản phẩm chỉ còn ${availableQuantity} sản phẩm trong kho`
    );
  }

  // Kiểm tra xem item đã có trong giỏ hàng không
  const existingItem = await repo.findByUserAndVariant(
    userId,
    input.productVariantId
  );

  if (existingItem) {
    // Nếu có rồi, tăng số lượng
    const newQuantity = existingItem.quantity + input.quantity;

    if (availableQuantity < newQuantity) {
      throw new Error(
        `Sản phẩm chỉ còn ${availableQuantity} sản phẩm trong kho`
      );
    }

    const updated = await repo.update(existingItem.id, {
      quantity: newQuantity,
    });

    return repo.transformToCartResponse(updated);
  }

  // Nếu chưa có, tạo mới
  const newItem = await repo.create({
    userId,
    productVariantId: input.productVariantId,
    quantity: input.quantity,
    unitPrice: Number(variant.price),
  });

  return repo.transformToCartResponse(newItem);
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  input: UpdateCartItemInput
) => {
  const item = await repo.findById(cartItemId);

  if (!item) {
    throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
  }

  if (item.userId !== userId) {
    throw new Error("Bạn không có quyền cập nhật sản phẩm này");
  }

  // Kiểm tra số lượng tồn kho
  const variant = await prisma.products_variants.findUnique({
    where: { id: item.productVariantId },
    select: {
      inventory: { select: { quantity: true, reservedQuantity: true } },
    },
  });

  const availableQuantity =
    (variant?.inventory?.quantity || 0) -
    (variant?.inventory?.reservedQuantity || 0);

  if (availableQuantity < input.quantity) {
    throw new Error(
      `Sản phẩm chỉ còn ${availableQuantity} sản phẩm trong kho`
    );
  }

  const updated = await repo.update(cartItemId, {
    quantity: input.quantity,
  });

  return repo.transformToCartResponse(updated);
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export const removeFromCart = async (userId: string, cartItemId: string) => {
  const item = await repo.findById(cartItemId);

  if (!item) {
    throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
  }

  if (item.userId !== userId) {
    throw new Error("Bạn không có quyền xóa sản phẩm này");
  }

  await repo.remove(cartItemId);

  return { message: "Sản phẩm đã được xóa khỏi giỏ hàng" };
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCart = async (userId: string) => {
  await repo.clearCart(userId);
  return { message: "Giỏ hàng đã được làm trống" };
};

/**
 * Kiểm tra tính hợp lệ của giỏ hàng (dùng trước khi checkout)
 */
export const validateCart = async (userId: string) => {
  const items = await repo.findByUserId(userId);

  if (items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  const invalidItems = [];

  for (const item of items) {
    const availableQuantity =
      (item.productVariant.inventory?.quantity || 0) -
      (item.productVariant.inventory?.reservedQuantity || 0);

    if (item.quantity > availableQuantity) {
      invalidItems.push({
        productName: item.productVariant.product.name,
        requested: item.quantity,
        available: availableQuantity,
      });
    }
  }

  if (invalidItems.length > 0) {
    throw new Error(
      `Một số sản phẩm không đủ số lượng: ${JSON.stringify(invalidItems)}`
    );
  }

  return {
    isValid: true,
    items: items.map(repo.transformToCartResponse),
  };
};
