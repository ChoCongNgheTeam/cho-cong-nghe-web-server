import { Request, Response, NextFunction } from "express";
import {
  getUsers as getUsersService,
  getUserById as getUserByIdService,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "./user.service";

// GET /users - Admin only
export const getUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await getUsersService();
    res.json({
      data: users,
      total: users.length,
      message: "Lấy danh sách người dùng thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// GET /users/:id
export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const user = await getUserByIdService(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// POST /users - Admin only
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json({
      data: user,
      message: "Tạo người dùng thành công",
    });
  } catch (error: any) {
    res.status(409).json({
      message: error.message || "Dữ liệu bị trùng (email hoặc username)",
    });
  }
};

// PATCH /users/:id - Admin only
export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await updateUserService(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({
      data: user,
      message: "Cập nhật người dùng thành công",
    });
  } catch (error: any) {
    if (error.message.includes("đã được sử dụng")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// DELETE /users/:id - Admin only
export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    await deleteUserService(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy người dùng để xóa" });
    }
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// GET /users/me
export const getMeHandler = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Chưa xác thực" });
  }

  const user = await getUserByIdService(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy thông tin người dùng" });
  }

  res.json({ data: user });
};

// PATCH /users/me
export const updateMeHandler = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Chưa xác thực" });
  }

  try {
    const user = await updateUserService(req.user.id, req.body);
    res.json({
      data: user,
      message: "Cập nhật hồ sơ cá nhân thành công",
    });
  } catch (error: any) {
    if (error.message.includes("đã được sử dụng")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};
