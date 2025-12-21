import prisma from "@/config/db";
import { Prisma } from "@prisma/client";

export const findMany = async ({
  categoryId,
  search,
}: {
  categoryId?: string;
  search?: string;
}) => {
  const where: Prisma.ProductWhereInput = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};

export const create = async (data: any) => {
  return prisma.product.create({ data, include: { category: true } });
};

export const update = async (id: string, data: any) => {
  return prisma.product.update({ where: { id }, data, include: { category: true } });
};

export const remove = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};
