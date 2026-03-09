import prisma from "@/config/db";
import { WishlistItem } from "./wishlist.types";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  isActive: true, 
  brandId: true,
  categoryId: true,
  ratingAverage: true,
  ratingCount: true,
  // Thêm mảng hình ảnh vào đây
  img: {
    select: {
      id: true,
      color: true,
      imageUrl: true,
      altText: true,
      position: true,
    },
    orderBy: {
      position: "asc" as const, // Sắp xếp để Frontend dễ lấy ảnh đại diện đầu tiên
    },
  },
};

export const getWishlistByUserId = async (userId: string, skip: number, take: number): Promise<WishlistItem[]> => {
  return prisma.wishlist.findMany({
    where: { userId },
    skip,
    take,
    select: {
      id: true,
      userId: true,
      productId: true,
      createdAt: true,
      product: {
        select: productSelect,
      },
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as Promise<WishlistItem[]>;
};

export const countWishlistByUserId = async (userId: string): Promise<number> => {
  return prisma.wishlist.count({
    where: { userId },
  });
};

export const addToWishlist = async (userId: string, productId: string): Promise<WishlistItem> => {
  return prisma.wishlist.create({
    data: {
      userId,
      productId,
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      createdAt: true,
      product: {
        select: productSelect,
      },
    },
  }) as unknown as Promise<WishlistItem>;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  return prisma.wishlist.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const item = await prisma.wishlist.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });
  return !!item;
};

export const checkProductExists = async (productId: string) => {
  return prisma.products.findUnique({
    where: { id: productId },
    select: { isActive: true },
  });
};