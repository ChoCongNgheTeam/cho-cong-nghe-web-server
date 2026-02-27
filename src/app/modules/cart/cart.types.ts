import { Decimal } from "@prisma/client/runtime/library";

// Database cart item
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
      // ... giữ nguyên ...
      id: string;
      name: string;
      slug: string;
      brand: { id: string; name: string };
      img: Array<{ id: string; imageUrl: string | null; altText: string | null }>;
    };
    variantAttributes: Array<{
      attributeOption: {
        label: string;
        value: string;
        attribute?: {
          name?: string;
          code?: string | null; // Đổi type thành code
        }
      };
    }>;
    quantity: number;
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
  storage?: string;       
  storageValue?: string;
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

export interface LocalStorageCartItem {
  productVariantId: string;
  quantity: number;
  addedAt?: number;
}

// Kết quả trả về khi gọi Sync Local -> DB
export interface SyncCartResult {
  synced: number;
  failed: number;
  warnings: string[];
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