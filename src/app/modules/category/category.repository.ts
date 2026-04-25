import { Prisma } from "@prisma/client";
import prisma from "@/config/db";
import { ListCategoriesQuery } from "./category.validation";

// ─────────────────────────────────────────────────────────────────────────────
// SELECTS
// ─────────────────────────────────────────────────────────────────────────────

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
} satisfies Prisma.categoriesSelect;

const selectCategoryAdmin = {
  ...selectCategory,
  description: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
} satisfies Prisma.categoriesSelect;

type CreateCategoryData = Prisma.categoriesCreateInput;
type UpdateCategoryData = Prisma.categoriesUpdateInput;

type CategoryNode = { id: string; parentId: string | null };

// ─────────────────────────────────────────────────────────────────────────────
// WHERE / ORDER BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

const buildCategoryWhere = (query: ListCategoriesQuery, onlyActive: boolean, isAdmin: boolean): Prisma.categoriesWhereInput => {
  const where: Prisma.categoriesWhereInput = {};

  if (!isAdmin || !query.includeDeleted) {
    where.deletedAt = null;
  }

  if (onlyActive) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

  // rootOnly=true  → WHERE parentId IS NULL (chỉ danh mục gốc)
  // parentId=UUID  → WHERE parentId = UUID (con của parent cụ thể)
  if (query.rootOnly === true) {
    where.parentId = null;
  } else if (query.parentId !== undefined) {
    where.parentId = query.parentId;
  }

  return where;
};

const buildCategoryOrderBy = (query: ListCategoriesQuery): Prisma.categoriesOrderByWithRelationInput[] => {
  if (query.sortBy === "createdAt") return [{ createdAt: query.sortOrder }];
  if (query.sortBy === "name") return [{ name: query.sortOrder }];
  return [{ position: query.sortOrder }];
};

// ─────────────────────────────────────────────────────────────────────────────
// FINDS
// ─────────────────────────────────────────────────────────────────────────────

export const findAllPublic = async (query: ListCategoriesQuery) => {
  const where = buildCategoryWhere(query, true, false);
  const orderBy = buildCategoryOrderBy(query);

  return prisma.categories.findMany({
    where,
    orderBy,
    select: {
      ...selectCategory,
      description: true,
      _count: { select: { children: true } },
    },
  });
};

export const findAllAdmin = async (query: ListCategoriesQuery) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const where = buildCategoryWhere(query, false, true);
  const orderBy = buildCategoryOrderBy(query);
  const baseWhere = buildCategoryWhere({ ...query, isActive: undefined, isFeatured: undefined }, false, true);

  const [data, total, countAll, countActive, countInactive, countFeatured] = await Promise.all([
    prisma.categories.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        ...selectCategoryAdmin,
        _count: { select: { children: true ,products: true} },
      },
    }),
    prisma.categories.count({ where }),
    prisma.categories.count({ where: baseWhere }),
    prisma.categories.count({ where: { ...baseWhere, isActive: true } }),
    prisma.categories.count({ where: { ...baseWhere, isActive: false } }),
    prisma.categories.count({ where: { ...baseWhere, isFeatured: true } }),
  ]);

  const statusCounts = { ALL: countAll, active: countActive, inactive: countInactive, featured: countFeatured };
  return { data, page, limit, total, totalPages: Math.ceil(total / limit), statusCounts };
};

export const findAll = async (onlyActive = false) => {
  return prisma.categories.findMany({
    where: {
      deletedAt: null,
      ...(onlyActive && { isActive: true }),
    },
    select: {
      ...selectCategory,
      _count: { select: { children: true } },
    },
    orderBy: { position: "asc" },
  });
};

export const findRootCategories = async (onlyActive = true) => {
  return prisma.categories.findMany({
    where: {
      parentId: null,
      deletedAt: null,
      ...(onlyActive && { isActive: true }),
    },
    select: {
      ...selectCategory,
      _count: { select: { children: true } },
    },
    orderBy: { position: "asc" },
  });
};

export const findFeaturedCategories = async (limit?: number) => {
  return prisma.categories.findMany({
    where: { isFeatured: true, isActive: true, deletedAt: null },
    select: selectCategory,
    orderBy: { position: "asc" },
    ...(limit && { take: limit }),
  });
};

