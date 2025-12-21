// src/user/user.service.ts
import bcrypt from "bcryptjs";
import * as userRepository from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.validation";
import { Prisma } from "@prisma/client";

export const getUsers = async () => {
  return userRepository.findAll();
};

export const getUserById = async (id: string) => {
  return userRepository.findById(id);
};

export const createUser = async (input: CreateUserInput) => {
  const { password, ...rest } = input;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await userRepository.create({
      ...rest,
      passwordHash,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0];
      throw new Error(
        field === "email"
          ? "Email đã được sử dụng"
          : field === "userName"
          ? "Username đã được sử dụng"
          : "Dữ liệu bị trùng"
      );
    }
    throw error;
  }
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  try {
    return await userRepository.update(id, input);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0];
      throw new Error(field === "email" ? "Email đã được sử dụng" : "Dữ liệu bị trùng");
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  return userRepository.remove(id);
};
