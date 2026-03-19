import prisma from "@/config/db";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";
import { ListAddressesQuery } from "./user-address.validation";

const selectAddressWithRelations = {
  id: true,
  userId: true,
  contactName: true,
  phone: true,
  detailAddress: true,
  type: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  province: {
    select: { id: true, code: true, name: true, fullName: true, type: true },
  },
  ward: {
    select: { id: true, code: true, name: true, fullName: true, type: true },
  },
};

export const findByUserId = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { userId, deletedAt: null },
    select: selectAddressWithRelations,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

export const findAddressById = async (id: string, userId?: string, includeDeleted = false) => {
  return prisma.user_addresses.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
      ...(!includeDeleted ? { deletedAt: null } : {}),
    },
    select: selectAddressWithRelations,
  });
};

export const findDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.findFirst({
    where: { userId, isDefault: true, deletedAt: null },
    select: selectAddressWithRelations,
  });
};

export const createAddress = async (data: CreateAddressInput & { userId: string }) => {
  return prisma.user_addresses.create({ data, select: selectAddressWithRelations });
};

export const updateAddress = async (id: string, data: UpdateAddressInput) => {
  return prisma.user_addresses.update({
    where: { id },
    data: data as any,
    select: selectAddressWithRelations,
  });
};

export const resetDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
};

export const softDeleteAddress = async (id: string, deletedBy: string) => {
  return prisma.user_addresses.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy, isDefault: false },
  });
};

export const restoreAddress = async (id: string) => {
  return prisma.user_addresses.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
  });
};

export const hardDeleteAddress = async (id: string) => {
  return prisma.user_addresses.delete({ where: { id } });
};

// ==================== ADMIN / STAFF REPOSITORY ====================

/**
 * [FIX] Thêm userId vào where clause để filter đúng địa chỉ của user đó.
 * Khi FE gọi ?userId=xxx thì chỉ trả về địa chỉ của user đó, không phải toàn DB.
 */
export const findAllAddressesAdmin = async (query: ListAddressesQuery) => {
  const { search, userId, provinceId, wardId, includeDeleted, page = 1, perPage = 20 } = query;
  const where: any = {};

  if (!includeDeleted) where.deletedAt = null;

  // [FIX] Filter theo userId nếu có
  if (userId) where.userId = userId;

  if (provinceId) where.provinceId = provinceId;
  if (wardId) where.wardId = wardId;
  if (search) {
    where.OR = [{ contactName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }];
  }

  const skip = (page - 1) * perPage;
  const [data, total] = await Promise.all([
    prisma.user_addresses.findMany({
      where,
      skip,
      take: perPage,
      select: selectAddressWithRelations,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.user_addresses.count({ where }),
  ]);

  return { data, total, page, perPage };
};

export const findAllDeletedAddresses = async () => {
  return prisma.user_addresses.findMany({
    where: { deletedAt: { not: null } },
    select: { ...selectAddressWithRelations },
    orderBy: { deletedAt: "desc" },
  });
};

// ==================== LOCATIONS REPOSITORY ====================

export const findAllProvinces = async () => {
  return prisma.provinces.findMany({
    select: { id: true, code: true, name: true, fullName: true, type: true },
    orderBy: { name: "asc" },
  });
};

export const findProvinceById = async (provinceId: string) => {
  return prisma.provinces.findUnique({
    where: { id: provinceId },
    select: { id: true, code: true, name: true, fullName: true, type: true },
  });
};

export const findWardsByProvince = async (provinceId: string, page: number, perPage: number, search?: string) => {
  const skip = (page - 1) * perPage;
  const where: any = { provinceId };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [wards, total] = await Promise.all([
    prisma.wards.findMany({
      where,
      select: { id: true, code: true, name: true, fullName: true, type: true },
      skip,
      take: perPage,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.wards.count({ where }),
  ]);

  return { data: wards, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } };
};

export const findWardById = async (wardId: string) => {
  return prisma.wards.findUnique({
    where: { id: wardId },
    select: { id: true, code: true, name: true, fullName: true, type: true, provinceId: true },
  });
};

export const findProvinceByCode = async (code: string) => prisma.provinces.findUnique({ where: { code } });
export const createProvince = async (data: any) => prisma.provinces.create({ data });
export const findWardByCode = async (code: string) => prisma.wards.findUnique({ where: { code } });
export const createWard = async (data: any) => prisma.wards.create({ data });
