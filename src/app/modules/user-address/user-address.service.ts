import * as repo from "./user-address.repository";
import { CreateAddressInput, UpdateAddressInput, AddressResponse } from "./user-address.types";
import { CreateProvinceInput, CreateWardInput } from "./user-address.validation";
import { NotFoundError, ForbiddenError, DuplicateError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";

const formatFullAddress = (address: any): string => {
  return `${address.detailAddress}, ${address.ward.fullName}, ${address.province.fullName}`;
};

const formatAddressResponse = (address: any): AddressResponse => {
  return {
    id: address.id,
    contactName: address.contactName,
    phone: address.phone,
    province: { id: address.province.id, name: address.province.name, fullName: address.province.fullName },
    ward: { id: address.ward.id, name: address.ward.name, fullName: address.ward.fullName },
    detailAddress: address.detailAddress,
    fullAddress: formatFullAddress(address),
    type: address.type,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
};

export const getUserAddresses = async (userId: string) => {
  const addresses = await repo.findByUserId(userId);
  return { total: addresses.length, data: addresses.map(formatAddressResponse) };
};

export const getAddress = async (addressId: string, userId: string) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");
  return formatAddressResponse(address);
};

export const getDefaultAddress = async (userId: string) => {
  let address = await repo.findDefaultAddress(userId);
  if (!address) {
    const addresses = await repo.findByUserId(userId);
    if (addresses.length > 0) address = addresses[0];
  }
  return address ? formatAddressResponse(address) : null;
};

export const createAddress = async (userId: string, input: CreateAddressInput) => {
  const province = await repo.findProvinceById(input.provinceId).catch(handlePrismaError);
  if (!province) throw new NotFoundError("Tỉnh/Thành phố");

  const ward = await repo.findWardById(input.wardId).catch(handlePrismaError);
  if (!ward) throw new NotFoundError("Phường/Xã");
  if (ward.provinceId !== input.provinceId) throw new BadRequestError("Phường/Xã không thuộc Tỉnh/Thành phố đã chọn");

  const currentAddresses = await repo.findByUserId(userId);
  let isDefault = currentAddresses.length === 0 ? true : input.isDefault || false;

  if (isDefault && currentAddresses.length > 0) await repo.resetDefaultAddress(userId);

  const newAddress = await repo.createAddress({
    userId, contactName: input.contactName, phone: input.phone, provinceId: input.provinceId,
    wardId: input.wardId, detailAddress: input.detailAddress, type: input.type, isDefault,
  }).catch(handlePrismaError);

  return formatAddressResponse(newAddress);
};

export const updateAddress = async (addressId: string, userId: string, input: UpdateAddressInput) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");

  if (input.provinceId || input.wardId) {
    const pId = input.provinceId || address.province.id;
    const wId = input.wardId || address.ward.id;

    const province = await repo.findProvinceById(pId);
    if (!province) throw new NotFoundError("Tỉnh/Thành phố");

    const ward = await repo.findWardById(wId);
    if (!ward) throw new NotFoundError("Phường/Xã");
    if (ward.provinceId !== pId) throw new BadRequestError("Phường/Xã không thuộc Tỉnh/Thành phố đã chọn");
  }

  if (input.isDefault && !address.isDefault) await repo.resetDefaultAddress(userId);

  const updatedAddress = await repo.updateAddress(addressId, input).catch(handlePrismaError);
  return formatAddressResponse(updatedAddress);
};

export const deleteAddress = async (addressId: string, userId: string) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");

  if (address.isDefault) {
    const allAddresses = await repo.findByUserId(userId);
    if (allAddresses.length > 1) {
      throw new BadRequestError("Không thể xóa địa chỉ mặc định. Vui lòng thiết lập địa chỉ khác làm mặc định trước khi xóa.");
    }
  }

  await repo.softDeleteAddress(addressId, userId);
};

// 👇 HÀM BỊ THIẾU Ở BẢN TRƯỚC 👇
export const setDefaultAddress = async (addressId: string, userId: string) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");

  await repo.resetDefaultAddress(userId);
  const updatedAddress = await repo.updateAddress(addressId, { isDefault: true }).catch(handlePrismaError);
  return formatAddressResponse(updatedAddress);
};

// ==================== ADMIN / STAFF ====================

export const getAllAddressesAdmin = async (query: any) => {
  return repo.findAllAddressesAdmin(query);
};

export const softDeleteAddressAdmin = async (addressId: string, adminId: string) => {
  const address = await repo.findAddressById(addressId, undefined, true);
  if (!address) throw new NotFoundError("Địa chỉ");
  await repo.softDeleteAddress(addressId, adminId);
};

export const getDeletedAddresses = async () => {
  return repo.findAllDeletedAddresses();
};

export const restoreAddress = async (addressId: string) => {
  const address = await repo.findAddressById(addressId, undefined, true);
  if (!address) throw new NotFoundError("Địa chỉ");
  if (!address.deletedAt) throw new BadRequestError("Địa chỉ này chưa bị xóa");
  return repo.restoreAddress(addressId);
};

export const hardDeleteAddress = async (addressId: string) => {
  const address = await repo.findAddressById(addressId, undefined, true);
  if (!address) throw new NotFoundError("Địa chỉ");
  if (!address.deletedAt) throw new BadRequestError("Phải chuyển vào thùng rác trước khi xóa vĩnh viễn");
  return await repo.hardDeleteAddress(addressId).catch(handlePrismaError);
};

// ==================== LOCATIONS ====================

export const getProvinces = async () => repo.findAllProvinces().catch(handlePrismaError);

export const getWardsByProvince = async (provinceId: string, page: number = 1, perPage: number = 50, search?: string) => {
  const province = await repo.findProvinceById(provinceId).catch(handlePrismaError);
  if (!province) throw new NotFoundError("Tỉnh/Thành phố");
  return repo.findWardsByProvince(provinceId, page, perPage, search).catch(handlePrismaError);
};

export const createProvince = async (input: CreateProvinceInput) => {
  const existing = await repo.findProvinceByCode(input.code).catch(handlePrismaError);
  if (existing) throw new DuplicateError(`Mã tỉnh/thành phố '${input.code}'`);
  return repo.createProvince(input).catch(handlePrismaError);
};

export const createWard = async (input: CreateWardInput) => {
  const province = await repo.findProvinceById(input.provinceId).catch(handlePrismaError);
  if (!province) throw new NotFoundError("Tỉnh/Thành phố");
  const existing = await repo.findWardByCode(input.code).catch(handlePrismaError);
  if (existing) throw new DuplicateError(`Mã phường/xã '${input.code}'`);
  return repo.createWard(input).catch(handlePrismaError);
};