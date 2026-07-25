import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { supplierSelectAdmin, supplierSelectLite } from "./supplier.types";
import { CreateSupplierInput, UpdateSupplierInput, ListSuppliersQuery } from "./supplier.validation";

const buildWhere = (query: ListSuppliersQuery): Prisma.suppliersWhereInput => {
  const where: Prisma.suppliersWhereInput = {};

  if (!query.includeDeleted) where.deletedAt = null;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

export const checkCodeExists = async (code: string, excludeId?: string): Promise<boolean> => {
  const supplier = await prisma.suppliers.findFirst({ where: { code, deletedAt: null }, select: { id: true } });
  if (!supplier) return false;
  if (excludeId && supplier.id === excludeId) return false;
  return true;
};

export const findAllAdmin = async (query: ListSuppliersQuery) => {
  const { page = 1, limit = 20, sortBy = "name", sortOrder = "asc" } = query;
  const skip = (page - 1) * limit;
  const where = buildWhere(query);

  const [data, total] = await prisma.$transaction([
    prisma.suppliers.findMany({ where, select: supplierSelectAdmin, orderBy: { [sortBy]: sortOrder }, skip, take: limit }),
    prisma.suppliers.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllActiveLite = async () => {
  return prisma.suppliers.findMany({ where: { isActive: true, deletedAt: null }, select: supplierSelectLite, orderBy: { name: "asc" } });
};

export const findById = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const { includeDeleted = false } = options;
  return prisma.suppliers.findFirst({ where: { id, ...(includeDeleted ? {} : { deletedAt: null }) }, select: supplierSelectAdmin });
};

export const create = async (data: CreateSupplierInput & { code: string }) => {
  return prisma.suppliers.create({
    data: {
      code: data.code,
      name: data.name,
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      taxCode: data.taxCode || null,
      note: data.note || null,
      isActive: data.isActive ?? true,
    },
    select: supplierSelectAdmin,
  });
};

export const update = async (id: string, data: UpdateSupplierInput) => {
  const updateData: Prisma.suppliersUpdateInput = {};
  if (data.code !== undefined) updateData.code = data.code;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.contactName !== undefined) updateData.contactName = data.contactName || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.address !== undefined) updateData.address = data.address || null;
  if (data.taxCode !== undefined) updateData.taxCode = data.taxCode || null;
  if (data.note !== undefined) updateData.note = data.note || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.suppliers.update({ where: { id, deletedAt: null }, data: updateData, select: supplierSelectAdmin });
};

export const softDelete = async (id: string, deletedById: string) => {
  return prisma.suppliers.update({ where: { id, deletedAt: null }, data: { deletedAt: new Date(), deletedBy: deletedById, isActive: false } });
};

export const restore = async (id: string) => {
  return prisma.suppliers.update({ where: { id }, data: { deletedAt: null, deletedBy: null }, select: supplierSelectAdmin });
};

export const countStockMovements = async (supplierId: string): Promise<number> => {
  return prisma.stock_movements.count({ where: { supplierId } });
};
