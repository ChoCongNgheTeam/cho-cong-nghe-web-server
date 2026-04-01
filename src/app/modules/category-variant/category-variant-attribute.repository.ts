import prisma from "prisma/client";

/** Lấy tất cả categories (flat) kèm attributes đang liên kết */
export const findAllCategoriesWithAttributes = async () => {
  return prisma.categories.findMany({
    where: { deletedAt: null },
    orderBy: [{ parentId: "asc" }, { position: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      isActive: true,
      variantAttributes: {
        select: {
          attribute: {
            select: { id: true, code: true, name: true },
          },
        },
      },
    },
  });
};

/** Lấy 1 category kèm attributes */
export const findCategoryWithAttributes = async (categoryId: string) => {
  return prisma.categories.findFirst({
    where: { id: categoryId, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      isActive: true,
      variantAttributes: {
        select: {
          attribute: {
            select: { id: true, code: true, name: true },
          },
        },
      },
    },
  });
};

/**
 * Set attributes cho 1 category (replace hoàn toàn).
 * Dùng transaction: xóa cũ → insert mới.
 */
export const setCategoryAttributes = async (categoryId: string, attributeIds: string[]) => {
  return prisma.$transaction([
    prisma.category_variant_attributes.deleteMany({ where: { categoryId } }),
    prisma.category_variant_attributes.createMany({
      data: attributeIds.map((attributeId) => ({ categoryId, attributeId })),
      skipDuplicates: true,
    }),
  ]);
};

/** Lấy tất cả attributes (để FE render gợi ý) */
export const findAllAttributes = async () => {
  return prisma.attributes.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true },
  });
};
