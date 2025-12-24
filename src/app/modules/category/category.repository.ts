import { Prisma } from "@prisma/client";
import prisma from "@/config/db";

const selectCategory = {
  id: true,
  name: true,
  slug: true,
  parentId: true,
  description: true,
  categoryImage: true,
  position: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

type CreateCategoryData = Prisma.categoriesCreateInput;
type UpdateCategoryData = Prisma.categoriesUpdateInput;

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

// Lấy category tree đầy đủ cho menu (recursive)
// export const findCategoryTree = async (onlyActive: boolean = true) => {
//   const categories = await prisma.categories.findMany({
//     where: {
//       parentId: null,
//       ...(onlyActive && { isActive: true }),
//     },
//     select: {
//       ...selectCategory,
//       children: {
//         select: {
//           ...selectCategory,
//           children: {
//             select: selectCategory,
//             orderBy: { position: "asc" },
//           },
//         },
//         orderBy: { position: "asc" },
//       },
//     },
//     orderBy: { position: "asc" },
//   });

//   return categories;
// };

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

// Lấy category với children
// export const findByIdWithChildren = async (id: string) => {
//   return prisma.categories.findUnique({
//     where: { id },
//     select: {
//       ...selectCategory,
//       parent: {
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//         },
//       },
//       children: {
//         select: {
//           ...selectCategory,
//           _count: {
//             select: {
//               children: true,
//             },
//           },
//         },
//         orderBy: { position: "asc" },
//       },
//       _count: {
//         select: {
//           children: true,
//           productCategories: true,
//         },
//       },
//     },
//   });
// };

// Lấy category theo ID (simple)
export const findById = async (id: string) => {
  return prisma.categories.findUnique({
    where: { id },
    select: selectCategory,
  });
};

// export const getMaxPositionByParent = async (parentId: string | null) => {
//   const result = await prisma.categories.aggregate({
//     where: { parentId },
//     _max: {
//       position: true,
//     },
//   });

//   return result._max.position ?? -1;
// };

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
  const count = await prisma.product_categories.count({
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
  excludeId?: string
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
