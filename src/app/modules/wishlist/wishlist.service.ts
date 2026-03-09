import * as wishlistRepo from "./wishlist.repository";
import { NotFoundError, DuplicateError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import { WishlistItem } from "./wishlist.types";

export const getWishlist = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  // Chạy song song 2 query để tối ưu thời gian phản hồi
  const [items, total] = await Promise.all([
    wishlistRepo.getWishlistByUserId(userId, skip, limit).catch(handlePrismaError),
    wishlistRepo.countWishlistByUserId(userId).catch(handlePrismaError),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const addToWishlist = async (userId: string, productId: string): Promise<WishlistItem> => {
  const product = await wishlistRepo.checkProductExists(productId);
  
  if (!product) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }

  if (!product.isActive) {
    throw new BadRequestError("Sản phẩm đã ngừng kinh doanh, không thể thêm vào danh sách yêu thích");
  }

  const isInWishlist = await wishlistRepo.isInWishlist(userId, productId);
  if (isInWishlist) {
    throw new DuplicateError("Sản phẩm đã có trong danh sách yêu thích");
  }

  return wishlistRepo.addToWishlist(userId, productId).catch(handlePrismaError);
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  const isInWishlist = await wishlistRepo.isInWishlist(userId, productId);
  if (!isInWishlist) {
    throw new NotFoundError("Sản phẩm không có trong danh sách yêu thích");
  }

  await wishlistRepo.removeFromWishlist(userId, productId).catch(handlePrismaError);
};

export const checkInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  return wishlistRepo.isInWishlist(userId, productId).catch(handlePrismaError);
};