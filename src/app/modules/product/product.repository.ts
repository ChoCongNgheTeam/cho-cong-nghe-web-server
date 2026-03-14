import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListProductsQuery, ReviewsQuery } from "./product.validation";
import { OrderStatus } from "@prisma/client";
import { extractVariantOptions } from "@/helpers/variant-options";
import { HighlightSpecificationGroup } from "./product.types";
import { buildOrderBy, buildProductWhere } from "./product_filter.where-builder";

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
        select: {
          id: true,
          code: true,
          name: true,
        },
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
const selectProductCard = {
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

  // Public filter: reuse existing where-builder (handles spec_xxx / attr_xxx)
  const where = await buildProductWhere(query, onlyActive);
  // Ensure deletedAt = null for public
  (where as any).deletedAt = null;

  const orderBy = buildOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([prisma.products.findMany({ where, select: selectProductCard, orderBy, skip, take: limit }), prisma.products.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllPublic = async (query: ListProductsQuery) => findAll(query, true);

/**
 * Admin product list — hỗ trợ search, filter, includeDeleted, dateFrom/dateTo
 */
export const findAllAdmin = async (query: Record<string, any>) => {
  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = query;
  const skip = (page - 1) * limit;

  const where = buildAdminProductWhere(query);
  const orderBy = buildOrderBy(sortBy, sortOrder);

  const [data, total] = await Promise.all([prisma.products.findMany({ where, select: selectProductCardAdmin, orderBy, skip, take: limit }), prisma.products.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
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

  if (colorImages !== undefined) {
    await prisma.product_color_images.deleteMany({ where: { productId: id } });
    if (colorImages.length > 0) {
      await createColorImages(id, colorImages);
    }
  }

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

  if (variants !== undefined) {
    const existingVariants = await prisma.products_variants.findMany({
      where: { productId: id, deletedAt: null },
      select: { id: true },
    });

    const existingIds = existingVariants.map((v) => v.id);
    const updateIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
    const toDelete = existingIds.filter((vid) => !updateIds.includes(vid));

    if (toDelete.length > 0) {
      await prisma.variants_attributes.deleteMany({
        where: { productVariantId: { in: toDelete } },
      });
      await prisma.products_variants.deleteMany({
        where: { id: { in: toDelete } },
      });
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
                create: variant.variantAttributes.map((attr: any) => ({
                  attributeOptionId: attr.attributeOptionId,
                })),
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
              create:
                variant.variantAttributes?.map((attr: any) => ({
                  attributeOptionId: attr.attributeOptionId,
                })) || [],
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
      name: { contains: keyword.trim(), mode: "insensitive" },
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
    select: { brandId: true, categoryId: true },
  });

  if (!product) return [];

  return prisma.products.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      deletedAt: null,
      OR: [{ brandId: product.brandId }, { categoryId: product.categoryId }],
    },
    select: selectProductCard,
    take: limit,
    orderBy: { viewsCount: "desc" },
  });
};

export const getProductIdsFromPromotions = async (date: Date): Promise<{ productIds: Set<string>; promotions: any[] }> => {
  const productIds = new Set<string>();

  const activePromotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: date } }] }, { OR: [{ endDate: null }, { endDate: { gte: date } }] }],
    },
    include: { targets: true },
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
