export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariantImage {
  id: string;
  imageUrl: string;
  altText?: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  code?: string;
  price: number;
  weight?: number;
  isDefault: boolean;
  isActive: boolean;
  images: ProductVariantImage[];
  inventory?: {
    quantity: number;
    reservedQuantity: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  slug: string;
  brandId: string;
  brand: {
    id: string;
    name: string;
  };
  viewsCount: bigint;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  productCategories: {
    category: ProductCategory;
    isPrimary: boolean;
  }[];
  variants: ProductVariant[];
  highlights: ProductHighlight[];
}
export interface Highlight {
  id: string;
  key: string;
  title: string;
  icon?: string | null;
}

export interface ProductHighlight {
  highlight: Highlight;
  value?: string | null;
}