export const findAllCategoriesForTree = async (onlyActive = true) => {
  return prisma.categories.findMany({
    where: {
      deletedAt: null,
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

export const findById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const { includeDeleted = false, isAdmin = false } = options;

  return prisma.categories.findFirst({
    where: {
      id,
      ...(!isAdmin || !includeDeleted ? { deletedAt: null } : {}),
    },
    select: isAdmin ? selectCategoryAdmin : selectCategory,
  });
};

/**
 * findByIdWithRelations
 *
 * Dùng cho admin detail page — lấy full fields + parent + children (1 level).
 * Khác với findById: select thêm imageUrl/imagePath/description/timestamps
 * và join trực tiếp parent + children thay vì dùng tree builder.
 */
export const findByIdWithRelations = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const { includeDeleted = false } = options;

  return prisma.categories.findFirst({
    where: {
      id,
      ...(!includeDeleted ? { deletedAt: null } : {}),
    },
    select: {
      // full admin fields
      ...selectCategoryAdmin,
      // parent — chỉ cần basic info
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          position: true,
        },
      },
      // children — 1 level deep với basic info
      children: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          imageUrl: true,
          imagePath: true,
          position: true,
          isActive: true,
          isFeatured: true,
          _count: { select: { children: true } },
        },
        orderBy: { position: "asc" },
      },
      // count
      _count: { select: { children: true } },
    },
  });
};

export const findBySlug = async (slug: string) => {
  return prisma.categories.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      ...selectCategory,
      description: true,
      children: {
        where: { isActive: true, deletedAt: null },
        select: selectCategory,
        orderBy: { position: "asc" },
      },
    },
  });
};

export const create = async (data: CreateCategoryData) => {
  return prisma.categories.create({ data, select: selectCategory });
};

export const update = async (id: string, data: UpdateCategoryData) => {
  return prisma.categories.update({
    where: { id, deletedAt: null },
    data,
    select: selectCategoryAdmin,
  });
};

export const softDelete = async (id: string, deletedById: string) => {
  return prisma.categories.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy: deletedById,
      isActive: false,
    },
  });
};

export const restore = async (id: string) => {
  return prisma.categories.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
    select: selectCategoryAdmin,
  });
};

export const hardDelete = async (id: string) => {
  return prisma.categories.delete({ where: { id } });
};

export const countSiblings = async (parentId: string | null) => {
  return prisma.categories.count({
    where: { parentId, deletedAt: null },
  });
};

export const hasChildren = async (id: string): Promise<boolean> => {
  const count = await prisma.categories.count({
    where: { parentId: id, deletedAt: null },
  });
  return count > 0;
};

export const hasProducts = async (id: string): Promise<boolean> => {
  const count = await prisma.products.count({
    where: { categoryId: id, deletedAt: null },
  });
  return count > 0;
};

export const findSiblings = async (parentId: string | null) => {
  return prisma.categories.findMany({
    where: { parentId, deletedAt: null },
    select: selectCategory,
    orderBy: { position: "asc" },
  });
};

export const existsByNameInParent = async (name: string, parentId: string | null, excludeId?: string) => {
  const category = await prisma.categories.findFirst({
    where: {
      name,
      parentId,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!category;
};

async function getCategoryHierarchy(categoryId: string): Promise<string[]> {
  const result: string[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const category: CategoryNode | null = await prisma.categories.findFirst({
      where: { id: currentId, deletedAt: null },
      select: { id: true, parentId: true },
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
    where: { categoryId: { in: categoryIds } },
    include: {
      attribute: {
        select: { id: true, code: true, name: true, createdAt: true },
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
    select: { id: true, value: true, label: true },
    orderBy: { value: "asc" },
  });
};

export const getCategorySpecifications = async (categoryId: string) => {
  const categoryIds = await getCategoryHierarchy(categoryId);

  const categorySpecs = await prisma.category_specifications.findMany({
    where: { categoryId: { in: categoryIds } },
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
    if (!grouped[spec.groupName]) grouped[spec.groupName] = [];
    grouped[spec.groupName].push(spec);
  }

  return Object.entries(grouped)
    .map(([groupName, items]) => ({
      groupName,
      items: items.sort((a, b) => a.sortOrder - b.sortOrder),
      minSort: Math.min(...items.map((i) => i.sortOrder)),
    }))
    .sort((a, b) => a.minSort - b.minSort)
    .map(({ groupName, items }) => ({ groupName, items }));
};

export const getAllAttributes = async () => {
  return prisma.attributes.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { name: "asc" },
  });
};

export const getAllSpecifications = async () => {
  return prisma.specifications.findMany({
    select: { id: true, key: true, name: true, group: true, unit: true, icon: true },
    orderBy: [{ group: "asc" }, { name: "asc" }],
  });
};

export const findAllDeleted = async (options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.categories.findMany({
      where: { deletedAt: { not: null } },
      select: {
        ...selectCategoryAdmin,
        _count: { select: { children: true } },
      },
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.categories.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { data, total, page, limit };
};
