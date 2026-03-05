import prisma from "@/config/db";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";
import { ListAddressesQuery } from "./user-address.validation";

/**
 * Cấu trúc select đầy đủ bao gồm các quan hệ và metadata xóa mềm
 */
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
  deletedAt: true, // Quan trọng: Để phục vụ logic thùng rác ở Service
  deletedBy: true, // Quan trọng: Truy vết người thực hiện xóa
  province: { 
    select: { id: true, code: true, name: true, fullName: true, type: true } 
  },
  ward: { 
    select: { id: true, code: true, name: true, fullName: true, type: true } 
  },
};

/**
 * Lấy tất cả địa chỉ đang hoạt động của một người dùng
 */
export const findByUserId = async (userId: string) => {
  return prisma.user_addresses.findMany({
    where: { userId, deletedAt: null },
    select: selectAddressWithRelations,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

/**
 * Tìm một địa chỉ theo ID, có tùy chọn bao gồm cả địa chỉ đã xóa (cho Admin)
 */
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

/**
 * Tìm địa chỉ mặc định hiện tại của người dùng
 */
export const findDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.findFirst({
    where: { userId, isDefault: true, deletedAt: null },
    select: selectAddressWithRelations,
  });
};

/**
 * Tạo mới địa chỉ - Đã áp dụng CreateAddressInput để fix lỗi import
 */
export const createAddress = async (data: CreateAddressInput & { userId: string }) => {
  return prisma.user_addresses.create({
    data,
    select: selectAddressWithRelations,
  });
};

/**
 * Cập nhật địa chỉ - Đã áp dụng UpdateAddressInput để fix lỗi import
 */
export const updateAddress = async (id: string, data: UpdateAddressInput) => {
  return prisma.user_addresses.update({
    where: { id },
    data: data as any, // Ép kiểu nhẹ để tương thích với Prisma update input
    select: selectAddressWithRelations,
  });
};

/**
 * Hủy trạng thái mặc định của tất cả địa chỉ thuộc về người dùng
 */
export const resetDefaultAddress = async (userId: string) => {
  return prisma.user_addresses.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
};

/**
 * Xóa mềm địa chỉ (Soft Delete)
 */
export const softDeleteAddress = async (id: string, deletedBy: string) => {
  return prisma.user_addresses.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
      isDefault: false, // Địa chỉ bị xóa thì không được là mặc định
    },
  });
};

/**
 * Khôi phục địa chỉ từ thùng rác
 */
export const restoreAddress = async (id: string) => {
  return prisma.user_addresses.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
  });
};

/**
 * Xóa vĩnh viễn địa chỉ khỏi Database
 */
export const hardDeleteAddress = async (id: string) => {
  return prisma.user_addresses.delete({ where: { id } });
};

// ==================== ADMIN / STAFF REPOSITORY ====================

/**
 * Lấy danh sách địa chỉ toàn hệ thống với phân trang và tìm kiếm - Đã áp dụng ListAddressesQuery
 */
export const findAllAddressesAdmin = async (query: ListAddressesQuery) => {
  const { search, provinceId, wardId, includeDeleted, page = 1, perPage = 20 } = query;
  const where: any = {};
  
  if (!includeDeleted) where.deletedAt = null;
  if (provinceId) where.provinceId = provinceId;
  if (wardId) where.wardId = wardId;
  if (search) {
    where.OR = [
      { contactName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } }
    ];
  }

  const skip = (page - 1) * perPage;
  const [data, total] = await Promise.all([
    prisma.user_addresses.findMany({
      where,
      skip,
      take: perPage,
      select: selectAddressWithRelations,
      orderBy: { createdAt: "desc" }
    }),
    prisma.user_addresses.count({ where })
  ]);

  return { data, total, page, perPage };
};

/**
 * Lấy danh sách các địa chỉ đang nằm trong thùng rác
 */
export const findAllDeletedAddresses = async () => {
  return prisma.user_addresses.findMany({
    where: { deletedAt: { not: null } },
    select: { ...selectAddressWithRelations },
    orderBy: { deletedAt: "desc" }
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

/**
 * Lấy danh sách Phường/Xã theo tỉnh, sắp xếp gom nhóm theo loại (Phường trước, Xã sau)
 */
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
      orderBy: [
        { type: "asc" }, // Gom nhóm Phường/Thị trấn lên trước Xã
        { name: "asc" }  // Sắp xếp A-Z theo tên bên trong mỗi nhóm
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
      totalPages: Math.ceil(total / perPage) 
    } 
  };
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