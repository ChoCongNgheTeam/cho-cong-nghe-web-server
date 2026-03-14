import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListSpecificationsQuery, CreateSpecificationInput, UpdateSpecificationInput } from "./specification.validation";

const selectSpec = {
  id: true,
  key: true,
  name: true,
  group: true,
  unit: true,
  icon: true,
  isActive: true,
  isFilterable: true,
  filterType: true,
  isRequired: true,
  sortOrder: true,
  createdAt: true,
} satisfies Prisma.specificationsSelect;

const buildWhere = (query: ListSpecificationsQuery): Prisma.specificationsWhereInput => {
  const where: Prisma.specificationsWhereInput = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.isFilterable !== undefined) where.isFilterable = query.isFilterable;
  if (query.group) where.group = { contains: query.group, mode: "insensitive" };
  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { key: { contains: query.search, mode: "insensitive" } }];
  }
  return where;
};

export const findAll = async (query: ListSpecificationsQuery) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;
  const where = buildWhere(query);

  const [data, total] = await prisma.$transaction([
    prisma.specifications.findMany({ where, select: selectSpec, orderBy: { [sortBy]: sortOrder }, skip, take: limit }),
    prisma.specifications.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// Public — cho ProductForm
export const findAllActive = async () => {
  return prisma.specifications.findMany({
    where: { isActive: true },
    select: selectSpec,
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });
};

export const findById = async (id: string) => {
  return prisma.specifications.findUnique({ where: { id }, select: selectSpec });
};

export const checkKeyExists = async (key: string, excludeId?: string) => {
  const spec = await prisma.specifications.findFirst({
    where: { key, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return !!spec;
};

export const create = async (data: CreateSpecificationInput) => {
  return prisma.specifications.create({ data, select: selectSpec });
};

export const update = async (id: string, data: UpdateSpecificationInput) => {
  return prisma.specifications.update({ where: { id }, data, select: selectSpec });
};
