import { Request, Response } from "express";
import * as userService from "./user.service";
import type { PublicUser } from "./user.repository";
import { updateProfileSchema, updateUserSchema } from "./user.validation";
import type { GetUsersQuery, ExportUsersQuery, UpdateNotifPreferencesInput, GetDeletedUsersQuery } from "./user.validation";
import { parseMultipartData, uploadAvatarImage } from "./user.helpers";
import { cleanupFile } from "@/integrations/file-cleanup.service";
import { ForbiddenError } from "@/errors";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

// SELF

export const getMeHandler = async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.id);
  res.json({ data: user, message: "Lấy thông tin cá nhân thành công" });
};

/**
 * PATCH /users/me
 *
 * Hỗ trợ multipart/form-data (khi gửi kèm ảnh) lẫn application/json (khi không có ảnh).
 * Field `avatarImage` + `avatarPath` do controller inject sau khi upload xong.
 * Field `removeAvatar=true` → xóa ảnh cũ, set null.
 */
export const updateMeHandler = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    const parsedBody = parseMultipartData(req.body);
    const validatedBody = updateProfileSchema.parse(parsedBody);
    const uploadedImage = file ? await uploadAvatarImage(file) : null;

    const user = await userService.updateMe(req.user!.id, {
      ...validatedBody,
      ...(uploadedImage && { avatarImage: uploadedImage.url, avatarPath: uploadedImage.publicId }),
    });

    res.json({ data: user, message: "Cập nhật hồ sơ thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  await userService.changeMyPassword(req.user!.id, req.body);
  res.json({ message: "Đổi mật khẩu thành công" });
};

export const getMyNotifPreferencesHandler = async (req: Request, res: Response) => {
  const prefs = await userService.getMyNotifPreferences(req.user!.id);
  res.json({ data: prefs, message: "Lấy tùy chọn thông báo thành công" });
};

export const updateMyNotifPreferencesHandler = async (req: Request, res: Response) => {
  const body = req.body as UpdateNotifPreferencesInput;
  const prefs = await userService.updateMyNotifPreferences(req.user!.id, body);
  res.json({ data: prefs, message: "Cập nhật tùy chọn thông báo thành công" });
};

// STAFF & ADMIN

export const getUsersHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as GetUsersQuery;
  const isAdmin = req.user!.role === "ADMIN";
  const result = await userService.getUsers(query, isAdmin);

  res.json({
    data: result.users,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    },
    message: "Lấy danh sách người dùng thành công",
  });
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const user = await userService.getUserById(req.params.id, { isAdmin });
  res.json({ data: user, message: "Lấy người dùng thành công" });
};

// Staff: chỉ xóa được CUSTOMER
// Admin: xóa mọi role (trừ chính mình — guard trong service)
export const deleteUserHandler = async (req: Request, res: Response) => {
  const requester = req.user!;
  const target = (await userService.getUserById(req.params.id)) as PublicUser;

  // Mọi staff role (SALES/MARKETING/SUPPORT/ACCOUNTING) chỉ được xóa CUSTOMER
  if ((STAFF_ROLES as readonly string[]).includes(requester.role) && target.role !== "CUSTOMER") {
    throw new ForbiddenError("Staff chỉ được phép xóa tài khoản khách hàng");
  }

  await userService.softDeleteUser(req.params.id, requester.id);
  res.json({ message: "Xóa người dùng thành công" });
};

// ADMIN ONLY

export const createUserHandler = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ data: user, message: "Tạo người dùng thành công" });
};

/**
 * PATCH /admin/users/:id
 *
 * Hỗ trợ multipart/form-data (khi admin upload ảnh) lẫn application/json.
 * Không validate body ở middleware — controller tự gọi parseMultipartData + schema.parse.
 */
export const updateUserHandler = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    const parsedBody = parseMultipartData(req.body);
    const validatedBody = updateUserSchema.parse(parsedBody);
    const uploadedImage = file ? await uploadAvatarImage(file) : null;

    const user = await userService.updateUser(req.params.id, {
      ...validatedBody,
      ...(uploadedImage && { avatarImage: uploadedImage.url, avatarPath: uploadedImage.publicId }),
    });

    res.json({ data: user, message: "Cập nhật người dùng thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const restoreUserHandler = async (req: Request, res: Response) => {
  const user = await userService.restoreUser(req.params.id);
  res.json({ data: user, message: "Khôi phục người dùng thành công" });
};

export const hardDeleteUserHandler = async (req: Request, res: Response) => {
  await userService.hardDeleteUser(req.params.id);
  res.json({ message: "Xóa vĩnh viễn người dùng thành công" });
};

export const getDeletedUsersHandler = async (req: Request, res: Response) => {
  const { page, limit } = req.query as unknown as GetDeletedUsersQuery;
  const result = await userService.getDeletedUsers({ page, limit });

  res.json({
    data: result.users,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    },
    message: "Lấy danh sách người dùng đã xóa thành công",
  });
};

export const exportUsersAdminHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as ExportUsersQuery;
  const { buffer, contentType, filename, count } = await userService.exportUsersAdmin(query);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("X-Export-Count", String(count));
  res.send(buffer);
};
