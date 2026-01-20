import { Decimal } from "@prisma/client/runtime/library";

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
      imageUrl: string;
      altText: string | null;
    }>;
    inventory: {
      quantity: number;
      reservedQuantity: number;
    } | null;
  };
}

export interface CartResponse {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandName: string;
  variantCode?: string;
  image?: string;
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

export type AddToCartInput = {
  productVariantId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};
