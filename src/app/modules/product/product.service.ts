import { slugify } from "transliteration";
import * as repo from "./product.repository";
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  ReviewsQuery,
} from "./product.validation";
import {
  transformProductCard,
  transformProductDetail,
  transformProductSpecifications,
  transformProductHighlights,
  transformProductVariantResponse,
} from "./product.transformers";
import { RawVariant, ReviewStats } from "./product.types";
import { buildCategoryPath } from "../category/category.helper";
import prisma from "prisma/client";

// =====================
// === PUBLIC SERVICES ===
// =====================

export const getProductsPublic = async (query: ListProductsQuery) => {
  const result = await repo.findAllPublic(query);
  // console.log(result);

  // const productIds = result.data.map((p) => p.id);
  // const variantOptionsMap = await repo.getProductVariantOptionsMap(productIds);
  // console.log(variantOptionsMap);

  return {
    ...result,
    data: result.data.map((product) => {
      const defaultVariant = product.variants?.[0];
      // const variantOptions = variantOptionsMap.get(product.id) ?? [];

      return {
        card: {
          ...transformProductCard(product),
          // variantOptions,
        },

        pricingContext: defaultVariant
          ? {
              productId: product.id,
              variantId: defaultVariant.id,
              price: Number(defaultVariant.price),
              brandId: product.brand?.id,
              categoryPath: buildCategoryPath(product.category),
            }
          : null,
      };
    }),
  };
};

export const getProductBySlug = async (slug: string, userId?: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const reviewStats = await repo.getReviewStats(product.id);

  // Tăng view count async
  repo
    .update(product.id, {
      viewsCount: BigInt(product.viewsCount) + BigInt(1),
    })
    .catch(console.error);

  const productDetail = transformProductDetail(product, {
    average: Number(product.ratingAverage) || 0,
    total: reviewStats.total,
    distribution: reviewStats.distribution as any,
  });

  // console.log(productDetail);

  const highlights = transformProductHighlights(product);

  // Check if user can review
  let canReview = false;
  let orderItemId: string | null = null;

  if (userId) {
    const orderItem = await repo.findOrderItemForReview(userId, product.id);
    canReview = !!orderItem && !orderItem.review;
    orderItemId = orderItem?.id ?? null;
  }

  return {
    ...productDetail,
    categoryPath: buildCategoryPath(product.category),
    highlights,
    canReview,
    orderItemId,
  };
};

export const getProductVariant = async (slug: string, options?: Record<string, string>) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const variant = await repo.findVariantByOptions(product.id, options || {});
  if (!variant || !variant.isActive) {
    const error: any = new Error("Không tìm thấy variant");
    error.statusCode = 404;
    throw error;
  }

  const normalizedVariant: RawVariant = {
    ...variant,
    code: variant.code ?? "",
  };

  const variantResponse = transformProductVariantResponse(product, normalizedVariant);

  return {
    ...variantResponse,
    pricingContext: {
      productId: product.id,
      variantId: variant.id,
      price: Number(variant.price),
      brandId: product.brand?.id,
      categoryPath: buildCategoryPath(product.category),
    },
  };
};

