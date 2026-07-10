import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";
import { ListAddressesQuery } from "./user-address.validation";

// SELECT SHAPE

const selectAddress = {
  id: true,
  userId: true,
  contactName: true,
  phone: true,
  provinceCode: true,
  provinceName: true,
  wardCode: true,
  wardName: true,
  detailAddress: true,
  type: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.user_addressesSelect;

// Type suy ra trực tiếp từ select — dùng thay cho `any` ở service
export type AddressRecord = Prisma.user_addressesGetPayload<{ select: typeof selectAddress }>;

// USER ADDRESS REPOSITORY

export const findByUserId = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { userId, deletedAt: null },
    select: selectAddress,
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
    select: selectAddress,
  });
};

export const findDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.findFirst({
    where: { userId, isDefault: true, deletedAt: null },
    select: selectAddress,
  });
};

export const createAddress = async (
  data: CreateAddressInput & {
    userId: string;
    provinceName: string;
    wardName: string;
  },
) => {
  return prisma.user_addresses.create({ data, select: selectAddress });
};

export const updateAddress = async (id: string, data: Partial<UpdateAddressInput & { provinceName?: string; wardName?: string; isDefault?: boolean }>) => {
  return prisma.user_addresses.update({
    where: { id },
    data: data as Prisma.user_addressesUpdateInput,
    select: selectAddress,
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

// ADMIN / STAFF REPOSITORY

export const findAllAddressesAdmin = async (query: ListAddressesQuery) => {
  const { search, userId, provinceCode, wardCode, includeDeleted, page = 1, perPage = 20 } = query;
  const where: Prisma.user_addressesWhereInput = {};

  if (!includeDeleted) where.deletedAt = null;
  if (userId) where.userId = userId;
  if (provinceCode) where.provinceCode = provinceCode;
  if (wardCode) where.wardCode = wardCode;
  if (search) {
    where.OR = [{ contactName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }];
  }

  const skip = (page - 1) * perPage;
  const [data, total] = await prisma.$transaction([
    prisma.user_addresses.findMany({
      where,
      skip,
      take: perPage,
      select: selectAddress,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.user_addresses.count({ where }),
  ]);

  return { data, total, page, perPage };
};

export const findAllDeletedAddresses = async (page = 1, perPage = 20) => {
  const skip = (page - 1) * perPage;
  const where: Prisma.user_addressesWhereInput = { deletedAt: { not: null } };

  const [data, total] = await prisma.$transaction([
    prisma.user_addresses.findMany({
      where,
      skip,
      take: perPage,
      select: selectAddress,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.user_addresses.count({ where }),
  ]);

  return { data, total, page, perPage };
};
