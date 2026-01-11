import * as wishlistRepo from "./wishlist.repository";
import { WishlistItem } from "./wishlist.types";

// Get user's wishlist
export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  return wishlistRepo.getWishlistByUserId(userId);
};

// Add product variant to wishlist
export const addToWishlist = async (userId: string, productVariantId: string): Promise<WishlistItem> => {
  // Check if product variant exists and is active
  const variant = await wishlistRepo.checkProductVariantExists(productVariantId);
  if (!variant) {
    const error = new Error("Sản phẩm không tồn tại");
    (error as any).statusCode = 404;
    throw error;
  }

  if (!variant.product.isActive) {
    const error = new Error("Sản phẩm không khả dụng");
    (error as any).statusCode = 400;
    throw error;
  }

  // Check if already in wishlist
  const isInWishlist = await wishlistRepo.isInWishlist(userId, productVariantId);
  if (isInWishlist) {
    const error = new Error("Sản phẩm đã có trong danh sách yêu thích");
    (error as any).statusCode = 409;
    throw error;
  }

  return wishlistRepo.addToWishlist(userId, productVariantId);
};

// Remove product variant from wishlist
export const removeFromWishlist = async (userId: string, productVariantId: string): Promise<void> => {
  // Check if item exists in wishlist
  const isInWishlist = await wishlistRepo.isInWishlist(userId, productVariantId);
  if (!isInWishlist) {
    const error = new Error("Sản phẩm không có trong danh sách yêu thích");
    (error as any).statusCode = 404;
    throw error;
  }

  await wishlistRepo.removeFromWishlist(userId, productVariantId);
};

// Check if product is in user's wishlist
export const checkInWishlist = async (userId: string, productVariantId: string): Promise<boolean> => {
  return wishlistRepo.isInWishlist(userId, productVariantId);
};
