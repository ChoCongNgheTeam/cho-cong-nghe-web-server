import prisma from "@/config/db";
import { UserAddress, CreateAddressInput, UpdateAddressInput } from "./user-address.types";

const selectAddress = {
  id: true,
  userId: true,
  contactName: true,
  phone: true,
  provinceId: true,
  districtId: true,
  wardId: true,
  detailAddress: true,
  type: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Lấy tất cả địa chỉ của user
 */
export const findByUserId = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { userId },
    select: selectAddress,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

/**
 * Lấy một địa chỉ
 */
export const findById = async (addressId: string) => {
  return prisma.user_addresses.findUnique({
    where: { id: addressId },
    select: selectAddress,
  });
};

/**
 * Tạo mới địa chỉ
 */
export const create = async (userId: string, data: CreateAddressInput) => {
  // Nếu isDefault = true, set các địa chỉ khác thành false
  if (data.isDefault) {
    await prisma.user_addresses.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.user_addresses.create({
    data: {
      userId,
      ...data,
    },
    select: selectAddress,
  });
};

/**
 * Cập nhật địa chỉ
 */
export const update = async (
  addressId: string,
  userId: string,
  data: UpdateAddressInput
) => {
  // Nếu isDefault = true, set các địa chỉ khác thành false
  if (data.isDefault) {
    await prisma.user_addresses.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  return prisma.user_addresses.update({
    where: { id: addressId },
    data,
    select: selectAddress,
  });
};

/**
 * Xóa địa chỉ
 */
export const remove = async (addressId: string) => {
  const address = await prisma.user_addresses.findUnique({
    where: { id: addressId },
    select: { isDefault: true, userId: true },
  });

  await prisma.user_addresses.delete({
    where: { id: addressId },
  });

  // Nếu xoá địa chỉ mặc định, set địa chỉ gần đây nhất thành mặc định
  if (address?.isDefault) {
    const latestAddress = await prisma.user_addresses.findFirst({
      where: { userId: address.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (latestAddress) {
      await prisma.user_addresses.update({
        where: { id: latestAddress.id },
        data: { isDefault: true },
      });
    }
  }

  return { message: "Địa chỉ đã được xóa" };
};

/**
 * Đặt địa chỉ mặc định
 */
export const setDefault = async (addressId: string, userId: string) => {
  // Set địa chỉ mới là default
  await prisma.user_addresses.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.user_addresses.update({
    where: { id: addressId },
    data: { isDefault: true },
    select: selectAddress,
  });
};

/**
 * Lấy địa chỉ mặc định
 */
export const findDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.findFirst({
    where: { userId, isDefault: true },
    select: selectAddress,
  });
};
