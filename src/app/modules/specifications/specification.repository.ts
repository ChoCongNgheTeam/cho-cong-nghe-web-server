import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListSpecificationsQuery, CreateSpecificationInput, UpdateSpecificationInput, UpsertCategorySpecInput } from "./specification.validation";

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

  const [data, total, activeCount, inactiveCount, filterableCount] = await prisma.$transaction([
    prisma.specifications.findMany({
      where,
      select: selectSpec,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.specifications.count({ where }),
    prisma.specifications.count({ where: { isActive: true } }),
    prisma.specifications.count({ where: { isActive: false } }),
    prisma.specifications.count({ where: { isFilterable: true } }),
  ]);

  const activeCounts = {
    ALL: activeCount + inactiveCount,
    ACTIVE: activeCount,
    INACTIVE: inactiveCount,
    FILTERABLE: filterableCount,
  };

  return { data, page, limit, total, totalPages: Math.ceil(total / limit), activeCounts };
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

const selectCategorySpec = {
  categoryId: true,
  specificationId: true,
  groupName: true,
  isRequired: true,
  sortOrder: true,
  specification: { select: selectSpec },
} satisfies Prisma.category_specificationsSelect;

export const findCategorySpecs = async (categoryId: string) => {
  return prisma.category_specifications.findMany({
    where: { categoryId },
    select: selectCategorySpec,
    orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
  });
};

export const upsertCategorySpec = async (categoryId: string, data: UpsertCategorySpecInput) => {
  return prisma.category_specifications.upsert({
    where: {
      categoryId_specificationId: {
        categoryId,
        specificationId: data.specificationId,
      },
    },
    create: { categoryId, ...data },
    update: {
      groupName: data.groupName,
      isRequired: data.isRequired,
      sortOrder: data.sortOrder,
    },
    select: selectCategorySpec,
  });
};

export const bulkUpsertCategorySpecs = async (categoryId: string, items: UpsertCategorySpecInput[]) => {
  return prisma.$transaction(
    items.map((item) =>
      prisma.category_specifications.upsert({
        where: {
          categoryId_specificationId: {
            categoryId,
            specificationId: item.specificationId,
          },
        },
        create: { categoryId, ...item },
        update: {
          groupName: item.groupName,
          isRequired: item.isRequired,
          sortOrder: item.sortOrder,
        },
        select: selectCategorySpec,
      }),
    ),
  );
};

export const removeCategorySpec = async (categoryId: string, specificationId: string) => {
  return prisma.category_specifications.delete({
    where: {
      categoryId_specificationId: { categoryId, specificationId },
    },
  });
};

export const checkCategoryExists = async (categoryId: string) => {
  const cat = await prisma.categories.findUnique({
    where: { id: categoryId, deletedAt: null },
    select: { id: true, name: true },
  });
  return cat;
};
