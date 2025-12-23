import bcrypt from "bcryptjs";
import * as userRepository from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.validation";
import { Prisma } from "@prisma/client";
import { DuplicateError } from "@/utils/errors";

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
      throw new DuplicateError(field === "email" ? "Email" : "Username");
    }
    throw error;
  }
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  try {
    //  Hash password nếu có trong input (check với FE)
    const updateData = { ...input };

    if (updateData.password) {
      const passwordHash = await bcrypt.hash(updateData.password, 10);
      delete (updateData as any).password;
      (updateData as any).passwordHash = passwordHash;
    }

    return await userRepository.update(id, updateData);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0];
      throw new DuplicateError(field === "email" ? "Email" : "Username");
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  return userRepository.remove(id);
};
