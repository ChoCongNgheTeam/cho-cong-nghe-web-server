import * as wishlistRepo from "./wishlist.repository";
import { NotFoundError, DuplicateError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import { WishlistItem } from "./wishlist.types";

// Get user's wishlist
export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  return wishlistRepo.getWishlistByUserId(userId).catch(handlePrismaError);
};

// Add product variant to wishlist
export const addToWishlist = async (userId: string, productVariantId: string): Promise<WishlistItem> => {
  // Check 1: Business logic - Product variant exists and is active
  const variant = await wishlistRepo.checkProductVariantExists(productVariantId);
  if (!variant) {
    throw new NotFoundError("Sản phẩm");
  }

  if (!variant.product.isActive) {
    throw new BadRequestError("Sản phẩm không khả dụng");
  }

  // Check 1: Business logic - Already in wishlist
  const isInWishlist = await wishlistRepo.isInWishlist(userId, productVariantId);
  if (isInWishlist) {
    throw new DuplicateError("Sản phẩm trong danh sách yêu thích");
  }

  // Check 2: Handle Prisma error - database constraint
  return wishlistRepo.addToWishlist(userId, productVariantId).catch(handlePrismaError);
};

// Remove product variant from wishlist
export const removeFromWishlist = async (userId: string, productVariantId: string): Promise<void> => {
  // Check 1: Business logic - Item exists in wishlist
  const isInWishlist = await wishlistRepo.isInWishlist(userId, productVariantId);
  if (!isInWishlist) {
    throw new NotFoundError("Sản phẩm trong danh sách yêu thích");
  }

  // Check 2: Handle Prisma error - database constraint
  await wishlistRepo.removeFromWishlist(userId, productVariantId).catch(handlePrismaError);
};

// Check if product is in user's wishlist
export const checkInWishlist = async (userId: string, productVariantId: string): Promise<boolean> => {
  return wishlistRepo.isInWishlist(userId, productVariantId).catch(handlePrismaError);
};
