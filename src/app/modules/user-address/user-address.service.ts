import * as repo from "./user-address.repository";
import { CreateAddressInput, UpdateAddressInput, AddressResponse } from "./user-address.types";
import { CreateProvinceInput, CreateWardInput } from "./user-address.validation";
import { NotFoundError, ForbiddenError, DuplicateError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";


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
  const addresses = await repo.findByUserId(userId).catch(handlePrismaError);
  
  return {
    data: addresses.map(formatAddressResponse),
    total: addresses.length,
  };
};

/**
 * Lấy một địa chỉ
 */
export const getAddress = async (addressId: string, userId: string) => {
  const address = await repo.findById(addressId).catch(handlePrismaError);

  if (!address) {
    throw new NotFoundError("Địa chỉ");
  }

  if (address.userId !== userId) {
    throw new ForbiddenError("Bạn không có quyền truy cập địa chỉ này");
  }

  return formatAddressResponse(address);
};

/**
 * Tạo mới địa chỉ
 */
export const createAddress = async (userId: string, input: CreateAddressInput) => {
  // Check 1: Business logic - Validate province and ward
  const province = await repo.findProvinceById(input.provinceId).catch(handlePrismaError);
  if (!province) {
    throw new NotFoundError("Tỉnh/Thành phố");
  }

  const ward = await repo.findWardById(input.wardId).catch(handlePrismaError);
  if (!ward) {
    throw new NotFoundError("Phường/Xã");
  }

  // Check 2: Handle Prisma error - database constraint
  const address = await repo.create(userId, input).catch(handlePrismaError);
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
  const address = await repo.findById(addressId).catch(handlePrismaError);

  if (!address) {
    throw new NotFoundError("Địa chỉ");
  }

  if (address.userId !== userId) {
    throw new ForbiddenError("Bạn không có quyền cập nhật địa chỉ này");
  }

  // Validate province nếu update
  if (input.provinceId) {
    const province = await repo.findProvinceById(input.provinceId).catch(handlePrismaError);
    if (!province) {
      throw new NotFoundError("Tỉnh/Thành phố");
    }
  }

  // Validate ward nếu update
  if (input.wardId) {
    const ward = await repo.findWardById(input.wardId).catch(handlePrismaError);
    if (!ward) {
      throw new NotFoundError("Phường/Xã");
    }
  }

  const updatedAddress = await repo.update(addressId, userId, input).catch(handlePrismaError);
  return formatAddressResponse(updatedAddress);
};

/**
 * Xóa địa chỉ
 */
export const deleteAddress = async (addressId: string, userId: string) => {
  const address = await repo.findById(addressId).catch(handlePrismaError);

  if (!address) {
    throw new NotFoundError("Địa chỉ");
  }

  if (address.userId !== userId) {
    throw new ForbiddenError("Bạn không có quyền xóa địa chỉ này");
  }

  return repo.remove(addressId).catch(handlePrismaError);
};

/**
 * Đặt địa chỉ mặc định
 */
export const setDefaultAddress = async (addressId: string, userId: string) => {
  const address = await repo.findById(addressId).catch(handlePrismaError);

  if (!address) {
    throw new NotFoundError("Địa chỉ");
  }

  if (address.userId !== userId) {
    throw new ForbiddenError("Bạn không có quyền cập nhật địa chỉ này");
  }

  const updatedAddress = await repo.setDefault(addressId, userId).catch(handlePrismaError);
  return formatAddressResponse(updatedAddress);
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = async (userId: string) => {
  const address = await repo.findDefaultAddress(userId).catch(handlePrismaError);

  if (!address) {
    throw new NotFoundError("Địa chỉ mặc định");
  }

  return formatAddressResponse(address);
};

// ==================== LOCATION SERVICE ====================

/**
 * Lấy tất cả tỉnh/thành phố
 */
export const getProvinces = async () => {
  return repo.findAllProvinces().catch(handlePrismaError);
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
  // Check 1: Business logic - Validate province exists
  const province = await repo.findProvinceById(provinceId).catch(handlePrismaError);
  if (!province) {
    throw new NotFoundError("Tỉnh/Thành phố");
  }

  // Check 2: Handle Prisma error
  return repo.findWardsByProvince(provinceId, page, perPage, search).catch(handlePrismaError);
};

/**
 * Tạo mới Tỉnh/Thành phố
 */
export const createProvince = async (input: CreateProvinceInput) => {
  // Check 1: Business logic - Check if code already exists
  const existing = await repo.findProvinceByCode(input.code).catch(handlePrismaError);
  if (existing) {
    throw new DuplicateError(`Mã tỉnh/thành phố '${input.code}'`);
  }

  // Check 2: Handle Prisma error
  return repo.createProvince(input).catch(handlePrismaError);
};

/**
 * Tạo mới Phường/Xã
 */
export const createWard = async (input: CreateWardInput) => {
  // Check 1: Business logic - Validate province exists
  const province = await repo.findProvinceById(input.provinceId).catch(handlePrismaError);
  if (!province) {
    throw new NotFoundError("Tỉnh/Thành phố");
  }

  // Check 1: Business logic - Check if ward code already exists
  const existing = await repo.findWardByCode(input.code).catch(handlePrismaError);
  if (existing) {
    throw new DuplicateError(`Mã phường/xã '${input.code}'`);
  }

  // Check 2: Handle Prisma error
  return repo.createWard(input).catch(handlePrismaError);
};