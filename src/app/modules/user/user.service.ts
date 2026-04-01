import bcrypt from "bcryptjs";
import prisma from "@/config/db";
import * as userRepository from "./user.repository";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import { deleteOldAvatarImage } from "./user.helpers";
import { ChangePasswordInput, CreateUserInput, GetUsersQuery, UpdateProfileInput, UpdateUserInput } from "./user.validation";

// Helper

const assertUserExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const user = await userRepository.findById(id, options);
  if (!user) throw new NotFoundError("Người dùng");
  return user;
};

// Self (user đang đăng nhập)

export const getMe = async (userId: string) => {
  return assertUserExists(userId);
};

export const updateMe = async (userId: string, input: UpdateProfileInput) => {
  const user = (await assertUserExists(userId)) as any;

  // Xóa ảnh cũ khi upload ảnh mới
  if (input.avatarPath && user.avatarPath) {
    await deleteOldAvatarImage(user.avatarPath);
  }

  // Xóa ảnh khi removeAvatar=true
  if (input.removeAvatar && user.avatarPath) {
    await deleteOldAvatarImage(user.avatarPath);
    (input as any).avatarPath = null;
    (input as any).avatarImage = null;
  }

  const { removeAvatar, ...data } = input as any;

  return userRepository.update(userId, data).catch(handlePrismaError);
};

export const changeMyPassword = async (userId: string, input: ChangePasswordInput) => {
  const rawUser = await prisma.users.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!rawUser) throw new NotFoundError("Người dùng");

  if (!rawUser.passwordHash) {
    throw new BadRequestError("Tài khoản này đăng nhập qua mạng xã hội, không có mật khẩu");
  }

  const isMatch = await bcrypt.compare(input.currentPassword, rawUser.passwordHash);
  if (!isMatch) throw new BadRequestError("Mật khẩu hiện tại không đúng");

  const newHash = await bcrypt.hash(input.newPassword, 10);
  await userRepository.update(userId, { passwordHash: newHash });
};

// Staff & Admin: danh sách, chi tiết

export const getUsers = async (query: GetUsersQuery, isAdmin: boolean) => {
  return userRepository.findAll({ ...query, isAdmin });
};

export const getUserById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  return assertUserExists(id, options);
};

// Admin: tạo / cập nhật

export const createUser = async (input: CreateUserInput) => {
  const { password, ...rest } = input;
  const passwordHash = await bcrypt.hash(password, 10);
  return userRepository.create({ ...rest, passwordHash }).catch(handlePrismaError);
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  const user = (await assertUserExists(id)) as any;

  const data: Record<string, unknown> = { ...input };

  // Hash password nếu có
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password as string, 10);
    delete data.password;
  }

  // Xóa ảnh cũ khi upload ảnh mới
  if (data.avatarPath && user.avatarPath) {
    await deleteOldAvatarImage(user.avatarPath);
  }

  // Xóa ảnh khi removeAvatar=true
  if (data.removeAvatar && user.avatarPath) {
    await deleteOldAvatarImage(user.avatarPath);
    data.avatarPath = null;
    data.avatarImage = null;
  }

  delete data.removeAvatar;

  return userRepository.update(id, data).catch(handlePrismaError);
};

// Soft delete — Staff & Admin
// Guard role target (staff chỉ xóa customer) được thực hiện ở controller

export const softDeleteUser = async (targetId: string, requesterId: string) => {
  if (targetId === requesterId) {
    throw new ForbiddenError("Không thể tự xóa tài khoản của chính mình");
  }
  await assertUserExists(targetId);
  return userRepository.softDelete(targetId, requesterId).catch(handlePrismaError);
};

// Admin: restore, hard delete, trash

export const restoreUser = async (id: string) => {
  const user = (await userRepository.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!user) throw new NotFoundError("Người dùng");
  if (!user.deletedAt) throw new BadRequestError("Người dùng này chưa bị xóa");
  return userRepository.restore(id).catch(handlePrismaError);
};

export const hardDeleteUser = async (id: string) => {
  const user = (await userRepository.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!user) throw new NotFoundError("Người dùng");

  if (!user.deletedAt) {
    throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn. Dùng DELETE /admin/users/:id");
  }

  // Xóa avatar Cloudinary trước khi hard delete
  if (user.avatarPath) {
    await deleteOldAvatarImage(user.avatarPath);
  }

  return userRepository.hardDelete(id).catch(handlePrismaError);
};

export const getDeletedUsers = async (query: Pick<GetUsersQuery, "page" | "limit">) => {
  return userRepository.findAllDeleted(query);
};