export const getProductSpecificationsBySlug = async (slug: string) => {
  const product = await repo.findSpecificationsBySlug(slug);

  // console.log(product);

  if (!product || !product.isActive) {
    const error: any = new Error("Không tìm thấy thông số sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const { specifications } = transformProductSpecifications(product);

  return { specifications };
};
export const getProductGallery = async (slug: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  // Get all color images for this product
  const colorImages = await repo.findColorImagesByProductId(product.id);

  // Group by color and return
  return colorImages.map((img) => ({
    id: img.id,
    color: img.color,
    imageUrl: img.imageUrl,
    altText: img.altText,
    position: img.position,
  }));
};

export const getRelatedProducts = async (slug: string, limit: number = 8) => {
  const product = await repo.findBySlug(slug);
  if (!product) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const related = await repo.findRelatedProducts(product.id, limit);

  // const productIds = related.map((p) => p.id);
  // const variantOptionsMap = await repo.getProductVariantOptionsMap(productIds);

  return related.map((p) => {
    const defaultVariant = p.variants?.[0];
    // const variantOptions = variantOptionsMap.get(p.id) ?? [];

    return {
      card: {
        ...transformProductCard(p),
        // variantOptions,
      },
      pricingContext: defaultVariant
        ? {
            productId: p.id,
            variantId: defaultVariant.id,
            price: Number(defaultVariant.price),
            brandId: p.brand?.id,
            categoryPath: buildCategoryPath(p.category),
          }
        : null,
    };
  });
};

export const getProductReviews = async (slug: string, query: ReviewsQuery) => {
  const product = await repo.findBySlug(slug);
  if (!product) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  return repo.findProductReviews(product.id, query);
};

// =====================
// === ADMIN SERVICES ===
// =====================

/**
 * Admin list - NO pricing needed (admin sees base prices only)
 */
export const getProductsAdmin = async (query: ListProductsQuery) => {
  const result = await repo.findAllAdmin(query);

  return {
    ...result,
    data: result.data.map(transformProductCard),
  };
};

/**
 * Admin detail - NO pricing needed (admin sees base prices only)
 */
export const getProductById = async (id: string) => {
  const product = await repo.findById(id);

  if (!product) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const reviewStats = await repo.getReviewStats(product.id);
  const stats: ReviewStats = {
    average: Number(product.ratingAverage) || 0,
    total: reviewStats.total,
    distribution: reviewStats.distribution as any,
  };

  return transformProductDetail(product, stats);
};

export const createProduct = async (input: CreateProductInput) => {
  const defaultCount = input.variants.filter((v) => v.isDefault).length;
  if (defaultCount !== 1) {
    const error: any = new Error("Phải có đúng 1 biến thể mặc định");
    error.statusCode = 400;
    throw error;
  }

  const slug = slugify(input.name).toLowerCase();

  const product = await repo.create({
    ...input,
    slug,
  });

  return transformProductDetail(product);
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  // Check product exists
  await getProductById(id);

  const updateData: any = { ...input };

  // Update slug if name changed
  if (input.name) {
    updateData.slug = slugify(input.name).toLowerCase();
  }

  // Validate default variant if variants are updated
  if (input.variants) {
    const defaultCount = input.variants.filter((v) => v.isDefault).length;
    if (defaultCount > 1) {
      const error: any = new Error("Chỉ được có tối đa 1 biến thể mặc định");
      error.statusCode = 400;
      throw error;
    }
  }

  const product = await repo.update(id, updateData);
  return transformProductDetail(product);
};

export const deleteProduct = async (id: string) => {
  await getProductById(id);
  return repo.remove(id);
};

/**
 * 1. Get flash sale products (products on sale today)
 * For Home: Container Flash Sale
 */
export const getFlashSaleProducts = async (
  date: Date = new Date(),
  options: { limit?: number; categoryId?: string } = {},
) => {
  const products = await repo.findProductsOnSaleByDate(date, options);

  // console.log(products);

  // const productIds = products.map((p) => p.id);
  // const variantOptionsMap = await repo.getProductVariantOptionsMap(productIds);

  // console.log(productIds);

  return {
    data: products.map((product) => {
      const defaultVariant = product.variants?.[0];
      // const variantOptions = variantOptionsMap.get(product.id) ?? [];

      return {
        card: {
          ...transformProductCard(product),
          // variantOptions,
        },
        pricingContext: defaultVariant
          ? {
              productId: product.id,
              variantId: defaultVariant.id,
              price: Number(defaultVariant.price),
              brandId: product.brand?.id,
              categoryPath: buildCategoryPath(product.category),
            }
          : null,
      };
    }),
    total: products.length,
    date,
  };
};

/**
 * 2. Get categories with sale products
 * For Home: Container liệt kê categories có sản phẩm sale
 */
export const getCategoriesWithSaleProducts = async (date: Date = new Date()) => {
  const categories = await repo.findCategoriesWithSaleProducts(date);

  // Get sale products count for each category
  const countMap = await repo.getSaleProductsCountByCategories(date);

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    totalProducts: category._count.products,
    saleProductsCount: countMap.get(category.id) || 0,
  }));
};

/**
 * 3. Get featured products by categories
 * For Home: Sections sản phẩm featured theo category
 */

export const getFeaturedProductsByCategories = async (
  options: {
    limit?: number;
    categoriesLimit?: number;
  } = {},
) => {
  const results = await repo.findFeaturedProductsByCategories(options);

  // Lấy productIds để query variant options
  const allProductIds = results.flatMap((r) => r.products.map((p) => p.id));
  const variantOptionsMap = await repo.getProductVariantOptionsMap(allProductIds);

  return results.map((result) => ({
    category: result.category,
    products: result.products.map((product) => {
      const defaultVariant = product.variants?.[0];
      const variantOptions = variantOptionsMap.get(product.id) ?? [];

      return {
        card: {
          ...transformProductCard(product),
          variantOptions,
        },
        pricingContext: defaultVariant
          ? {
              productId: product.id,
              variantId: defaultVariant.id,
              price: Number(defaultVariant.price),
              brandId: product.brand?.id,
              categoryPath: buildCategoryPath(product.category),
            }
          : null,
      };
    }),
    total: result.products.length,
  }));
};
/**
 * 4. Get upcoming promotions
 * For Home: Preview các đợt sale sắp tới
 */
export const getUpcomingPromotions = async (limit: number = 5) => {
  const currentDate = new Date();
  const promotions = await repo.findUpcomingPromotions(currentDate, limit);

  return promotions.map((promo) => ({
    id: promo.id,
    name: promo.name,
    description: promo.description,
    startDate: promo.startDate,
    endDate: promo.endDate,
    priority: promo.priority,
    targetsCount: promo._count.targets,
  }));
};

