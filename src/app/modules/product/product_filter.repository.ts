import prisma from "@/config/db";

//
// Helper: Lấy tất cả descendant category IDs từ một slug (dùng recursive CTE)
//
export const getDescendantCategoryIds = async (slug: string): Promise<{ ids: string[]; rootId: string; rootName: string; rootSlug: string } | null> => {
  const result = await prisma.$queryRaw<{ id: string; name: string; slug: string }[]>`
    WITH RECURSIVE subcategories AS (
      SELECT id, name, slug, "parentId"
      FROM categories
      WHERE slug = ${slug} AND "deletedAt" IS NULL AND "isActive" = true

      UNION ALL

      SELECT c.id, c.name, c.slug, c."parentId"
      FROM categories c
      JOIN subcategories sc ON c."parentId" = sc.id
      WHERE c."deletedAt" IS NULL AND c."isActive" = true
    )
    SELECT id, name, slug FROM subcategories;
  `;

  if (result.length === 0) return null;

  // Row đầu tiên là category gốc (WHERE slug = ...)
  const root = result[0];

  return {
    ids: result.map((r) => r.id),
    rootId: root.id,
    rootName: root.name,
    rootSlug: root.slug,
  };
};

// Lấy tất cả specifications có isFilterable = true của một tập category IDs
// Kết quả: distinct specs theo key, kèm groupName và unit
export const getFilterableSpecsByCategories = async (categoryIds: string[]) => {
  return prisma.category_specifications.findMany({
    where: {
      categoryId: { in: categoryIds },
      specification: {
        isFilterable: true,
      },
    },
    select: {
      groupName: true,
      sortOrder: true,
      specification: {
        select: {
          id: true,
          key: true,
          name: true,
          unit: true,
          group: true,
          sortOrder: true,
          filterType: true, // ✅ Prisma enum: RANGE | ENUM | BOOLEAN | null
        },
      },
    },
    orderBy: { sortOrder: "asc" },
    distinct: ["specificationId"],
  });
};

// Lấy tất cả distinct values của một spec trong một tập category
// Dùng để build ENUM options
export const getDistinctSpecValues = async (specificationId: string, categoryIds: string[]): Promise<string[]> => {
  const rows = await prisma.product_specifications.findMany({
    where: {
      specificationId,
      product: {
        isActive: true,
        deletedAt: null,
        categoryId: { in: categoryIds },
      },
    },
    select: { value: true },
    distinct: ["value"],
  });

  return rows.map((r) => r.value).filter(Boolean);
};

// Lấy min/max value của một spec số (RANGE)
export const getSpecValueRange = async (specificationId: string, categoryIds: string[]): Promise<{ min: number; max: number } | null> => {
  const rows = await prisma.product_specifications.findMany({
    where: {
      specificationId,
      product: {
        isActive: true,
        deletedAt: null,
        categoryId: { in: categoryIds },
      },
    },
    select: { value: true },
  });

  const numbers = rows.map((r) => parseFloat(r.value)).filter((n) => !isNaN(n));

  if (numbers.length === 0) return null;

  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
};

// Lấy variant attribute options có trong tập category
// attributes như: color, storage, ram, inch...
export const getVariantAttributesByCategories = async (categoryIds: string[]) => {
  // Lấy attribute codes được config cho categories này
  const categoryAttributes = await prisma.category_variant_attributes.findMany({
    where: {
      categoryId: { in: categoryIds },
    },
    select: {
      attribute: {
        select: {
          id: true,
          code: true,
          name: true,
          options: {
            select: {
              id: true,
              value: true,
              label: true,
            },
          },
        },
      },
    },
    distinct: ["attributeId"],
  });

  return categoryAttributes.map((ca) => ca.attribute);
};

//
// Lấy distinct attribute option values thực sự có trong products của category
// (tránh show option không có sản phẩm nào)
export const getActiveAttributeOptionValues = async (attributeCode: string, categoryIds: string[]): Promise<{ value: string; label: string; optionId: string }[]> => {
  const rows = await prisma.variants_attributes.findMany({
    where: {
      productVariant: {
        isActive: true,
        deletedAt: null,
        product: {
          isActive: true,
          deletedAt: null,
          categoryId: { in: categoryIds },
        },
      },
      attributeOption: {
        attribute: {
          code: attributeCode,
        },
      },
    },
    select: {
      attributeOption: {
        select: {
          id: true,
          value: true,
          label: true,
        },
      },
    },
    distinct: ["attributeOptionId"],
  });

  return rows.map((r) => ({
    optionId: r.attributeOption.id,
    value: r.attributeOption.value,
    label: r.attributeOption.label,
  }));
};

// Lấy price range thực tế của products trong category
export const getPriceRangeByCategories = async (categoryIds: string[]): Promise<{ min: number; max: number }> => {
  const result = await prisma.products_variants.aggregate({
    where: {
      isActive: true,
      deletedAt: null,
      product: {
        isActive: true,
        deletedAt: null,
        categoryId: { in: categoryIds },
      },
    },
    _min: { price: true },
    _max: { price: true },
  });

  return {
    min: Number(result._min.price ?? 0),
    max: Number(result._max.price ?? 0),
  };
};

// Lấy danh sách brands có sản phẩm trong category
export const getActiveBrandsByCategories = async (categoryIds: string[]) => {
  const brands = await prisma.brands.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      products: {
        some: {
          isActive: true,
          deletedAt: null,
          categoryId: { in: categoryIds },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return brands;
};
