import prisma from "@/config/db";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";

// ==================== ADDRESS REPOSITORY ====================

const selectAddressSimple = {
  id: true,
  userId: true,
  contactName: true,
  phone: true,
  provinceId: true,
  wardId: true,
  detailAddress: true,
  type: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};

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
  province: {
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
    },
  },
  ward: {
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
    },
  },
};

/**
 * Lấy tất cả địa chỉ của user với province và ward
 */
export const findByUserId = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { userId },
    select: selectAddressWithRelations,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

/**
 * Lấy một địa chỉ với province và ward
 */
export const findById = async (addressId: string) => {
  return prisma.user_addresses.findUnique({
    where: { id: addressId },
    select: selectAddressWithRelations,
  });
};

/**
 * Kiểm tra ward có thuộc province không
 */
export const validateWardProvince = async (wardId: string, provinceId: string) => {
  const ward = await prisma.wards.findUnique({
    where: { id: wardId },
    select: { provinceId: true },
  });

  if (!ward) {
    throw new Error("Phường/Xã không tồn tại");
  }

  if (ward.provinceId !== provinceId) {
    throw new Error("Phường/Xã không thuộc Tỉnh/Thành phố đã chọn");
  }

  return true;
};

/**
 * Tạo mới địa chỉ
 */
export const create = async (userId: string, data: CreateAddressInput) => {
  // Validate ward thuộc province
  await validateWardProvince(data.wardId, data.provinceId);

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
      contactName: data.contactName,
      phone: data.phone,
      provinceId: data.provinceId,
      wardId: data.wardId,
      detailAddress: data.detailAddress,
      type: data.type || "HOME",
      isDefault: data.isDefault || false,
    },
    select: selectAddressWithRelations,
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
  // Validate ward thuộc province nếu update
  if (data.wardId && data.provinceId) {
    await validateWardProvince(data.wardId, data.provinceId);
  } else if (data.wardId || data.provinceId) {
    // Nếu chỉ update 1 trong 2, lấy giá trị còn lại từ DB
    const currentAddress = await prisma.user_addresses.findUnique({
      where: { id: addressId },
      select: { provinceId: true, wardId: true },
    });

    if (!currentAddress) {
      throw new Error("Địa chỉ không tồn tại");
    }

    const wardIdToCheck = data.wardId || currentAddress.wardId;
    const provinceIdToCheck = data.provinceId || currentAddress.provinceId;
    await validateWardProvince(wardIdToCheck, provinceIdToCheck);
  }

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
    select: selectAddressWithRelations,
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

  if (!address) {
    throw new Error("Địa chỉ không tồn tại");
  }

  await prisma.user_addresses.delete({
    where: { id: addressId },
  });

  // Nếu xoá địa chỉ mặc định, set địa chỉ gần đây nhất thành mặc định
  if (address.isDefault) {
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
    select: selectAddressWithRelations,
  });
};

/**
 * Lấy địa chỉ mặc định
 */
export const findDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.findFirst({
    where: { userId, isDefault: true },
    select: selectAddressWithRelations,
  });
};

// ==================== LOCATION REPOSITORY ====================

/**
 * Lấy tất cả tỉnh/thành phố
 */
export const findAllProvinces = async () => {
  return prisma.provinces.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
    },
    orderBy: { name: "asc" },
  });
};

/**
 * Lấy province theo ID
 */
export const findProvinceById = async (provinceId: string) => {
  return prisma.provinces.findUnique({
    where: { id: provinceId },
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
    },
  });
};

/**
 * Lấy wards theo province với pagination và search
 */
export const findWardsByProvince = async (
  provinceId: string,
  page: number = 1,
  perPage: number = 50,
  search?: string
) => {
  const skip = (page - 1) * perPage;

  const where = {
    provinceId,
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [wards, total] = await Promise.all([
    prisma.wards.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        fullName: true,
        type: true,
      },
      skip,
      take: perPage,
      orderBy: [
        { type: "asc" }, // Sắp xếp theo Loại trước (Phường sẽ đứng trước Xã theo bảng chữ cái p < x)
        { name: "asc" }  // Sau đó mới sắp xếp theo Tên (A-Z)
      ],
    }),
    prisma.wards.count({ where }),
  ]);

  return {
    data: wards,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

/**
 * Lấy ward theo ID
 */
export const findWardById = async (wardId: string) => {
  return prisma.wards.findUnique({
    where: { id: wardId },
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
      provinceId: true,
    },
  });
};

/**
 * Kiểm tra province code có tồn tại chưa
 */
export const findProvinceByCode = async (code: string) => {
  return prisma.provinces.findUnique({
    where: { code },
  });
};

/**
 * Tạo mới Province
 */
export const createProvince = async (data: any) => {
  return prisma.provinces.create({
    data,
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
    },
  });
};

/**
 * Kiểm tra ward code có tồn tại chưa
 */
export const findWardByCode = async (code: string) => {
  return prisma.wards.findUnique({
    where: { code },
  });
};

/**
 * Tạo mới Ward
 */
export const createWard = async (data: any) => {
  return prisma.wards.create({
    data,
    select: {
      id: true,
      code: true,
      name: true,
      fullName: true,
      type: true,
      provinceId: true,
    },
  });
};