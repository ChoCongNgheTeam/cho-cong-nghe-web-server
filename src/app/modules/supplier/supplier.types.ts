import { Prisma } from "@prisma/client";

export const supplierSelectAdmin = {
  id: true,
  code: true,
  name: true,
  contactName: true,
  phone: true,
  email: true,
  address: true,
  taxCode: true,
  note: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
} satisfies Prisma.suppliersSelect;

export const supplierSelectLite = {
  id: true,
  code: true,
  name: true,
  isActive: true,
} satisfies Prisma.suppliersSelect;

export type SupplierAdminRow = Prisma.suppliersGetPayload<{ select: typeof supplierSelectAdmin }>;
export type SupplierLiteRow = Prisma.suppliersGetPayload<{ select: typeof supplierSelectLite }>;
