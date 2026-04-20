import * as repo from "./user-address.repository";
import { CreateAddressInput, UpdateAddressInput, AddressResponse, ExternalProvinceResponse, ExternalWardResponse } from "./user-address.types";
import { NotFoundError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";

// ==================== EXTERNAL API CONFIG ====================

const VIETNAM_API_BASE = "https://provinces.open-api.vn/api/v2";

// ==================== HELPERS ====================

const formatAddressResponse = (address: any): AddressResponse => {
  return {
    id: address.id,
    contactName: address.contactName,
    phone: address.phone,
    province: {
      code: address.provinceCode,
      name: address.provinceName,
    },
    ward: {
      code: address.wardCode,
      name: address.wardName,
    },
    detailAddress: address.detailAddress,
    fullAddress: `${address.detailAddress}, ${address.wardName}, ${address.provinceName}`,
    type: address.type,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
};

/**
 * Validate provinceCode + wardCode với external Vietnam Provinces API.
 * Trả về tên tỉnh và tên phường để snapshot vào DB.
 * Gọi depth=2 để lấy cả danh sách wards trong 1 request.
 */
const validateAndFetchLocationNames = async (
  provinceCode: number,
  wardCode: number
): Promise<{ provinceName: string; wardName: string }> => {
  let provinceData: ExternalProvinceResponse;

  try {
    const res = await fetch(`${VIETNAM_API_BASE}/p/${provinceCode}?depth=2`);
    if (!res.ok) throw new NotFoundError("Tỉnh/Thành phố");
    provinceData = await res.json();
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.name === "NotFoundError") {
      throw new NotFoundError("Tỉnh/Thành phố");
    }
    throw new BadRequestError("Không thể kết nối tới dịch vụ địa chỉ, vui lòng thử lại");
  }

  const ward = provinceData.wards?.find((w: ExternalWardResponse) => w.code === wardCode);
  if (!ward) {
    throw new BadRequestError("Phường/Xã không thuộc Tỉnh/Thành phố đã chọn");
  }

  return {
    provinceName: provinceData.name,
    wardName: ward.name,
  };
};

// ==================== USER SERVICES ====================

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
  const { provinceName, wardName } = await validateAndFetchLocationNames(
    input.provinceCode,
    input.wardCode
  );

  const currentAddresses = await repo.findByUserId(userId);
  const isDefault = currentAddresses.length === 0 ? true : input.isDefault ?? false;

  if (isDefault && currentAddresses.length > 0) {
    await repo.resetDefaultAddress(userId);
  }

  const newAddress = await repo
    .createAddress({
      userId,
      contactName: input.contactName,
      phone: input.phone,
      provinceCode: input.provinceCode,
      provinceName,
      wardCode: input.wardCode,
      wardName,
      detailAddress: input.detailAddress,
      type: input.type,
      isDefault,
    })
    .catch(handlePrismaError);

  return formatAddressResponse(newAddress);
};

export const updateAddress = async (addressId: string, userId: string, input: UpdateAddressInput) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");

  let locationUpdate: { provinceName?: string; wardName?: string } = {};

  // Nếu có thay đổi province hoặc ward thì validate lại với external API
  if (input.provinceCode !== undefined || input.wardCode !== undefined) {
    const provinceCode = input.provinceCode ?? address.provinceCode;
    const wardCode = input.wardCode ?? address.wardCode;

    const { provinceName, wardName } = await validateAndFetchLocationNames(provinceCode, wardCode);
    locationUpdate = { provinceName, wardName };
  }

  if (input.isDefault && !address.isDefault) {
    await repo.resetDefaultAddress(userId);
  }

  const updatedAddress = await repo
    .updateAddress(addressId, { ...input, ...locationUpdate })
    .catch(handlePrismaError);

  return formatAddressResponse(updatedAddress);
};

export const deleteAddress = async (addressId: string, userId: string) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");

  if (address.isDefault) {
    const allAddresses = await repo.findByUserId(userId);
    if (allAddresses.length > 1) {
      throw new BadRequestError(
        "Không thể xóa địa chỉ mặc định. Vui lòng thiết lập địa chỉ khác làm mặc định trước khi xóa."
      );
    }
  }

  await repo.softDeleteAddress(addressId, userId);
};

export const setDefaultAddress = async (addressId: string, userId: string) => {
  const address = await repo.findAddressById(addressId, userId);
  if (!address) throw new NotFoundError("Địa chỉ");

  await repo.resetDefaultAddress(userId);
  const updatedAddress = await repo
    .updateAddress(addressId, { isDefault: true })
    .catch(handlePrismaError);

  return formatAddressResponse(updatedAddress);
};

// ==================== ADMIN / STAFF SERVICES ====================

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
  if (!address.deletedAt) {
    throw new BadRequestError("Phải chuyển vào thùng rác trước khi xóa vĩnh viễn");
  }
  return repo.hardDeleteAddress(addressId).catch(handlePrismaError);
};