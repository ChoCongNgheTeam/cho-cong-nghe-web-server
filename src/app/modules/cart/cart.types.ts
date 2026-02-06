import { Decimal } from "@prisma/client/runtime/library";

// Database cart item (Chỉ còn userId)
export interface CartItem {
  id: string;
  userId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: Decimal | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  productVariant: {
    id: string;
    code: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      brand: {
        id: string;
        name: string;
      };
    };
    images: Array<{
      id: string;
      imageUrl: string | null;
      altText: string | null;
    }>;
    variantAttributes: Array<{
      attributeOption: {
        attribute: {
          name: string;
        };
        label: string;
        value: string;
      };
    }>;
    inventory: {
      quantity: number;
      reservedQuantity: number;
    } | null;
  };
}

// API response
export interface CartResponse {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandName: string;
  variantCode?: string;
  image?: string;
  color?: string;
  colorValue?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  items: CartResponse[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
}

// LocalStorage & Sync types
export interface ValidatedLocalStorageCart {
  validItems: CartResponse[];
  invalidItems?: Array<{
    productVariantId: string;
    productName: string;
    reason: string;
  }>;
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  hasErrors: boolean;
}

export interface LocalStorageCartItem {
  productVariantId: string;
  quantity: number;
  addedAt?: number;
  // Các field khác (name, price...) FE tự lưu để hiển thị nhanh, BE chỉ cần ID và Qty để validate
}

// Input types
export type AddToCartInput = {
  productVariantId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export type ValidateItemInput = {
  productVariantId: string;
  quantity: number;
};

export type SyncCartInput = {
  items: LocalStorageCartItem[];
};