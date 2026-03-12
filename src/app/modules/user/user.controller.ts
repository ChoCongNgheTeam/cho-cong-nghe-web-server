import { Request, Response } from "express";
import * as userService from "./user.service";
import { getUsersQuerySchema } from "./user.validation";
import { ForbiddenError } from "@/errors";

// Self

export const getMeHandler = async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.id);
  res.json({ data: user, message: "Lấy thông tin cá nhân thành công" });
};

export const updateMeHandler = async (req: Request, res: Response) => {
  const user = await userService.updateMe(req.user!.id, req.body);
  res.json({ data: user, message: "Cập nhật hồ sơ thành công" });
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  await userService.changeMyPassword(req.user!.id, req.body);
  res.json({ message: "Đổi mật khẩu thành công" });
};

// Staff & Admin

export const getUsersHandler = async (req: Request, res: Response) => {
  const query = getUsersQuerySchema.parse(req.query);
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
  const target = await userService.getUserById(req.params.id);

  if (requester.role === "STAFF" && target.role !== "CUSTOMER") {
    throw new ForbiddenError("Staff chỉ được phép xóa tài khoản khách hàng");
  }

  await userService.softDeleteUser(req.params.id, requester.id);
  res.json({ message: "Xóa người dùng thành công" });
};

// Admin only

export const createUserHandler = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ data: user, message: "Tạo người dùng thành công" });
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ data: user, message: "Cập nhật người dùng thành công" });
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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
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
