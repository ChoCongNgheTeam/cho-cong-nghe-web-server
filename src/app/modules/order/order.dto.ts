import { Prisma } from "@prisma/client";

export type CreateOrderDTO = {
  userId: string;
  paymentMethodId: string;
  shippingAddressId: string;
  voucherId?: string;

  subtotalAmount: Prisma.Decimal;
  shippingFee: Prisma.Decimal;
  voucherDiscount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;

  orderItems: {
    productVariantId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
  }[];
};
