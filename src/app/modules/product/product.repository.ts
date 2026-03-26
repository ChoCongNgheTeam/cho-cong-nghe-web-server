import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListProductsQuery, ReviewsQuery } from "./product.validation";
import { OrderStatus } from "@prisma/client";
import { extractVariantOptions } from "@/helpers/variant-options";
import { HighlightSpecificationGroup } from "./product.types";
import { buildOrderBy, buildProductWhere, buildSearchCategoryAndBrandIds } from "./product_filter.where-builder";
import { validate as isUUID } from "uuid";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
// ─────────────────────────────────────────────────────────────────────────────
// SELECT FRAGMENTS
// ─────────────────────────────────────────────────────────────────────────────

const selectBrand = {
  id: true,
  name: true,
  slug: true,
};

const selectCategoryTree = {
  id: true,
  slug: true,
  parent: {
    select: {
      id: true,
      slug: true,
      parent: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  },
};

const selectColorImage = {
  id: true,
  color: true,
  imageUrl: true,
  altText: true,
  position: true,
};

const selectVariantAttribute = {
  id: true,
  attributeOption: {
    select: {
      id: true,
      value: true,
      label: true,
      attribute: {
        select: { id: true, code: true, name: true },
      },
    },
  },
};

const selectVariant = {
  id: true,
  code: true,
  price: true,
  quantity: true,
  soldCount: true,
  isDefault: true,
  isActive: true,
  variantAttributes: {
    select: selectVariantAttribute,
  },
};

// Card select — public listing
export const selectProductCard = {
  id: true,
  name: true,
  slug: true,
  brand: { select: selectBrand },
  category: { select: selectCategoryTree },
  img: {
    select: selectColorImage,
    orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
    take: 1,
  },
  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  isActive: true,
  variantDisplay: true,
  variants: {
    where: { isActive: true, deletedAt: null },
    select: selectVariant,
    orderBy: { isDefault: "desc" as const },
  },
  productSpecifications: {
    where: { isHighlight: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      specificationId: true,
      sortOrder: true,
      value: true,
      isHighlight: true,
      specification: {
        select: { id: true, key: true, group: true, name: true, icon: true, unit: true },
      },
    },
  },
  createdAt: true,
};

// Admin card — includes soft-delete fields
const selectProductCardAdmin = {
  ...selectProductCard,
  deletedAt: true,
  deletedBy: true,
  updatedAt: true,
};

// Detail select — full data for admin edit page
const selectProductDetail = {
  id: true,
  name: true,
  slug: true,
  description: true,
  brand: { select: selectBrand },
  category: { select: selectCategoryTree },
  img: {
    select: selectColorImage,
    orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
  },
  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  isActive: true,
  variantDisplay: true,
  createdAt: true,
  updatedAt: true,
  // Admin only
  deletedAt: true,
  deletedBy: true,
  variants: {
    select: selectVariant,
    orderBy: { isDefault: "desc" as const },
  },
  productSpecifications: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      specificationId: true,
      sortOrder: true,
      value: true,
      isHighlight: true,
      specification: {
        select: { id: true, key: true, group: true, name: true, icon: true, unit: true },
      },
    },
  },
};

