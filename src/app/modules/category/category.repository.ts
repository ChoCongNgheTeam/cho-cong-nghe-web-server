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
  onlyActive: boolean,
): Prisma.categoriesWhereInput => {
  const where: Prisma.categoriesWhereInput = {};

  if (onlyActive) {
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

const buildCategoryOrderBy = (
  query: ListCategoriesQuery,
): Prisma.categoriesOrderByWithRelationInput[] => {
  const orderBy: Prisma.categoriesOrderByWithRelationInput[] = [];

  if (query.sortBy === "createdAt") {
    orderBy.push({ createdAt: query.sortOrder });
  } else if (query.sortBy === "name") {
    orderBy.push({ name: query.sortOrder });
  } else {
    orderBy.push({ position: query.sortOrder });
  }

  return orderBy;
};

export const findAllPublic = async (query: ListCategoriesQuery) => {
  const where = buildCategoryWhere(query, true);
  const orderBy = buildCategoryOrderBy(query);

  return await prisma.categories.findMany({
    where,
    orderBy,
    select: {
      ...selectCategory,
      description: true,
      _count: {
        select: { children: true },
      },
    },
  });
};

export const findAllAdmin = async (query: ListCategoriesQuery) => {
  const where = buildCategoryWhere(query, false);
  const orderBy = buildCategoryOrderBy(query);

  return await prisma.categories.findMany({
    where,
    orderBy,
    select: {
      ...selectCategory,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { children: true },
      },
    },
  });
};

export const findAll = async (onlyActive: boolean = false) => {
  return prisma.categories.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    select: {
      ...selectCategory,
      _count: {
        select: { children: true },
      },
    },
    orderBy: { position: "asc" },
  });
};

export const findRootCategories = async (onlyActive: boolean = true) => {
  return prisma.categories.findMany({
    where: {
      parentId: null,
      ...(onlyActive && { isActive: true }),
    },
    select: {
      ...selectCategory,
      _count: {
        select: { children: true },
      },
    },
    orderBy: { position: "asc" },
  });
};

export const findFeaturedCategories = async (limit?: number) => {
  return prisma.categories.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    select: {
      ...selectCategory,
    },
    orderBy: { position: "asc" },
    ...(limit && { take: limit }),
  });
};

export const findAllCategoriesForTree = async (onlyActive: boolean = true) => {
  return prisma.categories.findMany({
    where: {
      ...(onlyActive && { isActive: true }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      position: true,
    },
    orderBy: { position: "asc" },
  });
};

export const findById = async (id: string) => {
  return prisma.categories.findUnique({
    where: { id },
    select: selectCategory,
  });
};

export const findBySlug = async (slug: string) => {
  return prisma.categories.findUnique({
    where: { slug },
    select: {
      ...selectCategory,
      description: true,
      children: {
        select: selectCategory,
        where: { isActive: true },
        orderBy: { position: "asc" },
      },
    },
  });
};

export const create = async (data: CreateCategoryData) => {
  return prisma.categories.create({
    data,
    select: selectCategory,
  });
};

export const update = async (id: string, data: UpdateCategoryData) => {
  return prisma.categories.update({
    where: { id },
    data,
    select: selectCategory,
  });
};

export const remove = async (id: string) => {
  return prisma.categories.delete({
    where: { id },
  });
};

export const countSiblings = async (parentId: string | null) => {
  return prisma.categories.count({
    where: { parentId },
  });
};

export const hasChildren = async (id: string): Promise<boolean> => {
  const count = await prisma.categories.count({
    where: { parentId: id },
  });
  return count > 0;
};

export const hasProducts = async (id: string): Promise<boolean> => {
  const count = await prisma.products.count({
    where: { categoryId: id },
  });
  return count > 0;
};

export const findSiblings = async (parentId: string | null) => {
  return prisma.categories.findMany({
    where: { parentId },
    select: selectCategory,
    orderBy: { position: "asc" },
  });
};

export const existsByNameInParent = async (
  name: string,
  parentId: string | null,
  excludeId?: string,
) => {
  const category = await prisma.categories.findFirst({
    where: {
      name,
      parentId,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!category;
};

type CategoryNode = {
  id: string;
  parentId: string | null;
};

async function getCategoryHierarchy(categoryId: string): Promise<string[]> {
  const result: string[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const category: CategoryNode | null = await prisma.categories.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        parentId: true,
      },
    });

    if (!category) break;

    result.push(category.id);
    currentId = category.parentId;
  }

  return result;
}

export const getCategoryVariantAttributes = async (categoryId: string) => {
  const categoryIds = await getCategoryHierarchy(categoryId);

  const categoryAttributes = await prisma.category_variant_attributes.findMany({
    where: {
      categoryId: { in: categoryIds },
    },
    include: {
      attribute: {
        select: {
          id: true,
          code: true,
          name: true,
          createdAt: true,
        },
      },
    },
  });

  const attributesMap = new Map<string, any>();

  for (const ca of categoryAttributes.reverse()) {
    if (!attributesMap.has(ca.attributeId)) {
      attributesMap.set(ca.attributeId, {
        id: ca.attribute.id,
        code: ca.attribute.code,
        name: ca.attribute.name,
        isRequired: true,
      });
    }
  }

  return Array.from(attributesMap.values());
};

export const getAttributeOptions = async (attributeId: string) => {
  return prisma.attributes_options.findMany({
    where: { attributeId },
    select: {
      id: true,
      value: true,
      label: true,
    },
    orderBy: { value: "asc" },
  });
};

export const getCategorySpecifications = async (categoryId: string) => {
  const categoryIds = await getCategoryHierarchy(categoryId);

  const categorySpecs = await prisma.category_specifications.findMany({
    where: {
      categoryId: { in: categoryIds },
    },
    include: {
      specification: {
        select: {
          id: true,
          key: true,
          name: true,
          group: true,
          unit: true,
          icon: true,
          isFilterable: true,
          isRequired: true,
          sortOrder: true,
        },
      },
    },
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
    if (!grouped[spec.groupName]) {
      grouped[spec.groupName] = [];
    }
    grouped[spec.groupName].push(spec);
  }

  return Object.entries(grouped).map(([groupName, items]) => ({
    groupName,
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
};

export const getAllAttributes = async () => {
  return prisma.attributes.findMany({
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
};

export const getAllSpecifications = async () => {
  return prisma.specifications.findMany({
    select: {
      id: true,
      key: true,
      name: true,
      group: true,
      unit: true,
      icon: true,
    },
    orderBy: [{ group: "asc" }, { name: "asc" }],
  });
};
