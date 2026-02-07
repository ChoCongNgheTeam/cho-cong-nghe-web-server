import * as repo from "./user-address.repository";
import { CreateAddressInput, UpdateAddressInput, AddressResponse } from "./user-address.types";
import { CreateProvinceInput, CreateWardInput } from "./user-address.validation";


/**
 * Format full address từ province, ward, và detail address
 */
const formatFullAddress = (address: any): string => {
  return `${address.detailAddress}, ${address.ward.fullName}, ${address.province.fullName}`;
};

/**
 * Format address response
 */
const formatAddressResponse = (address: any): AddressResponse => {
  return {
    id: address.id,
    contactName: address.contactName,
    phone: address.phone,
    province: {
      id: address.province.id,
      name: address.province.name,
      fullName: address.province.fullName,
    },
    ward: {
      id: address.ward.id,
      name: address.ward.name,
      fullName: address.ward.fullName,
    },
    detailAddress: address.detailAddress,
    fullAddress: formatFullAddress(address),
    type: address.type,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
};

// ==================== ADDRESS SERVICE ====================

/**
 * Lấy tất cả địa chỉ của user
 */
export const getUserAddresses = async (userId: string) => {
  const addresses = await repo.findByUserId(userId);
  
  return {
    data: addresses.map(formatAddressResponse),
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

  return formatAddressResponse(address);
};

/**
 * Tạo mới địa chỉ
 */
export const createAddress = async (userId: string, input: CreateAddressInput) => {
  // Kiểm tra province tồn tại
  const province = await repo.findProvinceById(input.provinceId);
  if (!province) {
    throw new Error("Tỉnh/Thành phố không tồn tại");
  }

  // Kiểm tra ward tồn tại
  const ward = await repo.findWardById(input.wardId);
  if (!ward) {
    throw new Error("Phường/Xã không tồn tại");
  }

  const address = await repo.create(userId, input);
  return formatAddressResponse(address);
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

  // Validate province nếu update
  if (input.provinceId) {
    const province = await repo.findProvinceById(input.provinceId);
    if (!province) {
      throw new Error("Tỉnh/Thành phố không tồn tại");
    }
  }

  // Validate ward nếu update
  if (input.wardId) {
    const ward = await repo.findWardById(input.wardId);
    if (!ward) {
      throw new Error("Phường/Xã không tồn tại");
    }
  }

  const updatedAddress = await repo.update(addressId, userId, input);
  return formatAddressResponse(updatedAddress);
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

  const updatedAddress = await repo.setDefault(addressId, userId);
  return formatAddressResponse(updatedAddress);
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = async (userId: string) => {
  const address = await repo.findDefaultAddress(userId);

  if (!address) {
    throw new Error("Chưa có địa chỉ mặc định");
  }

  return formatAddressResponse(address);
};

// ==================== LOCATION SERVICE ====================

/**
 * Lấy tất cả tỉnh/thành phố
 */
export const getProvinces = async () => {
  return repo.findAllProvinces();
};

/**
 * Lấy wards theo province
 */
export const getWardsByProvince = async (
  provinceId: string,
  page: number = 1,
  perPage: number = 50,
  search?: string
) => {
  // Validate province tồn tại
  const province = await repo.findProvinceById(provinceId);
  if (!province) {
    throw new Error("Tỉnh/Thành phố không tồn tại");
  }

  return repo.findWardsByProvince(provinceId, page, perPage, search);
};

/**
 * Tạo mới Tỉnh/Thành phố
 */
export const createProvince = async (input: CreateProvinceInput) => {
  // Kiểm tra trùng mã
  const existing = await repo.findProvinceByCode(input.code);
  if (existing) {
    throw new Error(`Mã tỉnh/thành phố '${input.code}' đã tồn tại`);
  }

  return repo.createProvince(input);
};

/**
 * Tạo mới Phường/Xã
 */
export const createWard = async (input: CreateWardInput) => {
  // 1. Kiểm tra Province có tồn tại không
  const province = await repo.findProvinceById(input.provinceId);
  if (!province) {
    throw new Error("Tỉnh/Thành phố không tồn tại");
  }

  // 2. Kiểm tra trùng mã Ward
  const existing = await repo.findWardByCode(input.code);
  if (existing) {
    throw new Error(`Mã phường/xã '${input.code}' đã tồn tại`);
  }

  return repo.createWard(input);
};