import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListProductsQuery, ReviewsQuery } from "./product.validation";

// =====================
// === SELECT FRAGMENTS ===
// =====================

const selectBrand = {
  id: true,
  name: true,
  slug: true,
};

const selectCategory = {
  id: true,
  name: true,
  slug: true,
};

const selectVariantImage = {
  id: true,
  imageUrl: true,
  altText: true,
  position: true,
};

const selectInventory = {
  quantity: true,
  reservedQuantity: true,
};

const selectVariantAttribute = {
  id: true,
  attributeOption: {
    select: {
      id: true,
      value: true,
      attribute: {
        select: {
          id: true,
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
  weight: true,
  soldCount: true,
  isDefault: true,
  isActive: true,
  inventory: { select: selectInventory },
  images: {
    select: selectVariantImage,
    orderBy: { position: "asc" as const },
  },
  variantAttributes: {
    select: selectVariantAttribute,
  },
};

const selectProductCard = {
  id: true,
  name: true,
  slug: true,
  brand: { select: selectBrand },
  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  createdAt: true,
  variants: {
    where: { isActive: true },
    select: selectVariant,
    take: 1, // Chỉ lấy variant mặc định cho card
    orderBy: { isDefault: "desc" as const },
  },
  productHighlights: {
    orderBy: { sortOrder: "asc" as const },
    take: 3, // Chỉ lấy 3 highlights nổi bật nhất
    select: {
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
};

const selectProductDetail = {
  id: true,
  name: true,
  slug: true,
  description: true,

  brand: { select: selectBrand },
  category: { select: selectCategory },

  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,

  variants: {
    select: selectVariant,
    orderBy: { isDefault: "desc" as const },
  },

  productHighlights: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      specificationId: true,
      sortOrder: true,
    },
  },

  productSpecifications: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      specificationId: true,
      sortOrder: true,
      value: true,
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
        orderBy: {
          sortOrder: "asc" as const,
        },
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

// =====================
// === WHERE BUILDERS ===
// =====================

const buildProductWhere = (
  query: ListProductsQuery,
  onlyActive: boolean
): Prisma.productsWhereInput => {
  const where: Prisma.productsWhereInput = {};

  if (onlyActive) where.isActive = true;

  // Search
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Category filters
  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  // Brand filter
  if (query.brandId) where.brandId = query.brandId;

  // Featured filter
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

  // Price range (qua variants)
  if (query.minPrice || query.maxPrice) {
    where.variants = {
      some: {
        isActive: true,
        ...(query.minPrice && { price: { gte: query.minPrice } }),
        ...(query.maxPrice && { price: { lte: query.maxPrice } }),
      },
    };
  }

  // Rating filter
  if (query.minRating) {
    where.ratingAverage = { gte: query.minRating };
  }

  // In stock filter
  if (query.inStock) {
    where.variants = {
      some: {
        isActive: true,
        inventory: {
          quantity: { gt: 0 },
        },
      },
    };
  }

  return where;
};

// =====================
// === FIND OPERATIONS ===
// =====================

export const findAllPublic = async (query: ListProductsQuery) => {
  return findAll(query, true);
};

export const findAllAdmin = async (query: ListProductsQuery) => {
  return findAll(query, false);
};

const findAll = async (query: ListProductsQuery, onlyActive: boolean) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = buildProductWhere(query, onlyActive);

  // Xử lý sort theo price (cần join với variants)
  let orderBy: any = { [sortBy]: sortOrder };

  if (sortBy === "price") {
    // Sort theo giá của variant mặc định
    orderBy = {
      variants: {
        _count: sortOrder,
      },
    };
  }

  const [data, total] = await Promise.all([
    prisma.products.findMany({
      where,
      select: selectProductCard,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.products.count({ where }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const findById = (id: string) =>
  prisma.products.findUnique({
    where: { id },
    select: selectProductDetail,
  });

export const findBySlug = (slug: string) =>
  prisma.products.findUnique({
    where: { slug },
    select: selectProductDetail,
  });

export const findSpecificationsBySlug = (slug: string) =>
  prisma.products.findUnique({
    where: { slug },
    select: selectProductSpecifications,
  });

// =====================
// === RELATED PRODUCTS ===
// =====================

export const findRelatedProducts = async (productId: string, limit: number = 8) => {
  // Lấy thông tin sản phẩm hiện tại
  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: {
      brandId: true,
      categoryId: true,
    },
  });

  if (!product) return [];

  return prisma.products.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      OR: [{ brandId: product.brandId }, { categoryId: product.categoryId }],
    },
    select: selectProductCard,
    take: limit,
    orderBy: { viewsCount: "desc" },
  });
};

// =====================
// === REVIEWS ===
// =====================

export const findProductReviews = async (productId: string, query: ReviewsQuery) => {
  const { page, limit, rating, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.reviewsWhereInput = {
    orderItem: {
      productVariant: {
        productId,
      },
    },
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
          select: {
            id: true,
            fullName: true,
            avatarImage: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.reviews.count({ where }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getReviewStats = async (productId: string) => {
  const reviews = await prisma.reviews.findMany({
    where: {
      orderItem: {
        productVariant: {
          productId,
        },
      },
      isApproved: "APPROVED",
    },
    select: {
      rating: true,
    },
  });

  const total = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  });

  return {
    total,
    distribution,
  };
};

// =====================
// === CREATE & UPDATE ===
// =====================

export const create = async (data: any) => {
  const { categories, variants, highlights, specifications, ...product } = data;

  return prisma.products.create({
    data: {
      ...product,
      categories: {
        connect: categories?.map((id: string) => ({ id })) ?? [],
      },
      productHighlights: {
        create:
          highlights?.map((h: any, index: number) => ({
            specificationId: h.specificationId,
            sortOrder: index,
          })) ?? [],
      },
      productSpecifications: {
        create:
          specifications?.map((s: any, index: number) => ({
            specificationId: s.specificationId,
            value: s.value,
            sortOrder: index,
          })) ?? [],
      },
      variants: {
        create:
          variants?.map((v: any) => ({
            code: v.code,
            price: v.price,
            weight: v.weight,
            isDefault: v.isDefault || false,
            isActive: v.isActive ?? true,
            inventory: {
              create: { quantity: v.quantity ?? 0 },
            },
            images: {
              create:
                v.images?.map((img: any, idx: number) => ({
                  imageUrl: img.imageUrl,
                  altText: img.altText || product.name,
                  position: idx,
                })) || [],
            },
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
  const { categories, highlights, specifications, variants, ...updateData } = data;

  // Xử lý categories
  if (categories) {
    updateData.categories = {
      set: categories.map((id: string) => ({ id })),
    };
  }

  // Xử lý highlights
  if (highlights !== undefined) {
    await prisma.product_highlights.deleteMany({ where: { productId: id } });
    if (highlights.length > 0) {
      await prisma.product_highlights.createMany({
        data: highlights.map((h: any, index: number) => ({
          productId: id,
          specificationId: h.specificationId,
          sortOrder: index,
        })),
      });
    }
  }

  // Xử lý specifications
  if (specifications !== undefined) {
    await prisma.product_specifications.deleteMany({ where: { productId: id } });
    if (specifications.length > 0) {
      await prisma.product_specifications.createMany({
        data: specifications.map((s: any, index: number) => ({
          productId: id,
          specificationId: s.specificationId,
          value: s.value,
          sortOrder: index,
        })),
      });
    }
  }

  // Xử lý variants (nếu có)
  // Logic phức tạp hơn, để trong service layer

  return prisma.products.update({
    where: { id },
    data: updateData,
    select: selectProductDetail,
  });
};

export const remove = async (id: string) => {
  // Xóa cascade theo thứ tự
  const variants = await prisma.products_variants.findMany({
    where: { productId: id },
    select: { id: true },
  });

  for (const variant of variants) {
    await prisma.product_variant_images.deleteMany({
      where: { productVariantId: variant.id },
    });
    await prisma.variants_attributes.deleteMany({
      where: { productVariantId: variant.id },
    });
  }

  await prisma.inventory.deleteMany({
    where: { variant: { productId: id } },
  });

  await prisma.products_variants.deleteMany({ where: { productId: id } });
  await prisma.product_highlights.deleteMany({ where: { productId: id } });
  await prisma.product_specifications.deleteMany({ where: { productId: id } });

  return prisma.products.delete({ where: { id } });
};

// =====================
// === UTILITY ===
// =====================

export const getVariantImagesByProductId = async (productId: string) => {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    include: {
      variants: {
        include: {
          images: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!product) return [];

  return product.variants.flatMap((variant) =>
    variant.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
    }))
  );
};

export const bulkUpdate = async (productIds: string[], updates: any) => {
  return prisma.products.updateMany({
    where: { id: { in: productIds } },
    data: updates,
  });
};
