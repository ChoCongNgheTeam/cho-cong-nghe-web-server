import * as repo from "./user-address.repository";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";

/**
 * Lấy tất cả địa chỉ của user
 */
export const getUserAddresses = async (userId: string) => {
  const addresses = await repo.findByUserId(userId);
  return {
    data: addresses,
    total: addresses.length,
  };
};

/**
 * Lấy một địa chỉ
 */
export const getAddress = async (addressId: string, userId: string) => {
  const address = await repo.findById(addressId);

  if (!address) {
    throw new Error("Địa chỉ không tồn tại");
  }

  if (address.userId !== userId) {
    throw new Error("Bạn không có quyền truy cập địa chỉ này");
  }

  return address;
};

/**
 * Tạo mới địa chỉ
 */
export const createAddress = async (userId: string, input: CreateAddressInput) => {
  return repo.create(userId, input);
};

/**
 * Cập nhật địa chỉ
 */
export const updateAddress = async (
  addressId: string,
  userId: string,
  input: UpdateAddressInput
) => {
  const address = await repo.findById(addressId);

  if (!address) {
    throw new Error("Địa chỉ không tồn tại");
  }

  if (address.userId !== userId) {
    throw new Error("Bạn không có quyền cập nhật địa chỉ này");
  }

  return repo.update(addressId, userId, input);
};

/**
 * Xóa địa chỉ
 */
export const deleteAddress = async (addressId: string, userId: string) => {
  const address = await repo.findById(addressId);

  if (!address) {
    throw new Error("Địa chỉ không tồn tại");
  }

  if (address.userId !== userId) {
    throw new Error("Bạn không có quyền xóa địa chỉ này");
  }

  return repo.remove(addressId);
};

/**
 * Đặt địa chỉ mặc định
 */
export const setDefaultAddress = async (addressId: string, userId: string) => {
  const address = await repo.findById(addressId);

  if (!address) {
    throw new Error("Địa chỉ không tồn tại");
  }

  if (address.userId !== userId) {
    throw new Error("Bạn không có quyền cập nhật địa chỉ này");
  }

  return repo.setDefault(addressId, userId);
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = async (userId: string) => {
  const address = await repo.findDefaultAddress(userId);

  if (!address) {
    throw new Error("Chưa có địa chỉ mặc định");
  }

  return address;
};
