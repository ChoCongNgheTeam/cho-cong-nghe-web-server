import { Prisma } from "@prisma/client";
import prisma from "@/config/db";

const selectCategory = {
  id: true,
  name: true,
  slug: true,
  parentId: true,
  imageUrl: true,
  position: true,
  isFeatured: true,
  isActive: true,
};

type CreateCategoryData = Prisma.categoriesCreateInput;
type UpdateCategoryData = Prisma.categoriesUpdateInput;

// =====================
// === EXISTING CODE ===
// =====================

// Lấy tất cả categories
export const findAll = async (onlyActive: boolean = false) => {
  return prisma.categories.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    select: {
      ...selectCategory,
      _count: {
        select: {
          children: true,
        },
      },
    },
    orderBy: { position: "asc" },
  });
};

// Lấy root categories (không có parent)
export const findRootCategories = async (onlyActive: boolean = true) => {
  return prisma.categories.findMany({
    where: {
      parentId: null,
      ...(onlyActive && { isActive: true }),
    },
    select: {
      ...selectCategory,
      _count: {
        select: {
          children: true,
        },
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

// Lấy category theo ID (simple)
export const findById = async (id: string) => {
  return prisma.categories.findUnique({
    where: { id },
    select: selectCategory,
  });
};

// Lấy category theo slug
export const findBySlug = async (slug: string) => {
  return prisma.categories.findUnique({
    where: { slug },
    select: {
      ...selectCategory,
      children: {
        select: selectCategory,
        where: { isActive: true },
        orderBy: { position: "asc" },
      },
    },
  });
};

// Tạo category
export const create = async (data: CreateCategoryData) => {
  return prisma.categories.create({
    data,
    select: selectCategory,
  });
};

// Update category
export const update = async (id: string, data: UpdateCategoryData) => {
  return prisma.categories.update({
    where: { id },
    data,
    select: selectCategory,
  });
};

// Xóa category
export const remove = async (id: string) => {
  return prisma.categories.delete({
    where: { id },
  });
};

// Đếm số categories cùng parent
export const countSiblings = async (parentId: string | null) => {
  return prisma.categories.count({
    where: { parentId },
  });
};

// Check category có children không
export const hasChildren = async (id: string): Promise<boolean> => {
  const count = await prisma.categories.count({
    where: { parentId: id },
  });
  return count > 0;
};

// Check category có products không
export const hasProducts = async (id: string): Promise<boolean> => {
  const count = await prisma.products.count({
    where: { categoryId: id },
  });
  return count > 0;
};

// Lấy siblings (categories cùng parent)
export const findSiblings = async (parentId: string | null) => {
  return prisma.categories.findMany({
    where: { parentId },
    select: selectCategory,
    orderBy: { position: "asc" },
  });
};

// Check name đã tồn tại chưa (trong cùng parent)
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

/**
 * Lấy category hierarchy (từ con → cha → ông)
 */
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

/**
 * Lấy variant attributes cho category (kế thừa từ hierarchy)
 */
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

  // Deduplicate: Ưu tiên category con
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

/**
 * Lấy options cho một attribute
 */
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

/**
 * Lấy specifications cho category (kế thừa từ hierarchy, grouped)
 */
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

  // Deduplicate: Ưu tiên category con
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

  // Group theo groupName
  const grouped: Record<string, any[]> = {};

  for (const spec of Array.from(specsMap.values())) {
    if (!grouped[spec.groupName]) {
      grouped[spec.groupName] = [];
    }
    grouped[spec.groupName].push(spec);
  }

  // Convert to array
  return Object.entries(grouped).map(([groupName, items]) => ({
    groupName,
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
};

/**
 * Lấy tất cả attributes (cho dropdown custom)
 */
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

/**
 * Lấy tất cả specifications (cho dropdown custom)
 */
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