export const selectProductSpecifications = {
  isActive: true,
  category: {
    select: {
      categorySpecifications: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          groupName: true,
          sortOrder: true,
          specification: {
            select: {
              id: true,
              key: true,
              name: true,
              icon: true,
              unit: true,
            },
          },
        },
      },
    },
  },
  productSpecifications: {
    select: {
      specificationId: true,
      value: true,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// WHERE BUILDER (admin)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build where clause cho admin product list.
 * Hỗ trợ: search, brandId, categoryId, isActive, isFeatured, dateFrom, dateTo, includeDeleted
 */
export const buildAdminProductWhere = (query: Record<string, any>): Prisma.productsWhereInput => {
  const where: Prisma.productsWhereInput = {};

  // Soft delete filter — mặc định chỉ lấy chưa bị xóa
  if (!query.includeDeleted) {
    where.deletedAt = null;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.inStock !== undefined) {
    where.variants = query.inStock
      ? {
          some: {
            quantity: { gt: 0 },
          },
        }
      : {
          every: {
            quantity: { lte: 0 },
          },
        };
  }

  if (query.brandId) {
    where.brandId = Array.isArray(query.brandId) ? { in: query.brandId } : query.brandId;
  }

  if (query.categoryId) where.categoryId = query.categoryId;

  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
      ...(query.dateTo && { lte: new Date(query.dateTo) }),
    };
  }

  return where;
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type CategoryNode = { id: string; parentId: string | null };

async function getCategoryHierarchy(categoryId: string): Promise<string[]> {
  const result: string[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const category: CategoryNode | null = await prisma.categories.findUnique({
      where: { id: currentId },
      select: { id: true, parentId: true },
    });
    if (!category) break;
    result.push(category.id);
    currentId = category.parentId;
  }

  return result;
}

export const getDescendantCategoryIds = async (slug: string) => {
  const result = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE subcategories AS (
      SELECT id FROM categories WHERE slug = ${slug}
      UNION ALL
      SELECT c.id FROM categories c JOIN subcategories sc ON c."parentId" = sc.id
    )
    SELECT id FROM subcategories;
  `;
  return result.map((r) => r.id);
};

const getAllDescendantCategoryIds = async (categoryId: string): Promise<string[]> => {
  const result = new Set<string>();
  const traverse = async (id: string) => {
    result.add(id);
    const children = await prisma.categories.findMany({
      where: { parentId: id },
      select: { id: true },
    });
    for (const child of children) await traverse(child.id);
  };
  await traverse(categoryId);
  return Array.from(result);
};

// ─────────────────────────────────────────────────────────────────────────────
// FIND — PUBLIC & ADMIN LIST
// ─────────────────────────────────────────────────────────────────────────────

const findAll = async (query: Record<string, any>, onlyActive: boolean) => {
  const { page = 1, limit = 12, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  let searchMeta: { categoryIds: string[]; brandIds: string[] } | undefined;
  if (query.search?.trim()) {
    searchMeta = await buildSearchCategoryAndBrandIds(query.search.trim(), prisma);
  }

  const where = await buildProductWhere(query, onlyActive, searchMeta);
  (where as any).deletedAt = null;

  const [data, total] = await Promise.all([
    query.search?.trim()
      ? findAllWithBrandBalance(where, limit, skip) // ← balanced
      : prisma.products.findMany({
          where,
          select: selectProductCard,
          orderBy: buildOrderBy(sortBy, sortOrder),
          skip,
          take: limit,
        }),
    prisma.products.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const findAllWithBrandBalance = async (where: Prisma.productsWhereInput, limit: number, skip: number): Promise<any[]> => {
  // Lấy tất cả brandIds có trong kết quả
  const brandRows = await prisma.products.findMany({
    where,
    select: { brandId: true },
    distinct: ["brandId"],
  });

  if (brandRows.length <= 1) {
    // Chỉ 1 brand → fetch bình thường
    return prisma.products.findMany({
      where,
      select: selectProductCard,
      orderBy: [{ totalSoldCount: "desc" }, { ratingAverage: "desc" }],
      skip,
      take: limit,
    });
  }

  // Nhiều brands → lấy đều per brand
  const perBrand = Math.ceil(limit / brandRows.length);
  const allResults = await Promise.all(
    brandRows.map(({ brandId }) =>
      prisma.products.findMany({
        where: { ...(where as any), brandId },
        select: selectProductCard,
        orderBy: [{ isFeatured: "desc" }, { totalSoldCount: "desc" }],
        take: perBrand,
      }),
    ),
  );

  // Interleave: lấy lần lượt 1 sp từ mỗi brand
  const result: any[] = [];
  const queues = allResults.filter((q) => q.length > 0);
  let i = 0;
  while (result.length < limit) {
    const active = queues.filter((q) => q.length > 0);
    if (active.length === 0) break;
    const queue = queues[i % queues.length];
    if (queue.length > 0) result.push(queue.shift()!);
    i++;
  }

  return result;
};

export const findAllPublic = async (query: ListProductsQuery) => findAll(query, true);

/**
 * Admin product list — hỗ trợ search, filter, includeDeleted, dateFrom/dateTo
 */
export const findAllAdmin = async (query: Record<string, any>) => {
  // console.log(query);

  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = query;
  const skip = (page - 1) * limit;

  const where = buildAdminProductWhere(query);
  const orderBy = buildOrderBy(sortBy, sortOrder);

  // Base where không filter theo tab — dùng để đếm statusCounts
  const baseWhere = buildAdminProductWhere({
    ...query,
    isActive: undefined,
    isFeatured: undefined,
    inStock: undefined,
  });

  const [data, total, countAll, countActive, countInactive, countFeatured, countOutOfStock] = await Promise.all([
    prisma.products.findMany({ where, select: selectProductCardAdmin, orderBy, skip, take: limit }),
    prisma.products.count({ where }),
    prisma.products.count({ where: baseWhere }),
    prisma.products.count({ where: { ...baseWhere, isActive: true } }),
    prisma.products.count({ where: { ...baseWhere, isActive: false } }),
    prisma.products.count({ where: { ...baseWhere, isFeatured: true } }),
    // outOfStock — đếm qua variants
    prisma.products.count({
      where: {
        ...baseWhere,
        AND: [
          {
            variants: {
              some: {}, // phải có ít nhất 1 variant
            },
          },
          {
            variants: {
              every: {
                quantity: {
                  lte: 0,
                },
              },
            },
          },
        ],
      },
    }),
  ]);

  const statusCounts = {
    ALL: countAll,
    active: countActive,
    inactive: countInactive,
    featured: countFeatured,
    outOfStock: countOutOfStock,
  };

  return { data, page, limit, total, totalPages: Math.ceil(total / limit), statusCounts };
};
/**
 * Admin trash — chỉ lấy sản phẩm đã bị soft-delete
 */
export const findAllDeleted = async (query: Record<string, any> = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.productsWhereInput = {
    deletedAt: { not: null },
    ...(query.search && {
      OR: [{ name: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.products.findMany({
      where,
      select: selectProductCardAdmin,
      orderBy: { deletedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.products.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// ─────────────────────────────────────────────────────────────────────────────
// FIND BY ID / SLUG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * findById — admin: bao gồm cả deletedAt (để hiện warning nếu đã xóa)
 */
export const findById = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  return prisma.products.findUnique({
    where: {
      id,
      ...(options.includeDeleted ? {} : { deletedAt: null }),
    },
    include: {
      brand: true,
      category: {
        include: {
          categorySpecifications: {
            include: { specification: true },
          },
        },
      },
      img: { orderBy: [{ color: "asc" }, { position: "asc" }] },
      variants: {
        include: {
          variantAttributes: {
            include: {
              attributeOption: {
                include: {
                  attribute: true,
                },
              },
            },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
      productSpecifications: {
        include: { specification: true },
      },
    },
  });
};

export const findBySlug = async (slug: string) => {
  return prisma.products.findUnique({
    where: { slug, deletedAt: null },
    include: {
      brand: true,
      category: { select: selectCategoryTree },
      img: { orderBy: [{ color: "asc" }, { position: "asc" }] },
      variants: {
        include: {
          variantAttributes: {
            include: {
              attributeOption: { include: { attribute: true } },
            },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
      productSpecifications: {
        include: { specification: true },
      },
    },
  });
};

export const findSpecificationsBySlug = async (slug: string) => {
  const product = await prisma.products.findUnique({
    where: { slug, deletedAt: null },
    select: {
      isActive: true,
      categoryId: true,
      productSpecifications: {
        select: { specificationId: true, value: true },
      },
    },
  });

  if (!product) return null;

  const categoryIds = await getCategoryHierarchy(product.categoryId);

  const categorySpecifications = await prisma.category_specifications.findMany({
    where: { categoryId: { in: categoryIds } },
    orderBy: [{ sortOrder: "asc" }],
    include: {
      specification: true,
      category: { select: { id: true } },
    },
  });

  return { ...product, categorySpecifications };
};

// ─────────────────────────────────────────────────────────────────────────────
// SLUG CHECK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kiểm tra slug đã tồn tại chưa (dùng khi create/update).
 * excludeId: bỏ qua chính nó khi update.
 */
export const checkSlugExists = async (slug: string, excludeId?: string): Promise<boolean> => {
  const product = await prisma.products.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true },
  });
  return !!product;
};

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft delete product.
 * Set deletedAt + deletedBy. Không xóa variants/images.
 */
export const softDelete = async (id: string, deletedBy: string) => {
  return prisma.products.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy,
      isActive: false, // Ẩn khỏi public listing luôn
    },
    select: { id: true, name: true, deletedAt: true },
  });
};

/**
 * Restore product từ trash.
 * Xóa deletedAt/deletedBy, nhưng KHÔNG tự set isActive = true
 * (admin tự quyết định publish lại).
 */
export const restore = async (id: string) => {
  return prisma.products.update({
    where: { id, deletedAt: { not: null } },
    data: {
      deletedAt: null,
      deletedBy: null,
      // isActive giữ nguyên false — admin phải chủ động bật lại
    },
    select: { id: true, name: true, isActive: true },
  });
};

/**
 * Hard delete — chỉ cho phép khi đã soft-delete trước.
 * Cascade sẽ xóa: variants → variantAttributes, colorImages, productSpecifications.
 * Cần xóa cloudinary images trước khi gọi hàm này (từ controller).
 */
export const hardDelete = async (id: string) => {
  // Phải đã soft-delete trước
  const product = await prisma.products.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });

  if (!product) throw new Error("Sản phẩm không tồn tại");
  if (!product.deletedAt) throw new Error("Phải soft-delete trước khi xóa vĩnh viễn");

  return prisma.products.delete({ where: { id } });
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export const create = async (data: any) => {
  const { variants, specifications, colorImages, ...product } = data;

  return prisma.products.create({
    data: {
      ...product,
      img: colorImages
        ? {
            create: colorImages.map((img: any) => ({
              color: img.color,
              imagePath: img.imagePath,
              imageUrl: img.imageUrl,
              altText: img.altText,
              position: img.position || 0,
            })),
          }
        : undefined,
      productSpecifications: {
        create:
          specifications?.map((s: any, index: number) => ({
            specificationId: s.specificationId,
            value: s.value,
            isHighlight: s.isHighlight || false,
            sortOrder: index,
          })) ?? [],
      },
      variants: {
        create:
          variants?.map((v: any) => ({
            code: v.code,
            price: v.price,
            quantity: v.quantity ?? 10,
            isDefault: v.isDefault || false,
            isActive: v.isActive ?? true,
            variantAttributes: {
              create:
                v.variantAttributes?.map((attr: any) => ({
                  attributeOptionId: attr.attributeOptionId,
                })) || [],
            },
          })) ?? [],
      },
    },
    select: selectProductDetail,
  });
};

export const update = async (id: string, data: any) => {
  const { specifications, variants, colorImages, ...updateData } = data;

  // ── Color images — per-color, không xóa màu không được đề cập ────────────
  if (colorImages !== undefined && colorImages.length > 0) {
    for (const ci of colorImages) {
      const color: string = ci.color;

      // 1. Xóa các ảnh được đánh dấu xóa (deleteImageIds từ FE)
      const toDelete: string[] = ci.deleteImageIds ?? [];
      if (toDelete.length > 0) {
        await prisma.product_color_images.deleteMany({
          where: { id: { in: toDelete }, productId: id },
        });
      }

      // 2. Nếu có ảnh mới được upload (imagePath/imageUrl có trong ci) → append
      //    Controller đã uploadColorImages và truyền xuống dưới dạng:
      //    [{ color, imagePath, imageUrl, altText, position }]
      //    Chỉ tạo record mới nếu có imagePath (tức là có file được upload)
      if (ci.imagePath) {
        // Tính position tiếp theo cho màu này
        const maxPos = await prisma.product_color_images.aggregate({
          where: { productId: id, color },
          _max: { position: true },
        });
        const nextPosition = (maxPos._max.position ?? -1) + 1;

        await prisma.product_color_images.create({
          data: {
            productId: id,
            color,
            imagePath: ci.imagePath,
            imageUrl: ci.imageUrl ?? null,
            altText: ci.altText ?? color,
            position: ci.position ?? nextPosition,
          },
        });
      }
    }
  }

  // ── Specifications ────────────────────────────────────────────────────────
  if (specifications !== undefined) {
    await prisma.product_specifications.deleteMany({ where: { productId: id } });
    if (specifications.length > 0) {
      await prisma.product_specifications.createMany({
        data: specifications.map((s: any, index: number) => ({
          productId: id,
          specificationId: s.specificationId,
          value: s.value,
          isHighlight: s.isHighlight || false,
          sortOrder: index,
        })),
      });
    }
  }

  // ── Variants ──────────────────────────────────────────────────────────────
  if (variants !== undefined) {
    const existingVariants = await prisma.products_variants.findMany({
      where: { productId: id, deletedAt: null },
      select: { id: true },
    });

    const existingIds = existingVariants.map((v) => v.id);
    const updateIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
    const toDeleteIds = existingIds.filter((vid) => !updateIds.includes(vid));

    if (toDeleteIds.length > 0) {
      await prisma.variants_attributes.deleteMany({ where: { productVariantId: { in: toDeleteIds } } });
      await prisma.products_variants.deleteMany({ where: { id: { in: toDeleteIds } } });
    }

    for (const variant of variants) {
      if (variant._delete) continue;

      if (variant.id) {
        await prisma.products_variants.update({
          where: { id: variant.id },
          data: {
            code: variant.code,
            price: variant.price,
            quantity: variant.quantity,
            isDefault: variant.isDefault,
            isActive: variant.isActive,
            ...(variant.variantAttributes && {
              variantAttributes: {
                deleteMany: {},
                create: variant.variantAttributes.map((attr: any) => ({ attributeOptionId: attr.attributeOptionId })),
              },
            }),
          },
        });
      } else {
        await prisma.products_variants.create({
          data: {
            productId: id,
            code: variant.code,
            price: variant.price,
            quantity: variant.quantity ?? 10,
            isDefault: variant.isDefault || false,
            isActive: variant.isActive ?? true,
            variantAttributes: {
              create: variant.variantAttributes?.map((attr: any) => ({ attributeOptionId: attr.attributeOptionId })) || [],
            },
          },
        });
      }
    }
  }

  return prisma.products.update({
    where: { id, deletedAt: null },
    data: updateData,
    select: selectProductDetail,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK
// ─────────────────────────────────────────────────────────────────────────────

export const bulkUpdate = async (productIds: string[], updates: any) => {
  return prisma.products.updateMany({
    where: { id: { in: productIds }, deletedAt: null },
    data: updates,
  });
};

/**
 * Bulk soft-delete nhiều sản phẩm cùng lúc
 */
export const bulkSoftDelete = async (productIds: string[], deletedBy: string) => {
  return prisma.products.updateMany({
    where: { id: { in: productIds }, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy,
      isActive: false,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT SOFT-DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const softDeleteVariant = async (variantId: string, deletedBy: string) => {
  return prisma.products_variants.update({
    where: { id: variantId, deletedAt: null },
    data: {
      deletedAt: new Date(),
      deletedBy,
      isActive: false,
    },
    select: { id: true, code: true, deletedAt: true },
  });
};

export const restoreVariant = async (variantId: string) => {
  return prisma.products_variants.update({
    where: { id: variantId, deletedAt: { not: null } },
    data: { deletedAt: null, deletedBy: null },
    select: { id: true, code: true, isActive: true },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR IMAGES
// ─────────────────────────────────────────────────────────────────────────────

export const findColorImagesByProductId = async (productId: string) => {
  return prisma.product_color_images.findMany({
    where: { productId },
    orderBy: [{ color: "asc" }, { position: "asc" }],
  });
};

export const getColorImagesByProductId = async (productId: string) => {
  return prisma.product_color_images.findMany({
    where: { productId },
    select: { id: true, imageUrl: true, imagePath: true },
  });
};

export const getColorImagesByIds = async (ids: string[]) => {
  if (!ids.length) return [];
  return prisma.product_color_images.findMany({
    where: { id: { in: ids } },
    select: { id: true, imageUrl: true, imagePath: true, color: true },
  });
};

export const deleteColorImages = async (imageIds: string[]) => {
  return prisma.product_color_images.deleteMany({
    where: { id: { in: imageIds } },
  });
};

export const createColorImages = async (productId: string, images: any[]) => {
  return prisma.product_color_images.createMany({
    data: images.map((img) => ({
      productId,
      color: img.color,
      imagePath: img.imagePath,
      imageUrl: img.imageUrl,
      altText: img.altText,
      position: img.position || 0,
    })),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export const findVariantByCode = async (productId: string, code: string) => {
  return prisma.products_variants.findFirst({
    where: { productId, code, isActive: true, deletedAt: null },
    select: selectVariant,
  });
};

export const findVariantByOptions = async (productId: string, options: Record<string, string>) => {
  const variants = await prisma.products_variants.findMany({
    where: { productId, isActive: true, deletedAt: null },
    select: selectVariant,
  });

  const matchedVariant = variants.find((variant) => {
    const variantOptions = extractVariantOptions(variant);
    return Object.entries(options).every(([key, value]) => variantOptions[key] === value);
  });

  return matchedVariant || null;
};

export const findAllActiveVariants = async (productId: string) => {
  return prisma.products_variants.findMany({
    where: { productId, isActive: true, deletedAt: null },
    select: selectVariant,
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchSuggestionItem {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number | null;
  category: { id: string; name: string; slug: string } | null;
}

export const findSearchSuggestions = async (keyword: string, options: { limit?: number; categorySlug?: string } = {}): Promise<SearchSuggestionItem[]> => {
  const { limit = 8, categorySlug } = options;

  let categoryIds: string[] | undefined;
  if (categorySlug) {
    const ids = await getDescendantCategoryIds(categorySlug);
    if (ids) categoryIds = ids;
  }

  const products = await prisma.products.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [{ name: { contains: keyword.trim(), mode: "insensitive" } }, { slug: { contains: keyword.trim(), mode: "insensitive" } }],
      ...(categoryIds && { categoryId: { in: categoryIds } }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      img: {
        select: { imageUrl: true },
        orderBy: [{ color: "asc" }, { position: "asc" }],
        take: 1,
      },
      variants: {
        where: { isActive: true, isDefault: true, deletedAt: null },
        select: { price: true },
        take: 1,
      },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ totalSoldCount: "desc" }, { viewsCount: "desc" }],
    take: limit,
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnail: p.img[0]?.imageUrl ?? null,
    price: p.variants[0] ? Number(p.variants[0].price) : null,
    category: p.category,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const findOrderItemForReview = (userId: string, productId: string) => {
  return prisma.order_items.findFirst({
    where: {
      order: { userId, orderStatus: OrderStatus.DELIVERED },
      productVariant: { productId },
    },
    select: {
      id: true,
      review: { select: { id: true } },
    },
  });
};

export const findProductReviews = async (productId: string, query: ReviewsQuery) => {
  const { page, limit, rating, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.reviewsWhereInput = {
    orderItem: { productVariant: { productId } },
    isApproved: "APPROVED",
    ...(rating && { rating }),
  };

  const [data, total] = await Promise.all([
    prisma.reviews.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: { id: true, fullName: true, avatarImage: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.reviews.count({ where }),
  ]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const getReviewStats = async (productId: string) => {
  const reviews = await prisma.reviews.findMany({
    where: {
      orderItem: { productVariant: { productId } },
      isApproved: "APPROVED",
    },
    select: { rating: true },
  });

  const total = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  });

  return { total, distribution };
};

// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT SPECS
// ─────────────────────────────────────────────────────────────────────────────

export const findHighlightSpecificationGroups = async (productId: string, categoryId: string): Promise<{ groups: HighlightSpecificationGroup[]; productSpecs: Map<string, string> }> => {
  const categoryIds = await getCategoryHierarchy(categoryId);

  const productSpecs = await prisma.product_specifications.findMany({
    where: { productId },
    select: { specificationId: true, value: true, isHighlight: true },
  });

  const specValueMap = new Map(productSpecs.map((ps) => [ps.specificationId, ps.value]));
  const highlightSpecIds = new Set(productSpecs.filter((ps) => ps.isHighlight).map((ps) => ps.specificationId));

  if (highlightSpecIds.size === 0) return { groups: [], productSpecs: specValueMap };

  const allCategorySpecs = await prisma.category_specifications.findMany({
    where: { categoryId: { in: categoryIds } },
    orderBy: { sortOrder: "asc" },
    include: {
      specification: {
        select: { id: true, key: true, name: true, icon: true, unit: true },
      },
    },
  });

  const groupsMap = new Map<string, { groupName: string; sortOrder: number; hasHighlight: boolean; items: any[] }>();

  for (const cs of allCategorySpecs) {
    if (!groupsMap.has(cs.groupName)) {
      groupsMap.set(cs.groupName, { groupName: cs.groupName, sortOrder: cs.sortOrder, hasHighlight: false, items: [] });
    }

    const group = groupsMap.get(cs.groupName)!;
    const isHighlight = highlightSpecIds.has(cs.specification.id);
    if (isHighlight) group.hasHighlight = true;

    const value = specValueMap.get(cs.specification.id);
    if (value) {
      group.items.push({
        id: cs.specification.id,
        key: cs.specification.key,
        name: cs.specification.name,
        icon: cs.specification.icon ?? undefined,
        unit: cs.specification.unit ?? undefined,
        value,
        isHighlight,
      });
    }
  }

  const groups = Array.from(groupsMap.values())
    .filter((g) => g.hasHighlight && g.items.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3);

  return {
    groups: groups.map((g) => ({ groupName: g.groupName, items: g.items })),
    productSpecs: specValueMap,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME / PROMOTION QUERIES (untouched — public only)
// ─────────────────────────────────────────────────────────────────────────────

export const findRelatedProducts = async (productId: string, limit: number = 8) => {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: {
      brandId: true,
      categoryId: true,
      createdAt: true,
      variants: {
        where: { isDefault: true, isActive: true },
        select: { price: true },
        take: 1,
      },
      category: {
        select: {
          id: true,
          parentId: true,
          parent: {
            select: { id: true, parentId: true },
          },
        },
      },
    },
  });

  if (!product) return [];

  const productCreatedAt = product.createdAt;
  const parentId = product.category.parentId;
  const grandParentId = product.category.parent?.parentId;

  // CTE: lấy toàn bộ descendants của parent (cùng dòng sản phẩm)
  const siblingScope = await prisma.$queryRaw<{ id: string }[]>`
    WITH RECURSIVE descendants AS (
      SELECT id FROM categories
      WHERE id = ${parentId ?? product.categoryId}::uuid AND "deletedAt" IS NULL
      UNION ALL
      SELECT c.id FROM categories c
      JOIN descendants d ON c."parentId" = d.id
      WHERE c."deletedAt" IS NULL
    )
    SELECT id FROM descendants
  `;
  const siblingCategoryIds = siblingScope.map((r) => r.id);

  // Lấy cùng series — sort theo createdAt gần nhất (= thế hệ gần nhất)
  const sameCategory = await prisma.$queryRaw<{ id: string; time_diff: number }[]>`
  SELECT p.id,
         ABS(EXTRACT(EPOCH FROM (p."createdAt" - ${productCreatedAt}::timestamptz))) as time_diff
  FROM products p
  WHERE p.id != ${productId}::uuid
    AND p."isActive" = true
    AND p."deletedAt" IS NULL
    AND p."categoryId" = ANY(${siblingCategoryIds}::uuid[])
  ORDER BY time_diff ASC
  LIMIT ${limit}
`;

  if (sameCategory.length >= limit) {
    // Fetch đầy đủ data, giữ thứ tự time_diff
    const ids = sameCategory.map((p) => p.id);
    const fullData = await prisma.products.findMany({
      where: { id: { in: ids } },
      select: selectProductCard,
    });
    const idOrder = new Map(ids.map((id, i) => [id, i]));
    return fullData.sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
  }

  // Chưa đủ → mở rộng lên grandparent
  const remaining = limit - sameCategory.length;
  const existingIds = new Set([productId, ...sameCategory.map((p) => p.id)]);

  let expandedCategoryIds: string[] = [];
  if (grandParentId || parentId) {
    const expandedScope = await prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE descendants AS (
        SELECT id FROM categories
        WHERE id = ${grandParentId ?? parentId}::uuid AND "deletedAt" IS NULL
        UNION ALL
        SELECT c.id FROM categories c
        JOIN descendants d ON c."parentId" = d.id
        WHERE c."deletedAt" IS NULL
      )
      SELECT id FROM descendants
    `;
    expandedCategoryIds = expandedScope.map((r) => r.id).filter((id) => !siblingCategoryIds.includes(id));
  }

  let expandedRaw: { id: string }[] = [];

  if (expandedCategoryIds.length > 0) {
    expandedRaw = await prisma.$queryRaw<{ id: string }[]>`
  SELECT p.id,
         ABS(EXTRACT(EPOCH FROM (p."createdAt" - ${productCreatedAt}::timestamptz))) as time_diff
  FROM products p
  WHERE p.id != ALL(${Array.from(existingIds)}::uuid[])
    AND p."isActive" = true
    AND p."deletedAt" IS NULL
    AND (
      p."categoryId" = ANY(${expandedCategoryIds}::uuid[])
      OR p."brandId" = ${product.brandId}::uuid
    )
  ORDER BY time_diff ASC
  LIMIT ${remaining}
`;
  } else {
    expandedRaw = await prisma.$queryRaw<{ id: string }[]>`
  SELECT p.id,
         ABS(EXTRACT(EPOCH FROM (p."createdAt" - ${productCreatedAt}::timestamptz))) as time_diff
  FROM products p
  WHERE p.id != ALL(${Array.from(existingIds)}::uuid[])
    AND p."isActive" = true
    AND p."deletedAt" IS NULL
    AND p."brandId" = ${product.brandId}::uuid
  ORDER BY time_diff ASC
  LIMIT ${remaining}
`;
  }

  const allIds = [...sameCategory.map((p) => p.id), ...expandedRaw.map((p) => p.id)];

  if (allIds.length === 0) return [];

  const fullData = await prisma.products.findMany({
    where: { id: { in: allIds } },
    select: selectProductCard,
  });

  // Giữ thứ tự theo time_diff
  const idOrder = new Map(allIds.map((id, i) => [id, i]));
  return fullData.sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
};

