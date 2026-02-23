import prisma from "@/config/db";
import { WishlistItem } from "./wishlist.types";

// Get user's wishlist with product variant details
export const getWishlistByUserId = async (userId: string): Promise<WishlistItem[]> => {
  return prisma.wishlist.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      productVariantId: true,
      createdAt: true,
      productVariant: {
        select: {
          id: true,
          productId: true,
          code: true,
          price: true,
          soldCount: true,
          weight: true,
          isDefault: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              brandId: true,
              name: true,
              description: true,
              slug: true,
              viewsCount: true,
              ratingAverage: true,
              ratingCount: true,
              isActive: true,
              isFeatured: true,
              createdAt: true,
              updatedAt: true,
              brand: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  brandImage: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as Promise<WishlistItem[]>;
};

// Add product variant to wishlist
export const addToWishlist = async (userId: string, productVariantId: string): Promise<WishlistItem> => {
  return prisma.wishlist.create({
    data: {
      userId,
      productVariantId,
    },
    select: {
      id: true,
      userId: true,
      productVariantId: true,
      createdAt: true,
      productVariant: {
        select: {
          id: true,
          productId: true,
          code: true,
          price: true,
          soldCount: true,
          weight: true,
          isDefault: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              brandId: true,
              name: true,
              description: true,
              slug: true,
              viewsCount: true,
              ratingAverage: true,
              ratingCount: true,
              isActive: true,
              isFeatured: true,
              createdAt: true,
              updatedAt: true,
              brand: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  brandImage: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  }) as Promise<WishlistItem>;
};

// Remove product variant from wishlist
export const removeFromWishlist = async (userId: string, productVariantId: string) => {
  return prisma.wishlist.delete({
    where: {
      userId_productVariantId: {
        userId,
        productVariantId,
      },
    },
  });
};

// Check if product variant exists in wishlist
export const isInWishlist = async (userId: string, productVariantId: string): Promise<boolean> => {
  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productVariantId: {
        userId,
        productVariantId,
      },
    },
  });

  return !!wishlistItem;
};

// Check if product variant exists and is active
export const checkProductVariantExists = async (productVariantId: string) => {
  return prisma.products_variants.findUnique({
    where: {
      id: productVariantId,
    },
    include: {
      product: {
        select: {
          isActive: true,
        },
      },
    },
  });
};
