// =====================
// === SHARED TYPES ===
// =====================

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface VariantImage {
  id: string;
  imageUrl: string;
  altText?: string;
  position: number;
}

export interface Inventory {
  quantity: number;
  reservedQuantity: number;
  available: number;
}

export interface AvailableOption {
  attribute: string;
  values: AvailableOptionValue[];
}

export interface AvailableOptionValue {
  id: string;
  value: string;
  label?: string;
  variantIds: string[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductGallery {
  id: string;
  imageUrl: string;
  altText?: string;
  position: number;
}

// =====================
// === VARIANT TYPES ===
// =====================

export interface ProductVariant {
  id: string;
  code: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  weight?: number;
  soldCount: number;
  isDefault: boolean;
  isActive: boolean;
  available: boolean;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  inventory: Inventory;
  images: VariantImage[];
}

// =====================
// === HIGHLIGHT/SPEC TYPES ===
// =====================

export interface Specification {
  id: string;
  key: string;
  name: string;
  icon?: string;
  unit?: string;
  value: string;
  isHighlight?: boolean;
  highlightOrder?: number;
}

export interface Highlight {
  id: string;
  key: string;
  name: string;
  icon?: string;
  unit?: string;
  value?: string;
}

// =====================
// === REVIEW TYPES ===
// =====================

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isApproved: string;
  createdAt: Date;
  user: {
    id: string;
    fullName?: string;
    avatarImage?: string;
  };
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// =====================
// === PRODUCT LIST ===
// =====================

export interface ProductCardHighlight {
  key: string;
  name: string;
  icon?: string | null;
  value?: string;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  price: number;
  originalPrice?: number;
  discount?: number;
  thumbnail: string;
  rating: {
    average: number;
    count: number;
  };
  isFeatured: boolean;
  isNew?: boolean;
  highlights: ProductCardHighlight[];
  inStock: boolean;
}

// =====================
// === PRODUCT DETAIL ===
// =====================

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: Brand;
  category: Category[];
  availableOptions: AvailableOption[];
  highlights: Highlight[];
  priceRange: PriceRange;
  warranty?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  currentVariant: ProductVariant;
  rating: ReviewStats;
  viewsCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  canReview?: boolean;
  orderItemId?: string | null;
}

export interface ProductSpecificationGroup {
  groupName: string;
  items: {
    id: string;
    key: string;
    name: string;
    icon?: string;
    unit?: string;
    value: string | null;
  }[];
}

// =====================
// === RESPONSE TYPES ===
// =====================

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse extends PaginatedResponse<ProductCard> {
  filters?: {
    brands: { id: string; name: string; count: number }[];
    categories: { id: string; name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
}

// =====================
// === RAW DB TYPES ===
// =====================

export interface RawVariantAttribute {
  attributeOption: {
    id: string;
    value: string;
    label: string;
    attribute: {
      id: string;
      name: string;
    };
  };
}

export interface RawVariant {
  id: string;
  code: string;
  price: any;
  soldCount: number;
  isDefault: boolean;
  isActive: boolean;
  inventory?: {
    quantity: number;
    reservedQuantity: number;
  };
  images: VariantImage[];
  variantAttributes: RawVariantAttribute[];
}
