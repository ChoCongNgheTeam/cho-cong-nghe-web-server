import { Prisma } from "@prisma/client";
import prisma from "@/config/db";
import { ListCategoriesQuery } from "./category.validation";

const selectCategory = {
  id: true,
  name: true,
  slug: true,
  parentId: true,
  imageUrl: true,
  imagePath: true,
  position: true,
  isFeatured: true,
  isActive: true,
};

type CreateCategoryData = Prisma.categoriesCreateInput;
type UpdateCategoryData = Prisma.categoriesUpdateInput;

const buildCategoryWhere = (
  query: ListCategoriesQuery,
  isAdmin: boolean,
): Prisma.categoriesWhereInput => {
  const where: Prisma.categoriesWhereInput = {};

  if (isAdmin && query.includeDeleted) {
    // Lấy cả active và soft-deleted
  } else {
    where.deletedAt = null; // Mặc định chỉ lấy chưa xóa
  }

  if (!isAdmin) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured;
  }

  if (query.parentId !== undefined) {
    where.parentId = query.parentId;
  }

  return where;
};

export const findAllPublic = async (query: ListCategoriesQuery) => {
  const where = buildCategoryWhere(query, false);

  return prisma.categories.findMany({
    where,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: selectCategory,
  });
};

export const findAllAdmin = async (query: ListCategoriesQuery) => {
  const where = buildCategoryWhere(query, true);

  return prisma.categories.findMany({
    where,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
};

export const findRootCategories = async (onlyActive: boolean = false) => {
  return prisma.categories.findMany({
    where: {
      parentId: null,
      deletedAt: null,
      ...(onlyActive ? { isActive: true } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: selectCategory,
  });
};

export const findFeaturedCategories = async (limit?: number) => {
  return prisma.categories.findMany({
    where: {
      isFeatured: true,
      isActive: true,
      deletedAt: null,
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: selectCategory,
  });
};

export const findAllCategoriesForTree = async (onlyActive: boolean = false) => {
  return prisma.categories.findMany({
    where: {
      deletedAt: null,
      ...(onlyActive ? { isActive: true } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: selectCategory,
  });
};

export const findBySlug = async (slug: string, isAdmin: boolean = false) => {
  return prisma.categories.findFirst({
    where: {
      slug,
      ...(!isAdmin ? { isActive: true, deletedAt: null } : {}),
    },
    include: {
      parent: { select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } } },
      children: { select: { id: true, name: true, slug: true }, where: { deletedAt: null } },
    },
  });
};

export const findById = async (id: string, includeDeleted: boolean = false) => {
  return prisma.categories.findFirst({
    where: {
      id,
      ...(!includeDeleted ? { deletedAt: null } : {}),
    },
    include: {
      parent: { select: { id: true, name: true } },
    },
  });
};

export const checkSlugExists = async (slug: string, excludeId?: string) => {
  const category = await prisma.categories.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  return !!category;
};

export const create = async (data: CreateCategoryData) => {
  return prisma.categories.create({ data });
};

export const update = async (id: string, data: UpdateCategoryData) => {
  return prisma.categories.update({ where: { id }, data });
};

export const softDeleteCategory = async (id: string, deletedBy: string) => {
  return prisma.categories.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
      isActive: false,
    },
  });
};

export const restoreCategory = async (id: string) => {
  return prisma.categories.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedBy: null,
    },
  });
};

export const hardDeleteCategory = async (id: string) => {
  return prisma.categories.delete({ where: { id } });
};

export const findAllDeleted = async (query: ListCategoriesQuery) => {
  const where: Prisma.categoriesWhereInput = { deletedAt: { not: null } };
  
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return prisma.categories.findMany({
    where,
    orderBy: { deletedAt: "desc" },
  });
};

export const countProductsByCategoryId = async (id: string) => {
  return prisma.products.count({ where: { categoryId: id } });
};

export const countSubCategories = async (id: string) => {
  return prisma.categories.count({ where: { parentId: id, deletedAt: null } });
};

export const getCategoryVariantAttributes = async (categoryId: string) => {
  const data = await prisma.category_variant_attributes.findMany({
    where: { categoryId },
    include: { attribute: true },
  });
  return data.map((d) => d.attribute);
};

export const getCategorySpecifications = async (categoryId: string) => {
  const categorySpecs = await prisma.category_specifications.findMany({
    where: { categoryId },
    include: { specification: true },
    orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
  });

  const specsMap = new Map<string, any>();

  for (const cs of categorySpecs.reverse()) {
    if (!specsMap.has(cs.specificationId)) {
      specsMap.set(cs.specificationId, {
        id: cs.specification.id,
        key: cs.specification.key,
        name: cs.specification.name,
        groupName: cs.groupName,
        unit: cs.specification.unit,
        icon: cs.specification.icon,
        isRequired: cs.isRequired,
        isFilterable: cs.specification.isFilterable,
        sortOrder: cs.sortOrder,
      });
    }
  }

  const grouped: Record<string, any[]> = {};
  for (const spec of Array.from(specsMap.values())) {
    if (!grouped[spec.groupName]) grouped[spec.groupName] = [];
    grouped[spec.groupName].push(spec);
  }

  return Object.entries(grouped).map(([groupName, items]) => ({
    groupName,
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
};

export const getAllAttributes = async () => {
  return prisma.attributes.findMany({
    select: { id: true, code: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
};

export const getAttributeOptions = async (attributeId: string) => {
  return prisma.attributes_options.findMany({
    where: { attributeId },
    select: { id: true, value: true, label: true },
  });
};

export const getAllSpecifications = async () => {
  return prisma.specifications.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });
};