export const getProductIdsFromPromotions = async (date: Date): Promise<{ productIds: Set<string>; promotions: any[] }> => {
  const productIds = new Set<string>();

  const activePromotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: date } }] }, { OR: [{ endDate: null }, { endDate: { gte: date } }] }],
    },
    include: { targets: true }, // targets đã include targetCode, targetValue
  });

  for (const promotion of activePromotions) {
    for (const target of promotion.targets) {
      if (target.targetType === "PRODUCT" && target.targetId) {
        productIds.add(target.targetId);
      } else if (target.targetType === "CATEGORY" && target.targetId) {
        const categoryIds = await getAllDescendantCategoryIds(target.targetId);
        const products = await prisma.products.findMany({
          where: { categoryId: { in: categoryIds }, isActive: true, deletedAt: null },
          select: { id: true },
        });
        products.forEach((p) => productIds.add(p.id));
      } else if (target.targetType === "BRAND" && target.targetId) {
        const products = await prisma.products.findMany({
          where: { brandId: target.targetId, isActive: true, deletedAt: null },
          select: { id: true },
        });
        products.forEach((p) => productIds.add(p.id));
      } else if (target.targetType === "ALL") {
        const products = await prisma.products.findMany({
          where: { isActive: true, deletedAt: null },
          select: { id: true },
        });
        products.forEach((p) => productIds.add(p.id));
      } else if (target.targetType === "ATTRIBUTE" && target.targetCode && target.targetValue) {
        // ← NEW
        const matchingVariants = await prisma.products_variants.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            variantAttributes: {
              some: {
                attributeOption: {
                  value: { equals: target.targetValue, mode: "insensitive" },
                  attribute: { code: { equals: target.targetCode, mode: "insensitive" } },
                },
              },
            },
          },
          select: { productId: true },
        });
        matchingVariants.forEach((v) => productIds.add(v.productId));
      }
    }
  }

  return { productIds, promotions: activePromotions };
};

