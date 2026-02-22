import { Request, Response } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "./user.service";

export const getUsersHandler = async (req: Request, res: Response) => {
  const users = await getUsers();
  res.json({
    data: users,
    total: users.length,
    message: "Lấy danh sách người dùng thành công",
  });
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  const user = await getUserById(req.params.id);
  res.json({ data: user, message: "Lấy người dùng thành công" });
};

export const createUserHandler = async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  res.status(201).json({ data: user, message: "Tạo người dùng thành công" });
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const user = await updateUser(req.params.id, req.body);
  res.json({ data: user, message: "Cập nhật người dùng thành công" });
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  await deleteUser(req.params.id);
  res.status(204).send();
};

export const getMeHandler = async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.id);
  res.json({ data: user, message: "Lấy thông tin cá nhân thành công" });
};

export const updateMeHandler = async (req: Request, res: Response) => {
  const user = await updateUser(req.user!.id, req.body);
  res.json({ data: user, message: "Cập nhật hồ sơ cá nhân thành công" });
};
