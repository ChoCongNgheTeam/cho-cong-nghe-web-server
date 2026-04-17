import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListAttributesQuery, CreateAttributeInput, UpdateAttributeInput, CreateOptionInput, UpdateOptionInput } from "./attribute.validation";

const selectAttribute = {
  id: true,
  code: true,
  name: true,
  isActive: true,
  createdAt: true,
  options: {
    select: { id: true, value: true, label: true, isActive: true },
    orderBy: { value: "asc" as const },
  },
} satisfies Prisma.attributesSelect;

const buildWhere = (query: ListAttributesQuery): Prisma.attributesWhereInput => {
  const where: Prisma.attributesWhereInput = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { code: { contains: query.search, mode: "insensitive" } }];
  }
  return where;
};

export const findAll = async (query: ListAttributesQuery) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;
  const where = buildWhere(query);

  // sortBy "optionCount" cần xử lý riêng vì Prisma chưa hỗ trợ sort theo _count trực tiếp
  if (sortBy === "optionCount") {
    const [allData, total, activeCount, inactiveCount] = await prisma.$transaction([
      prisma.attributes.findMany({
        where,
        select: selectAttribute,
        orderBy: { options: { _count: sortOrder } },
        skip,
        take: limit,
      }),
      prisma.attributes.count({ where }),
      prisma.attributes.count({ where: { isActive: true } }),
      prisma.attributes.count({ where: { isActive: false } }),
    ]);

    return {
      data: allData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      activeCounts: {
        ALL: activeCount + inactiveCount,
        ACTIVE: activeCount,
        INACTIVE: inactiveCount,
      },
    };
  }

  const [data, total, activeCount, inactiveCount] = await prisma.$transaction([
    prisma.attributes.findMany({
      where,
      select: selectAttribute,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.attributes.count({ where }),
    prisma.attributes.count({ where: { isActive: true } }),
    prisma.attributes.count({ where: { isActive: false } }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    activeCounts: {
      ALL: activeCount + inactiveCount,
      ACTIVE: activeCount,
      INACTIVE: inactiveCount,
    },
  };
};

// Public: chỉ lấy active, dùng cho ProductForm
export const findAllActive = async () => {
  return prisma.attributes.findMany({
    where: { isActive: true },
    select: selectAttribute,
    orderBy: { name: "asc" },
  });
};

export const findById = async (id: string) => {
  return prisma.attributes.findUnique({ where: { id }, select: selectAttribute });
};

export const checkCodeExists = async (code: string, excludeId?: string) => {
  const attr = await prisma.attributes.findFirst({
    where: { code, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return !!attr;
};

export const create = async (data: CreateAttributeInput) => {
  return prisma.attributes.create({ data, select: selectAttribute });
};

export const update = async (id: string, data: UpdateAttributeInput) => {
  return prisma.attributes.update({ where: { id }, data, select: selectAttribute });
};

// Options
export const createOption = async (attributeId: string, data: CreateOptionInput) => {
  return prisma.attributes_options.create({
    data: { ...data, attributeId },
    select: { id: true, value: true, label: true, isActive: true, attributeId: true },
  });
};

export const updateOption = async (optionId: string, data: UpdateOptionInput) => {
  return prisma.attributes_options.update({
    where: { id: optionId },
    data,
    select: { id: true, value: true, label: true, isActive: true, attributeId: true },
  });
};

export const checkOptionValueExists = async (attributeId: string, value: string, excludeId?: string) => {
  const opt = await prisma.attributes_options.findFirst({
    where: { attributeId, value, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  return !!opt;
};