export const findProductsOnSaleByDate = async (date: Date, options: { limit?: number; categoryId?: string } = {}) => {
  const { limit = 15, categoryId } = options;
  const { productIds, promotions } = await getProductIdsFromPromotions(date);

  if (productIds.size === 0) return { products: [], promotions: [] };

  const products = await prisma.products.findMany({
    where: {
      id: { in: Array.from(productIds) },
      isActive: true,
      deletedAt: null,
      ...(categoryId && { categoryId }),
    },
    select: selectProductCard,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return { products, promotions };
};

export const getProductsForCategoryRanking = async (_date: Date) => {
  return prisma.products.findMany({
    where: { isActive: true, deletedAt: null },
    select: {
      id: true,
      createdAt: true,
      viewsCount: true,
      category: {
        select: { id: true, parent: { select: { id: true } } },
      },
      variants: {
        where: { isActive: true, deletedAt: null },
        select: { soldCount: true },
      },
    },
  });
};

export const getSaleProductsCountByCategories = async (date: Date) => {
  const { productIds } = await getProductIdsFromPromotions(date);
  if (productIds.size === 0) return new Map<string, number>();

  const products = await prisma.products.findMany({
    where: { id: { in: Array.from(productIds) } },
    select: {
      category: {
        select: { id: true, parent: { select: { id: true } } },
      },
    },
  });

  const map = new Map<string, number>();
  for (const product of products) {
    const displayCategoryId = product.category.parent?.id ?? product.category.id;
    map.set(displayCategoryId, (map.get(displayCategoryId) || 0) + 1);
  }
  return map;
};

export const findFeaturedProducts = async (limit: number = 12) => {
  return prisma.products.findMany({
    where: { isActive: true, deletedAt: null },
    select: selectProductCard,
    orderBy: { viewsCount: "desc" },
    take: limit,
  });
};

export const findBestSellingProducts = async (limit: number = 12) => {
  return prisma.products.findMany({
    where: { isActive: true, deletedAt: null, variants: { some: { isActive: true } } },
    orderBy: { totalSoldCount: "desc" },
    take: limit,
    select: { ...selectProductCard, totalSoldCount: true },
  });
};

export const findProductsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const products = await prisma.products.findMany({
    where: { id: { in: ids }, isActive: true, deletedAt: null },
    select: selectProductCard,
  });
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter((p): p is (typeof products)[number] => p !== undefined);
};

export const findNewArrivalProducts = async (daysAgo: number = 30, limit: number = 12) => {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

  return prisma.products.findMany({
    where: { isActive: true, deletedAt: null, createdAt: { gte: dateThreshold } },
    select: selectProductCard,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const findUpcomingPromotions = async (currentDate: Date, limit: number = 5) => {
  return prisma.promotions.findMany({
    where: {
      isActive: true,
      startDate: { not: null, gt: currentDate },
    },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      priority: true,
      _count: { select: { targets: true } },
    },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }],
    take: limit,
  });
};

export const findProductsByPromotionId = async (promotionId: string, limit: number = 20) => {
  const promotion = await prisma.promotions.findUnique({
    where: { id: promotionId },
    include: { targets: true },
  });

  if (!promotion) return null;

  const productIds = new Set<string>();

  for (const target of promotion.targets) {
    if (target.targetType === "PRODUCT" && target.targetId) {
      productIds.add(target.targetId);
    } else if (target.targetType === "CATEGORY" && target.targetId) {
      const products = await prisma.products.findMany({
        where: { categoryId: target.targetId, isActive: true, deletedAt: null },
        select: { id: true },
      });
      products.forEach((p) => productIds.add(p.id));
    } else if (target.targetType === "BRAND" && target.targetId) {
      const products = await prisma.products.findMany({
        where: { brandId: target.targetId, isActive: true, deletedAt: null },
        select: { id: true },
      });
      products.forEach((p) => productIds.add(p.id));
    } else if (target.targetType === "ALL") {
      const products = await prisma.products.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true },
        take: limit,
      });
      products.forEach((p) => productIds.add(p.id));
    }
  }

  const products = await prisma.products.findMany({
    where: { id: { in: Array.from(productIds) }, isActive: true, deletedAt: null },
    select: selectProductCard,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    promotion: {
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      priority: promotion.priority,
    },
    products,
    total: products.length,
  };
};

