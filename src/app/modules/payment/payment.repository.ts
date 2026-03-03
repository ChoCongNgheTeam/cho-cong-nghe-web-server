/**
 * payment.repository.ts
 *
 * Data access layer — tương tác trực tiếp với Prisma.
 * Không chứa business logic.
 */

import prisma from "@/config/db";
import { Prisma, PaymentTransactionStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Selects (reusable)
// ---------------------------------------------------------------------------

const paymentMethodSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.payment_methodsSelect;

export const paymentTransactionSelect = {
  id: true,
  orderId: true,
  paymentMethodId: true,
  amount: true,
  status: true,
  transactionRef: true,
  payload: true,
  createdAt: true,
};

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

export const findAllPaymentMethods = () =>
  prisma.payment_methods.findMany({
    select: paymentMethodSelect,
    orderBy: { createdAt: "desc" },
  });

export const findActivePaymentMethods = () =>
  prisma.payment_methods.findMany({
    where: { isActive: true },
    select: paymentMethodSelect,
    orderBy: { createdAt: "asc" },
  });

export const findPaymentMethodById = (id: string) =>
  prisma.payment_methods.findUnique({
    where: { id },
    select: paymentMethodSelect,
  });

export const createPaymentMethod = (data: { name: string; code: string; description?: string; isActive: boolean }) =>
  prisma.payment_methods.create({
    data,
    select: paymentMethodSelect,
  });

export const updatePaymentMethod = (id: string, data: Prisma.payment_methodsUpdateInput) =>
  prisma.payment_methods.update({
    where: { id },
    data,
    select: paymentMethodSelect,
  });

export const deletePaymentMethod = (id: string) => prisma.payment_methods.delete({ where: { id } });

// ---------------------------------------------------------------------------
// Payment Transactions
// ---------------------------------------------------------------------------

export const createPaymentTransaction = (data: {
  orderId: string;
  paymentMethodId: string;
  amount: Prisma.Decimal | number;
  transactionRef?: string;
  status: PaymentTransactionStatus;
  payload?: Prisma.InputJsonValue;
}) =>
  prisma.payment_transactions.create({
    data,
    select: paymentTransactionSelect,
  });

export const findTransactionByOrderId = (orderId: string) =>
  prisma.payment_transactions.findFirst({
    where: { orderId },
    select: paymentTransactionSelect,
    orderBy: { createdAt: "desc" },
  });

export const findTransactionByRef = (transactionRef: string) =>
  prisma.payment_transactions.findFirst({
    where: { transactionRef },
    select: paymentTransactionSelect,
  });
