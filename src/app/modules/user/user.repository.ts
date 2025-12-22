import prisma from "src/config/db";

const selectUserWithoutPassword = {
  id: true,
  userName: true,
  email: true,
  fullName: true,
  phone: true,
  gender: true,
  role: true,
  isActive: true,
  avatarImage: true,
  createdAt: true,
  updatedAt: true,
};

export const findAll = async () => {
  return prisma.users.findMany({
    select: selectUserWithoutPassword,
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (id: string) => {
  return prisma.users.findUnique({
    where: { id },
    select: selectUserWithoutPassword,
  });
};

export const findByEmail = async (email: string) => {
  return prisma.users.findUnique({
    where: { email },
  });
};

export const create = async (data: any) => {
  return prisma.users.create({
    data,
    select: selectUserWithoutPassword,
  });
};

export const update = async (id: string, data: any) => {
  return prisma.users.update({
    where: { id },
    data,
    select: selectUserWithoutPassword,
  });
};

export const remove = async (id: string) => {
  return prisma.users.delete({ where: { id } });
};