/**
 * 5. Get products by promotion (for preview)
 * For Home: Xem trước sản phẩm của promotion sắp tới
 */
export const getProductsByPromotion = async (promotionId: string, limit: number = 20) => {
  const result = await repo.findProductsByPromotionId(promotionId, limit);

  if (!result) {
    const error: any = new Error("Không tìm thấy promotion");
    error.statusCode = 404;
    throw error;
  }

  return {
    promotion: result.promotion,
    products: result.products.map(transformProductCard),
    total: result.total,
  };
};

/**
 * 6. Get best selling products
 * For Home: Sản phẩm bán chạy
 */
export const getBestSellingProducts = async (limit: number = 12) => {
  const products = await repo.findBestSellingProducts(limit);

  // console.log(products);

  // const productIds = products.map((p) => p.id);
  // const variantOptionsMap = await repo.getProductVariantOptionsMap(productIds);

  return products.map((product) => {
    const defaultVariant = product.variants?.[0];
    // const variantOptions = variantOptionsMap.get(product.id) ?? [];

    return {
      card: {
        ...transformProductCard(product),
        // variantOptions,
      },
      pricingContext: defaultVariant
        ? {
            productId: product.id,
            variantId: defaultVariant.id,
            price: Number(defaultVariant.price),
            brandId: product.brand?.id,
            categoryPath: buildCategoryPath(product.category),
          }
        : null,
    };
  });
};

/**
 * 7. Get new arrival products
 * For Home: Sản phẩm mới về
 */
export const getNewArrivalProducts = async (daysAgo: number = 30, limit: number = 12) => {
  const products = await repo.findNewArrivalProducts(daysAgo, limit);

  // const productIds = products.map((p) => p.id);
  // const variantOptionsMap = await repo.getProductVariantOptionsMap(productIds);

  return products.map((product) => {
    const defaultVariant = product.variants?.[0];
    // const variantOptions = variantOptionsMap.get(product.id) ?? [];

    return {
      card: {
        ...transformProductCard(product),
        // variantOptions,
      },
      pricingContext: defaultVariant
        ? {
            productId: product.id,
            variantId: defaultVariant.id,
            price: Number(defaultVariant.price),
            brandId: product.brand?.id,
            categoryPath: buildCategoryPath(product.category),
          }
        : null,
    };
  });
};

/**
 * 8. Get sale schedule (for Flash Sale timeline)
 * For Home: Lịch sale theo ngày
 */
export const getSaleSchedule = async (startDate: Date, endDate: Date) => {
  // Get all promotions in date range
  const allPromotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      OR: [
        // Promotions that start before endDate and end after startDate
        {
          AND: [
            {
              OR: [{ startDate: null }, { startDate: { lte: endDate } }],
            },
            {
              OR: [{ endDate: null }, { endDate: { gte: startDate } }],
            },
          ],
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
      _count: {
        select: {
          targets: true,
        },
      },
    },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }],
  });

  // Group promotions by date
  const schedule: Map<string, any[]> = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  allPromotions.forEach((promo) => {
    const promoStart = promo.startDate ? new Date(promo.startDate) : startDate;
    const promoEnd = promo.endDate ? new Date(promo.endDate) : endDate;

    let currentDate = new Date(Math.max(promoStart.getTime(), startDate.getTime()));
    const lastDate = new Date(Math.min(promoEnd.getTime(), endDate.getTime()));

    while (currentDate <= lastDate) {
      const dateKey = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!schedule.has(dateKey)) {
        schedule.set(dateKey, []);
      }

      const existing = schedule.get(dateKey)!;
      if (!existing.some((p) => p.id === promo.id)) {
        const currentDateOnly = new Date(currentDate);
        currentDateOnly.setHours(0, 0, 0, 0);

        existing.push({
          id: promo.id,
          name: promo.name,
          description: promo.description,
          startDate: promo.startDate,
          endDate: promo.endDate,
          priority: promo.priority,
          targetsCount: promo._count.targets,
          isActive: currentDateOnly.getTime() === today.getTime(),
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Convert map to array and sort by date
  return Array.from(schedule.entries())
    .map(([date, promotions]) => {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      return {
        date,
        promotions: promotions.sort((a, b) => b.priority - a.priority),
        isToday: dateObj.getTime() === today.getTime(),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * 9. Get active promotions
 * For Home: Danh sách promotions đang active hôm nay
 */
export const getActivePromotions = async () => {
  const today = new Date();
  const promotions = await repo.findActivePromotions(today);

  return promotions.map((promo) => ({
    id: promo.id,
    name: promo.name,
    description: promo.description,
    startDate: promo.startDate,
    endDate: promo.endDate,
    priority: promo.priority,
    targetsCount: promo._count.targets,
  }));
};
