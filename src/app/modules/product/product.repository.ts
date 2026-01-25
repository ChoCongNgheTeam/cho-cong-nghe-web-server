import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListProductsQuery, ReviewsQuery } from "./product.validation";
import { OrderStatus } from "@prisma/client";

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
      type: true,
      value: true,
      label: true,
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

const selectProductCard = {
  id: true,
  name: true,
  slug: true,
  brand: { select: selectBrand },
  category: {
    select: selectCategoryTree,
  },
  img: {
    select: selectColorImage,
    orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
    take: 1,
  },
  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  variants: {
    where: { isActive: true },
    select: selectVariant,
    take: 1,
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

const selectProductDetail = {
  id: true,
  name: true,
  slug: true,
  description: true,
  brand: { select: selectBrand },
  category: {
    select: selectCategoryTree,
  },
  img: {
    select: selectColorImage,
    orderBy: [{ color: "asc" as const }, { position: "asc" as const }],
  },
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

const buildProductWhere = (
  query: ListProductsQuery,
  onlyActive: boolean,
): Prisma.productsWhereInput => {
  const where: Prisma.productsWhereInput = {};

  if (onlyActive) where.isActive = true;

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.brandId) where.brandId = query.brandId;

  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

  if (query.minPrice || query.maxPrice) {
    where.variants = {
      some: {
        isActive: true,
        ...(query.minPrice && { price: { gte: query.minPrice } }),
        ...(query.maxPrice && { price: { lte: query.maxPrice } }),
      },
    };
  }

  if (query.minRating) {
    where.ratingAverage = { gte: query.minRating };
  }

  if (query.inStock) {
    where.variants = {
      some: {
        isActive: true,
        quantity: { gt: 0 },
      },
    };
  }

  return where;
};

export const findAllPublic = async (query: ListProductsQuery) => {
  return findAll(query, true);
};

export const findAllAdmin = async (query: ListProductsQuery) => {
  return findAll(query, false);
};

export const findColorImagesByProductId = async (productId: string) => {
  return prisma.product_color_images.findMany({
    where: { productId },
    orderBy: [{ color: "asc" }, { position: "asc" }],
  });
};

export const getColorImagesByProductId = async (productId: string) => {
  return prisma.product_color_images.findMany({
    where: { productId },
    select: {
      id: true,
      imageUrl: true,
      imagePath: true,
    },
  });
};

export const deleteColorImages = async (imageIds: string[]) => {
  return prisma.product_color_images.deleteMany({
    where: {
      id: { in: imageIds },
    },
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

export const findOrderItemForReview = (userId: string, productId: string) => {
  return prisma.order_items.findFirst({
    where: {
      order: {
        userId,
        orderStatus: OrderStatus.DELIVERED,
      },
      productVariant: {
        productId,
      },
    },
    select: {
      id: true,
      review: {
        select: { id: true },
      },
    },
  });
};

const findAll = async (query: ListProductsQuery, onlyActive: boolean) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = buildProductWhere(query, onlyActive);

  let orderBy: any = { [sortBy]: sortOrder };

  if (sortBy === "price") {
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
  console.log(data);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const findVariantByCode = async (productId: string, code: string) => {
  return prisma.products_variants.findFirst({
    where: {
      productId,
      code,
      isActive: true,
    },
    select: selectVariant,
  });
};

export const findVariantByOptions = async (productId: string, options: Record<string, string>) => {
  const variants = await prisma.products_variants.findMany({
    where: {
      productId,
      isActive: true,
    },
    select: selectVariant,
  });

  const matchedVariant = variants.find((variant) => {
    const variantOptions: Record<string, string> = {};

    variant.variantAttributes.forEach((attr) => {
      const type = attr.attributeOption.type;
      const value = attr.attributeOption.value;
      variantOptions[type] = value;
    });

    return Object.entries(options).every(([key, value]) => variantOptions[key] === value);
  });

  return matchedVariant || null;
};

// UPDATE: findById - không include inventory
export const findById = async (id: string) => {
  return prisma.products.findUnique({
    where: { id },
    include: {
      brand: true,
      category: {
        include: {
          categorySpecifications: {
            include: {
              specification: true,
            },
          },
        },
      },
      img: {
        orderBy: [{ color: "asc" }, { position: "asc" }],
      },
      variants: {
        include: {
          variantAttributes: {
            include: {
              attributeOption: true,
            },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
      productSpecifications: {
        include: {
          specification: true,
        },
      },
    },
  });
};

// UPDATE: findBySlug - không include inventory
export const findBySlug = async (slug: string) => {
  return prisma.products.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: {
        include: {
          categorySpecifications: {
            include: {
              specification: true,
            },
          },
        },
      },
      img: {
        orderBy: [{ color: "asc" }, { position: "asc" }],
      },
      variants: {
        include: {
          variantAttributes: {
            include: {
              attributeOption: true,
            },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
      productSpecifications: {
        include: {
          specification: true,
        },
      },
    },
  });
};

export const findSpecificationsBySlug = (slug: string) =>
  prisma.products.findUnique({
    where: { slug },
    select: selectProductSpecifications,
  });

export const findRelatedProducts = async (productId: string, limit: number = 8) => {
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

// UPDATE: create - không tạo inventory, dùng quantity trực tiếp
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
            quantity: v.quantity ?? 10, // ✅ Direct field với default value
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

// UPDATE: update - không update inventory, dùng quantity trực tiếp
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
      where: { productId: id },
      select: { id: true },
    });

    const existingIds = existingVariants.map((v) => v.id);
    const updateIds = variants.filter((v: any) => v.id).map((v: any) => v.id);

    const toDelete = existingIds.filter((id) => !updateIds.includes(id));
    if (toDelete.length > 0) {
      await prisma.variants_attributes.deleteMany({
        where: { productVariantId: { in: toDelete } },
      });
      // REMOVED: Delete inventory
      await prisma.products_variants.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (const variant of variants) {
      if (variant._delete) {
        continue;
      }

      if (variant.id) {
        // UPDATE existing variant - quantity là direct field
        await prisma.products_variants.update({
          where: { id: variant.id },
          data: {
            code: variant.code,
            price: variant.price,
            quantity: variant.quantity, // ✅ Direct field
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
        // CREATE new variant
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
    where: { id },
    data: updateData,
    select: selectProductDetail,
  });
};

// UPDATE: remove - không xóa inventory
export const remove = async (id: string) => {
  const variants = await prisma.products_variants.findMany({
    where: { productId: id },
    select: { id: true },
  });

  for (const variant of variants) {
    await prisma.variants_attributes.deleteMany({
      where: { productVariantId: variant.id },
    });
  }

  // REMOVED: Delete inventory
  await prisma.products_variants.deleteMany({ where: { productId: id } });
  await prisma.product_color_images.deleteMany({ where: { productId: id } });
  await prisma.product_specifications.deleteMany({ where: { productId: id } });

  return prisma.products.delete({ where: { id } });
};

export const bulkUpdate = async (productIds: string[], updates: any) => {
  return prisma.products.updateMany({
    where: { id: { in: productIds } },
    data: updates,
  });
};

export const getProductVariantOptionsMap = async (productIds: string[]) => {
  const rows = await prisma.variants_attributes.findMany({
    where: {
      productVariant: {
        productId: { in: productIds },
        isActive: true,
      },
    },
    select: {
      productVariant: {
        select: { productId: true },
      },
      attributeOption: {
        select: {
          type: true,
          value: true,
          label: true,
        },
      },
    },
    distinct: ["attributeOptionId"],
  });

  const map = new Map<
    string,
    {
      type: string;
      options: { value: string; label: string }[];
    }[]
  >();

  for (const row of rows) {
    const productId = row.productVariant.productId;
    const list = map.get(productId) ?? [];

    let group = list.find((g) => g.type === row.attributeOption.type);

    if (!group) {
      group = {
        type: row.attributeOption.type,
        options: [],
      };
      list.push(group);
    }

    if (!group.options.some((o) => o.value === row.attributeOption.value)) {
      group.options.push({
        value: row.attributeOption.value,
        label: row.attributeOption.label,
      });
    }

    map.set(productId, list);
  }

  return map;
};