export const findFeaturedProductsByCategories = async (options: { limit?: number; categoriesLimit?: number } = {}) => {
  const { limit = 5, categoriesLimit = 6 } = options;

  const rootFeaturedCategories = await prisma.categories.findMany({
    where: { isFeatured: true, isActive: true, parentId: null },
    select: { id: true, name: true, slug: true },
    orderBy: { position: "asc" },
    take: categoriesLimit,
  });

  const results = await Promise.all(
    rootFeaturedCategories.map(async (rootCategory) => {
      const level1Categories = await prisma.categories.findMany({
        where: { parentId: rootCategory.id, isActive: true },
        select: { id: true },
      });
      const level1Ids = level1Categories.map((c) => c.id);

      const level2Categories = await prisma.categories.findMany({
        where: { parentId: { in: level1Ids }, isActive: true },
        select: { id: true },
      });

      const allCategoryIds = [...level1Ids, ...level2Categories.map((c) => c.id)];

      const products = await prisma.products.findMany({
        where: { categoryId: { in: allCategoryIds }, isFeatured: true, isActive: true, deletedAt: null },
        select: selectProductCard,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return { category: rootCategory, products, total: products.length };
    }),
  );

  return results.filter((r) => r.products.length > 0);
};

export const findActivePromotions = async (date: Date) => {
  return prisma.promotions.findMany({
    where: {
      isActive: true,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: date } }] }, { OR: [{ endDate: null }, { endDate: { gte: date } }] }],
    },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      priority: true,
      _count: { select: { targets: true } },
    },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }],
  });
};

