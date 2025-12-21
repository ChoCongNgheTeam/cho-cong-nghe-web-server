import prisma from "@/config/db";

export const findAllWithChildren = async () => {
  return prisma.category.findMany({
    include: {
      children: {
        include: { children: true }, // hỗ trợ nested 2 level, đủ dùng cho shop nhỏ
      },
      parent: true,
    },
    orderBy: { name: "asc" },
  });
};

export const findById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
      children: true,
      parent: true,
    },
  });
};

export const create = async (data: { name: string; description?: string; parentId?: string }) => {
  return prisma.category.create({ data });
};

export const update = async (
  id: string,
  data: Partial<{ name: string; description?: string; parentId?: string }>
) => {
  return prisma.category.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  return prisma.category.delete({ where: { id } });
};
