import prisma from "src/config/db";

const selectUserWithoutPassword = {
  id: true,
  email: true,
  userName: true,
  fullName: true,
  role: true,
  createdAt: true,
  phone: true,
  gender: true,
  isActive: true,
  avatarImage: true,
};

export const findByEmailOrUserName = async (email: string, userName?: string) => {
  return prisma.users.findFirst({
    where: {
      OR: [{ email }, { userName }],
    },
  });
};

export const findByUserName = async (userName?: string) => {
  return prisma.users.findUnique({
    where: { userName },
  });
};

export const findByEmail = async (email: string) => {
  return prisma.users.findUnique({
    where: { email },
  });
};

export const createUser = async (data: any) => {
  return prisma.users.create({
    data,
    select: {
      id: true,
      email: true,
      userName: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.users.update({
    where: { id: userId },
    data: { passwordHash },
    select: selectUserWithoutPassword,
  });
};

export const createPasswordResetToken = async (userId: string, token: string, expiresAt: Date) => {
  return prisma.password_reset_tokens.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

export const findPasswordResetToken = async (token: string) => {
  return prisma.password_reset_tokens.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deletePasswordResetToken = async (token: string) => {
  return prisma.password_reset_tokens.delete({
    where: { token },
  });
};
