import { Prisma } from "@prisma/client";
import prisma from "@/config/db";
import { GetUsersQuery } from "./user.validation";

// Fields trả về cho user thường / self — không expose sensitive data
export const selectPublicUser = {
  id: true,
  userName: true,
  email: true,
  fullName: true,
  phone: true,
  gender: true,
  dateOfBirth: true,
  role: true,
  isActive: true,
  avatarImage: true,
  avatarPath: true, // publicId Cloudinary — cần để xóa ảnh cũ khi update
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.usersSelect;

// Fields trả về cho admin — thêm soft delete metadata
export const selectAdminUser = {
  ...selectPublicUser,
  deletedAt: true,
  deletedBy: true,
} satisfies Prisma.usersSelect;

type CreateUserData = Prisma.usersCreateInput;
type UpdateUserData = Prisma.usersUpdateInput;

export interface FindAllOptions extends GetUsersQuery {
  isAdmin?: boolean;
}

/**
 * Lấy danh sách user có filter, search, pagination.
 *   - Staff: luôn chỉ thấy user chưa xóa (deletedAt = null)
 *   - Admin + includeDeleted=true: thấy cả user đã soft delete
 */
export const findAll = async (options: FindAllOptions) => {
  const { page = 1, limit = 20, search, role, isActive, gender, includeDeleted = false, isAdmin = false, sortBy = "createdAt", sortOrder = "desc" } = options;

  const skip = (page - 1) * limit;

  const deletedFilter: Prisma.usersWhereInput = isAdmin && includeDeleted ? {} : { deletedAt: null };

  const searchFilter: Prisma.usersWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { fullName: { contains: search, mode: "insensitive" } },
          { userName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const where: Prisma.usersWhereInput = {
    ...deletedFilter,
    ...searchFilter,
    ...(role !== undefined && { role }),
    ...(isActive !== undefined && { isActive }),
    ...(gender !== undefined && { gender }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.users.findMany({
      where,
      select: isAdmin ? selectAdminUser : selectPublicUser,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.users.count({ where }),
  ]);

  return { users, total, page, limit };
};

/**
 * Tìm user theo id.
 *   - Mặc định: bỏ qua user đã soft delete.
 *   - Admin + includeDeleted=true: tìm cả trong trash (để restore/hard delete).
 */
export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;
  return prisma.users.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectAdminUser : selectPublicUser,
  });
};

// Dùng nội bộ (auth service) — trả về full record kể cả passwordHash
export const findByEmail = async (email: string) => {
  return prisma.users.findUnique({ where: { email } });
};

export const findByUserName = async (userName: string) => {
  return prisma.users.findUnique({ where: { userName } });
};

export const create = async (data: CreateUserData) => {
  return prisma.users.create({ data, select: selectPublicUser });
};

// Chỉ update user chưa bị soft delete — tránh vô tình cập nhật user trong trash
export const update = async (id: string, data: UpdateUserData) => {
  return prisma.users.update({
    where: { id, deletedAt: null },
    data,
    select: selectPublicUser,
  });
};

/**
 * Soft delete — Staff & Admin.
 *   deletedBy: audit log — biết ai thực hiện
 *   isActive = false: block login ngay dù token chưa hết hạn
 */
export const softDelete = async (id: string, deletedById: string) => {
  return prisma.users.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedById,
      isActive: false,
    },
  });
};

// Khôi phục user từ trash — Admin only
export const restore = async (id: string) => {
  return prisma.users.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null, isActive: true },
    select: selectAdminUser,
  });
};

/**
 * Hard delete — Admin only, CHỈ dùng sau khi đã soft delete.
 * Cascade tự xóa: oauth_accounts, refresh_tokens, password_reset_tokens,
 *                  cart_items, wishlist, voucher_user.
 * KHÔNG cascade: orders (bảo toàn lịch sử giao dịch).
 */
export const hardDelete = async (id: string) => {
  return prisma.users.delete({ where: { id } });
};

// Lấy danh sách user đã soft delete — Admin only (trang trash)
export const findAllDeleted = async (options: Pick<GetUsersQuery, "page" | "limit">) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.users.findMany({
      where: { deletedAt: { not: null } },
      select: selectAdminUser,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.users.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { users, total, page, limit };
};
