// Wishlist Response Types
export interface WishlistItem {
  id: string;
  userId: string;
  productVariantId: string;
  createdAt: Date;
  productVariant: {
    id: string;
    productId: string;
    code: string | null;
    price: any; // Decimal from Prisma
    soldCount: number;
    weight: any | null; // Decimal from Prisma
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    product: {
      id: string;
      brandId: string;
      name: string;
      description: string | null;
      slug: string;
      viewsCount: any; // BigInt from Prisma
      ratingAverage: any; // Decimal from Prisma
      ratingCount: number;
      isActive: boolean;
      isFeatured: boolean;
      createdAt: Date;
      updatedAt: Date;
      brand: {
        id: string;
        name: string;
        slug: string;
        brandImage: string | null;
      };
    };
    images: Array<{
      id: string;
      imageUrl: string;
      altText: string | null;
      position: number;
    }>;
  };
}

export interface WishlistResponse {
  data: WishlistItem[];
  total: number;
  message: string;
}

export interface AddToWishlistResponse {
  data: WishlistItem;
  message: string;
}

export interface RemoveFromWishlistResponse {
  message: string;
}

export interface AddToWishlistInput {
  productVariantId: string;
}

export interface RemoveFromWishlistInput {
  productVariantId: string;
}