export const findCategoriesWithSaleProducts = async (date: Date) => {
  const { productIds } = await getProductIdsFromPromotions(date);
  if (productIds.size === 0) return [];

  const products = await prisma.products.findMany({
    where: { id: { in: Array.from(productIds) } },
    select: {
      category: {
        select: { id: true, parent: { select: { id: true } } },
      },
    },
  });

  const displayCategoryIds = Array.from(new Set(products.map((p) => p.category.parent?.id ?? p.category.id)));

  return prisma.categories.findMany({
    where: { id: { in: displayCategoryIds }, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: true } },
    },
    orderBy: { position: "asc" },
  });
};

/**
 * product.repository.additions.ts
 *
 * Các hàm repository bổ sung cho:
 *   1. Search suggestions (trending by viewsCount)
 *   2. Sale schedule — trả về products theo ngày cụ thể
 *   3. Product comparison — so sánh tối đa 4 sản phẩm cùng category
 *   4. Admin stats — tổng quan dashboard
 *
 * CÁCH DÙNG: Paste/import vào product.repository.ts hiện tại
 */

// ─────────────────────────────────────────────────────────────────────────────
// SELECT FRAGMENTS (copy từ product.repository.ts để dùng nội bộ)
// ─────────────────────────────────────────────────────────────────────────────

const selectVariantMinimal = {
  id: true,
  code: true,
  price: true,
  quantity: true,
  soldCount: true,
  isDefault: true,
  isActive: true,
  variantAttributes: { select: selectVariantAttribute },
};

const selectColorImageMinimal = {
  id: true,
  color: true,
  imageUrl: true,
  altText: true,
  position: true,
};

