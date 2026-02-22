import bcrypt from "bcryptjs";
import * as userRepository from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.validation";
import { NotFoundError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";

export const getUsers = async () => {
  return userRepository.findAll();
};

export const getUserById = async (id: string) => {
  const user = await userRepository.findById(id);

  if (!user) throw new NotFoundError("Người dùng");

  return user;
};

export const createUser = async (input: CreateUserInput) => {
  const { password, ...rest } = input;
  const passwordHash = await bcrypt.hash(password, 10);

  return userRepository.create({ ...rest, passwordHash }).catch(handlePrismaError);
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  const updateData: Record<string, any> = { ...input };

  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }

  return userRepository.update(id, updateData).catch(handlePrismaError);
};

export const deleteUser = async (id: string) => {
  return userRepository.remove(id).catch(handlePrismaError);
};
