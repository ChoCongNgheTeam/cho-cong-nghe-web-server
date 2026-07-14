// API response
export interface CartResponse {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandId?: string;
  brandName: string;
  categoryId?: string;
  categoryPath?: string[];
  variantCode?: string;
  variantAttributes?: Array<{ code: string; value: string }>;
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

// Kết quả trả về khi gọi Sync Local -> DB
export interface SyncCartResult {
  synced: number;
  failed: number;
  warnings: string[];
}