// Dùng cho card sản phẩm trong comparison & sale schedule
const selectProductCardBase = {
  id: true,
  name: true,
  slug: true,
  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  isActive: true,
  totalSoldCount: true,
  variantDisplay: true,
  createdAt: true,
  brand: { select: { id: true, name: true, slug: true } },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      parent: {
        select: {
          id: true,
          slug: true,
          parent: { select: { id: true, slug: true } },
        },
      },
    },
  },
  img: {
    select: selectColorImageMinimal,
    orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
    take: 1,
  },
  variants: {
    where: { isActive: true, deletedAt: null },
    select: selectVariantMinimal,
    orderBy: { isDefault: "desc" as const },
  },
  productSpecifications: {
    where: { isHighlight: true },
    orderBy: { sortOrder: "asc" as const },
    select: {
      specificationId: true,
      sortOrder: true,
      value: true,
      isHighlight: true,
      specification: {
        select: { id: true, key: true, group: true, name: true, icon: true, unit: true },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEARCH SUGGESTIONS — top trending by viewsCount
// ─────────────────────────────────────────────────────────────────────────────

/**
 * findTrendingSearchSuggestions
 *
 * Trả về danh sách tên sản phẩm phổ biến dùng cho input search dropdown.
 * Sắp xếp theo viewsCount DESC để ưu tiên sản phẩm được xem nhiều nhất.
 *
 * Khác với findSearchSuggestions (text-match), hàm này trả về top trending
 * khi q rỗng (user vừa focus vào ô tìm kiếm chưa gõ gì).
 * Khi q có nội dung → filter ILIKE + sort viewsCount.
 */
export const findTrendingSearchSuggestions = async (
  q: string,
  options: {
    limit?: number;
    categorySlug?: string;
  } = {},
): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    viewsCount: number;
    priceOrigin: number;
    isTrending: boolean;
  }>
> => {
  const limit = Math.min(options.limit ?? 8, 20);

  // Resolve categoryId từ slug nếu có
  let categoryIds: string[] | undefined;
  if (options.categorySlug) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE slug = ${options.categorySlug} AND "deletedAt" IS NULL
        UNION ALL
        SELECT c.id FROM categories c JOIN subcategories sc ON c."parentId" = sc.id
        WHERE c."deletedAt" IS NULL
      )
      SELECT id FROM subcategories
    `;
    categoryIds = rows.map((r) => r.id);
    if (categoryIds.length === 0) return [];
  }

  const products = await prisma.products.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      ...(q.trim() ? { name: { contains: q.trim(), mode: "insensitive" } } : {}),
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      viewsCount: true,
      img: {
        select: { imageUrl: true },
        orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
        take: 1,
      },
      variants: {
        where: { isActive: true, deletedAt: null, isDefault: true },
        select: { price: true },
        take: 1,
      },
    },
    orderBy: [{ viewsCount: "desc" }, { totalSoldCount: "desc" }],
    take: limit,
  });

  // Top 3 (hoặc top 30%) được đánh dấu trending
  const trendingCutoff = Math.max(1, Math.ceil(products.length * 0.3));

  return products.map((p, idx) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnail: p.img[0]?.imageUrl ?? null,
    viewsCount: Number(p.viewsCount),
    priceOrigin: p.variants[0] ? Number(p.variants[0].price) : 0,
    isTrending: idx < trendingCutoff,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. SALE SCHEDULE — products theo ngày (hoặc date range)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * findSaleScheduleDays
 *
 * Trả về lịch sale dạng:
 * [
 *   { date: "2026-03-19", promotions: [...], isToday: false },
 *   { date: "2026-03-20", promotions: [...], isToday: true },
 * ]
 * Chỉ lấy metadata promotion theo ngày, KHÔNG lấy products.
 * FE dùng để render calendar — khi click vào ngày mới gọi findProductsOnSaleDate.
 */
const toVNDateStr = (d: Date): string => d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
export const findSaleScheduleDays = async (
  startDate: Date,
  endDate: Date,
): Promise<
  Array<{
    date: string;
    promotions: Array<{
      id: string;
      name: string;
      description: string | null;
      startDate: Date | null;
      endDate: Date | null;
      priority: number;
      targetsCount: number;
      rules: Array<{
        actionType: string;
        discountValue: number | null;
      }>;
    }>;
    isToday: boolean;
    hasActiveSale: boolean;
  }>
> => {
  const promotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      startDate: { not: null },
      endDate: { not: null },
      targets: {
        some: { targetType: "PRODUCT" }, // ← chỉ lấy promotion có target PRODUCT
      },
      OR: [
        {
          AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      priority: true,
      _count: { select: { targets: true } },
      rules: {
        select: {
          actionType: true,
          discountValue: true,
        },
      },
    },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }],
  });

  const scheduleMap = new Map<string, typeof promotions>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Phân bổ promotions vào từng ngày trong range
  // for (const promo of promotions) {
  //   const promoStart = promo.startDate ? new Date(promo.startDate) : startDate;
  //   const promoEnd = promo.endDate ? new Date(promo.endDate) : endDate;

  //   let cur = new Date(Math.max(promoStart.getTime(), startDate.getTime()));
  //   cur.setHours(0, 0, 0, 0);
  //   const last = new Date(Math.min(promoEnd.getTime(), endDate.getTime()));
  //   last.setHours(0, 0, 0, 0);

  //   while (cur <= last) {
  //     const key = toVNDateStr(cur);
  //     if (!scheduleMap.has(key)) scheduleMap.set(key, []);
  //     const arr = scheduleMap.get(key)!;
  //     if (!arr.some((p) => p.id === promo.id)) arr.push(promo);
  //     cur = new Date(cur);
  //     cur.setDate(cur.getDate() + 1);
  //   }
  // }
  for (const promo of promotions) {
    const promoStart = dayjs(promo.startDate).tz("Asia/Ho_Chi_Minh");
    const promoEnd = dayjs(promo.endDate).tz("Asia/Ho_Chi_Minh");

    const rangeStart = dayjs(startDate).tz("Asia/Ho_Chi_Minh");
    const rangeEnd = dayjs(endDate).tz("Asia/Ho_Chi_Minh");

    let cur = promoStart.isAfter(rangeStart) ? promoStart.startOf("day") : rangeStart.startOf("day");

    const last = promoEnd.isBefore(rangeEnd) ? promoEnd.startOf("day") : rangeEnd.startOf("day");

    while (cur.isSameOrBefore(last, "day")) {
      const key = cur.format("YYYY-MM-DD");

      if (!scheduleMap.has(key)) scheduleMap.set(key, []);
      const arr = scheduleMap.get(key)!;

      if (!arr.some((p) => p.id === promo.id)) {
        arr.push(promo);
      }

      cur = cur.add(1, "day");
    }
  }

  const todayStr = toVNDateStr(new Date());

  return Array.from(scheduleMap.entries())
    .map(([date, promos]) => {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      return {
        date,
        isToday: date === todayStr,
        hasActiveSale: promos.length > 0,
        promotions: promos
          .sort((a, b) => b.priority - a.priority)
          .map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate,
            priority: p.priority,
            targetsCount: p._count.targets,
            rules: p.rules.map((r) => ({
              actionType: r.actionType,
              discountValue: r.discountValue ? Number(r.discountValue) : null,
            })),
          })),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * findProductsOnSaleDate
 *
 * Trả về products đang có promotion vào đúng ngày `date`.
 * FE gọi khi click vào 1 ngày trên calendar.
 *
 * Hỗ trợ filter theo promotionId (khi ngày có nhiều promotion,
 * FE có thể chọn xem sản phẩm của promotion cụ thể).
 */
export const findProductsOnSaleDate = async (
  date: Date,
  options: {
    promotionId?: string;
    limit?: number;
    page?: number;
    categoryId?: string;
    activeNow?: boolean;
  } = {},
): Promise<{
  date: string;
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
  products: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const limit = options.limit ?? 20;
  const page = options.page ?? 1;
  const skip = (page - 1) * limit;

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);
  const now = new Date();
  // Tìm promotions active vào ngày đó
  const promotionWhere: any = {
    isActive: true,
    deletedAt: null,
    startDate: { not: null },
    endDate: { not: null },
    targets: { some: { targetType: "PRODUCT" } },
    AND: [
      // Nếu activeNow=true → chỉ lấy promotion đã bắt đầu (startDate <= now)
      // Nếu không → lấy tất cả overlap với ngày đó
      { startDate: { lte: options.activeNow ? now : dateEnd } },
      { endDate: { gte: dateStart } },
    ],
  };
  if (options.promotionId) {
    promotionWhere.id = options.promotionId;
  }

  const activePromotions = await prisma.promotions.findMany({
    where: promotionWhere,
    select: {
      id: true,
      name: true,
      description: true,
      priority: true,
      targets: {
        select: {
          targetType: true,
          targetId: true,
          targetCode: true,
          targetValue: true,
        },
      },
    },
    orderBy: { priority: "desc" },
  });

  if (activePromotions.length === 0) {
    return {
      date: toVNDateStr(date),
      promotions: [],
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Thu thập product IDs, category IDs, brand IDs từ targets
  const directProductIds = new Set<string>();
  const categoryIds = new Set<string>();
  const brandIds = new Set<string>();
  let includeAll = false;

  for (const promo of activePromotions) {
    for (const target of promo.targets) {
      if (target.targetType === "ALL") {
        includeAll = true;
        break;
      }

      if (target.targetType === "PRODUCT" && target.targetId && isUUID(target.targetId)) {
        directProductIds.add(target.targetId);
      }

      if (target.targetType === "CATEGORY" && target.targetId && isUUID(target.targetId)) {
        categoryIds.add(target.targetId);
      }

      if (target.targetType === "BRAND" && target.targetId && isUUID(target.targetId)) {
        brandIds.add(target.targetId);
      }
      if (target.targetType === "ATTRIBUTE" && target.targetCode && target.targetValue) {
        // Query products có variant chứa attribute này
        const matchingVariants = await prisma.products_variants.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            variantAttributes: {
              some: {
                attributeOption: {
                  value: { equals: target.targetValue, mode: "insensitive" },
                  attribute: { code: { equals: target.targetCode, mode: "insensitive" } },
                },
              },
            },
          },
          select: { productId: true },
        });
        matchingVariants.forEach((v) => directProductIds.add(v.productId));
      }
    }
    if (includeAll) break;
  }

  // Build product where
  const productWhere: any = {
    isActive: true,
    deletedAt: null,
  };

  if (options.categoryId && isUUID(options.categoryId)) {
    productWhere.categoryId = options.categoryId;
  }
  if (!includeAll) {
    const orConditions: any[] = [];
    if (directProductIds.size > 0) orConditions.push({ id: { in: Array.from(directProductIds) } });
    if (categoryIds.size > 0) orConditions.push({ categoryId: { in: Array.from(categoryIds) } });
    if (brandIds.size > 0) orConditions.push({ brandId: { in: Array.from(brandIds) } });

    if (orConditions.length === 0) {
      return {
        date: date.toISOString().split("T")[0],
        promotions: activePromotions.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          priority: p.priority,
        })),
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    productWhere.OR = orConditions;
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: productWhere,
      select: selectProductCardBase,
      orderBy: [{ totalSoldCount: "desc" }, { viewsCount: "desc" }],
      skip,
      take: limit,
    }),
    prisma.products.count({ where: productWhere }),
  ]);

  return {
    date: date.toISOString().split("T")[0],
    promotions: activePromotions.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priority: p.priority,
    })),
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const findVariantById = async (variantId: string) => {
  return prisma.products_variants.findFirst({
    where: { id: variantId, isActive: true, deletedAt: null },
    select: selectVariant,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRODUCT COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * findProductsForComparison
 *
 * Lấy đầy đủ specifications của tối đa 4 sản phẩm để so sánh.
 * Yêu cầu tất cả sản phẩm phải cùng category — validate ở service layer.
 *
 * Response được normalize:
 * - specMatrix: danh sách spec group + key, mỗi row có values[] tương ứng từng sản phẩm
 *   (null nếu sản phẩm đó không có spec đó)
 * - products: thông tin cơ bản mỗi sản phẩm
 */
export const findProductsForComparison = async (ids: string[]) => {
  if (ids.length < 2 || ids.length > 4) {
    throw new Error("Chỉ so sánh được 2-4 sản phẩm");
  }

  const products = await prisma.products.findMany({
    where: {
      id: { in: ids },
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      ratingAverage: true,
      ratingCount: true,
      totalSoldCount: true,
      viewsCount: true,
      isFeatured: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          // Lấy spec definitions của category (để biết thứ tự và group)
          categorySpecifications: {
            orderBy: { sortOrder: "asc" as const },
            select: {
              groupName: true,
              sortOrder: true,
              specification: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  icon: true,
                  unit: true,
                  group: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
      brand: { select: { id: true, name: true, slug: true } },
      img: {
        select: selectColorImageMinimal,
        orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
        take: 1,
      },
      variants: {
        where: { isDefault: true, isActive: true, deletedAt: null },
        select: {
          id: true,
          price: true,
          quantity: true,
          soldCount: true,
          variantAttributes: { select: selectVariantAttribute },
        },
        take: 1,
      },
      productSpecifications: {
        select: {
          specificationId: true,
          value: true,
          isHighlight: true,
          sortOrder: true,
        },
      },
    },
  });

  return products;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADMIN STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getAdminProductStats
 *
 * Dashboard overview: tổng sản phẩm, active/inactive, hết hàng, đã xóa.
 * Dùng Promise.all để parallel queries.
 */
export const getAdminProductStats = async () => {
  const [total, active, inactive, outOfStock, deleted, featured] = await Promise.all([
    // Tổng (không tính đã xóa)
    prisma.products.count({ where: { deletedAt: null } }),

    // Đang hiển thị
    prisma.products.count({ where: { deletedAt: null, isActive: true } }),

    // Đang ẩn
    prisma.products.count({ where: { deletedAt: null, isActive: false } }),

    // Hết hàng (tất cả variants đều quantity <= 0)
    prisma.products.count({
      where: {
        deletedAt: null,
        isActive: true,
        variants: {
          every: { quantity: { lte: 0 }, deletedAt: null },
        },
      },
    }),

    // Đã xóa mềm
    prisma.products.count({ where: { deletedAt: { not: null } } }),

    // Nổi bật
    prisma.products.count({ where: { deletedAt: null, isActive: true, isFeatured: true } }),
  ]);

  return { total, active, inactive, outOfStock, deleted, featured };
};

/**
 * findActiveVariantsMatchingSelection
 *
 * Lọc variants theo selectedOptions (VD: { storage: "128gb" }).
 * Chỉ trả về variants có TẤT CẢ các attributes trong selectedOptions khớp.
 *
 * Nếu selectedOptions rỗng → trả về tất cả active variants (backward compat).
 */
export const findActiveVariantsMatchingSelection = async (productId: string, selectedOptions: Record<string, string>) => {
  const allVariants = await prisma.products_variants.findMany({
    where: { productId, isActive: true, deletedAt: null },
    select: selectVariant, // reuse select fragment có sẵn trong file
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const selectedEntries = Object.entries(selectedOptions).filter(([, v]) => v?.trim());

  // Không có selection → trả về tất cả (không break behavior cũ)
  if (selectedEntries.length === 0) return allVariants;

  return allVariants.filter((variant) => {
    // Build map: attributeCode → value (lowercase để so sánh case-insensitive)
    const attrMap = new Map(variant.variantAttributes.map((va) => [va.attributeOption.attribute.code, va.attributeOption.value.toLowerCase().trim()]));

    // Variant phải khớp TẤT CẢ selected attributes
    return selectedEntries.every(([code, value]) => attrMap.get(code) === value.toLowerCase().trim());
  });
};
