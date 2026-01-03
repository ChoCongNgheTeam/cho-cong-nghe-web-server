import { Prisma } from "@prisma/client";

export type CreatePaymentMethodInput = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export type UpdatePaymentMethodInput = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export type CreatePaymentTransactionInput = {
  orderId: string;
  paymentMethodId: string;
  amount: Prisma.Decimal;
  transactionRef?: string; // mã giao dịch từ bên thứ 3 (nếu có)
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  payload?: Prisma.JsonValue; // lưu raw payload từ webhook
};
