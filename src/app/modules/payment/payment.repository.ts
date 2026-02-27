import prisma from "@/config/db";
import { Prisma, PaymentTransactionStatus } from "@prisma/client";

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

export const findAllPaymentMethods = async () => {
  return prisma.payment_methods.findMany({
    select: paymentMethodSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const findActivePaymentMethods = async () => {
  return prisma.payment_methods.findMany({
    where: { isActive: true },
    select: paymentMethodSelect,
    orderBy: { createdAt: "asc" },
  });
};

export const findPaymentMethodById = async (id: string) => {
  return prisma.payment_methods.findUnique({
    where: { id },
    select: paymentMethodSelect,
  });
};

export const createPaymentMethod = async (data: { name: string; description?: string; isActive: boolean }) => {
  return prisma.payment_methods.create({
    data,
    select: paymentMethodSelect,
  });
};

export const updatePaymentMethod = async (id: string, data: Prisma.payment_methodsUpdateInput) => {
  return prisma.payment_methods.update({
    where: { id },
    data,
    select: paymentMethodSelect,
  });
};

export const deletePaymentMethod = async (id: string) => {
  return prisma.payment_methods.delete({
    where: { id },
  });
};

// Payment Transactions
export const createPaymentTransaction = async (data: {
  orderId: string;
  paymentMethodId: string;
  amount: Prisma.Decimal;
  transactionRef?: string;
  status: PaymentTransactionStatus;
  payload?: Prisma.InputJsonValue;
}) => {
  return prisma.payment_transactions.create({
    data,
    select: paymentTransactionSelect,
  });
};

export const findTransactionByOrderId = async (orderId: string) => {
  return prisma.payment_transactions.findFirst({
    where: { orderId },
    select: paymentTransactionSelect,
    orderBy: { createdAt: "desc" },
  });
};
