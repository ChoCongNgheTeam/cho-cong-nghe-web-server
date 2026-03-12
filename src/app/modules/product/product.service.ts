import { slugify } from "transliteration";
import * as repo from "./product.repository";
import { CreateProductInput, UpdateProductInput, ListProductsQuery, ReviewsQuery, SearchSuggestQuery } from "./product.validation";
import { transformProductCard, transformProductDetail, transformProductSpecifications, transformProductHighlights, transformProductVariantResponse } from "./product.transformers";
import { RawVariant, ReviewStats } from "./product.types";
import { buildCategoryPath } from "../category/category.helpers";
import prisma from "prisma/client";
import { findSearchSuggestions, getProductIdsFromPromotions } from "./product.repository";
import { normalizeVariant } from "./product.helpers";
import { NotFoundError, BadRequestError } from "@/errors";

/**
 * Từ product, chọn ra variants để tạo card:
 * - variantDisplay = CARD  → mỗi variant là 1 card riêng (oppo-a3, macbook-air-13-m4...)
 * - variantDisplay = SELECTOR → 1 card đại diện bằng isDefault (iphone, samsung...)
 */
const getVariantsForCards = (product: any): any[] => {
  const variants: any[] = product.variants ?? [];
  if (variants.length === 0) return [];

  if (product.variantDisplay === "CARD") {
    return variants; // mỗi variant → 1 card
  }

  // SELECTOR: 1 card đại diện
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  return defaultVariant ? [defaultVariant] : [];
};

/**
 * Build 1 card entry từ product + 1 variant cụ thể
 */
const buildCardEntry = (product: any, variant: any) => {
  const card = transformProductCard({ ...product, variants: [variant] });
  if (!card) return null;
  return {
    card,
    pricingContext: {
      productId: product.id,
      variantId: variant.id,
      price: Number(variant.price),
      brandId: product.brand?.id,
      categoryPath: buildCategoryPath(product.category),
    },
  };
};

//  Public

export const getProductsPublic = async (query: ListProductsQuery) => {
  const result = await repo.findAllPublic(query);

  const cards = result.data.flatMap((product) => {
    const variantsForCards = getVariantsForCards(product);
    return variantsForCards.flatMap((variant) => {
      const entry = buildCardEntry(product, variant);
      return entry ? [entry] : [];
    });
  });

  return {
    data: cards,
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
};

export const getSearchSuggestions = async (query: SearchSuggestQuery) => {
  return findSearchSuggestions(query.q, {
    limit: query.limit,
    categorySlug: query.category,
  });
};

export const getProductBySlug = async (slug: string, userId?: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const reviewStats = await repo.getReviewStats(product.id);

  repo.update(product.id, { viewsCount: BigInt(product.viewsCount) + BigInt(1) }).catch(console.error);

  const productDetail = transformProductDetail(product, {
    average: Number(product.ratingAverage) || 0,
    total: reviewStats.total,
    distribution: reviewStats.distribution as any,
  });

  const highlights = transformProductHighlights(product);
  const { groups: highlightGroups } = await repo.findHighlightSpecificationGroups(product.id, product.categoryId);

  let canReview = false;
  let orderItemId: string | null = null;

  console.log(userId);

  if (userId) {
    const orderItem = await repo.findOrderItemForReview(userId, product.id);
    canReview = !!orderItem && !orderItem.review;
    orderItemId = orderItem?.id ?? null;
  }

  return {
    ...productDetail,
    categoryPath: buildCategoryPath(product.category),
    highlights,
    highlightGroups,
    canReview,
    orderItemId,
  };
};

export const getProductVariant = async (slug: string, options?: Record<string, string>) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const variant = await repo.findVariantByOptions(product.id, options || {});
  if (!variant || !variant.isActive) throw new NotFoundError("Variant");

  const normalizedVariant = normalizeVariant(variant);
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

export const getAllProductVariants = async (slug: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const rawVariants = await repo.findAllActiveVariants(product.id);

  return {
    productId: product.id,
    brandId: product.brand?.id,
    categoryPath: buildCategoryPath(product.category),
    variants: rawVariants.map(normalizeVariant),
    images: product.img ?? [],
  };
};

export const getProductSpecificationsBySlug = async (slug: string) => {
  const product = await repo.findSpecificationsBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Thông số sản phẩm");

  const { specifications } = transformProductSpecifications(product);
  return { specifications };
};

export const getProductGallery = async (slug: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const colorImages = await repo.findColorImagesByProductId(product.id);
  return colorImages.map((img) => ({
    id: img.id,
    color: img.color,
    imageUrl: img.imageUrl,
    altText: img.altText,
    position: img.position,
  }));
};

export const getRelatedProducts = async (slug: string, limit = 8) => {
  const product = await repo.findBySlug(slug);
  if (!product) throw new NotFoundError("Sản phẩm");

  const related = await repo.findRelatedProducts(product.id, limit);

  return related.flatMap((p) => {
    const variantsForCards = getVariantsForCards(p);
    return variantsForCards.flatMap((variant) => {
      const entry = buildCardEntry(p, variant);
      return entry ? [entry] : [];
    });
  });
};

export const getProductReviews = async (slug: string, query: ReviewsQuery) => {
  const product = await repo.findBySlug(slug);
  if (!product) throw new NotFoundError("Sản phẩm");
  return repo.findProductReviews(product.id, query);
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getProductsAdmin = async (query: ListProductsQuery) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: result.data.map(transformProductCard).filter(Boolean) };
};

export const getProductById = async (id: string) => {
  const product = await repo.findById(id);
  if (!product) throw new NotFoundError("Sản phẩm");

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
  if (defaultCount !== 1) throw new BadRequestError("Phải có đúng 1 biến thể mặc định");

  const slug = slugify(input.name).toLowerCase();
  const product = await repo.create({ ...input, slug });
  return transformProductDetail(product);
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  await getProductById(id);

  const updateData: any = { ...input };

  if (input.name) {
    updateData.slug = slugify(input.name).toLowerCase();
  }

  if (input.variants) {
    const defaultCount = input.variants.filter((v) => v.isDefault).length;
    if (defaultCount > 1) throw new BadRequestError("Chỉ được có tối đa 1 biến thể mặc định");
  }

  const product = await repo.update(id, updateData);
  return transformProductDetail(product);
};

export const deleteProduct = async (id: string) => {
  await getProductById(id);
  return repo.remove(id);
};

// ── Promotion / Sale ──────────────────────────────────────────────────────────

export const getFlashSaleProducts = async (date: Date = new Date(), options: { limit?: number; categoryId?: string } = {}) => {
  const { products, promotions } = await repo.findProductsOnSaleByDate(date, options);

  // console.log(promotions);

  const firstPromotion = promotions?.[0];

  return {
    data: products.flatMap((product) => {
      const variantsForCards = getVariantsForCards(product);
      return variantsForCards.flatMap((variant) => {
        const entry = buildCardEntry(product, variant);
        return entry ? [entry] : [];
      });
    }),
    total: products.length,
    date,
    startDate: firstPromotion?.startDate ?? null,
    endDate: firstPromotion?.endDate ?? null,
  };
};

export const getCategoriesWithSaleProducts = async (date: Date = new Date(), limit = 5) => {
  const [products, { productIds: saleProductIds }] = await Promise.all([repo.getProductsForCategoryRanking(date), getProductIdsFromPromotions(date)]);

  const map = new Map<string, { totalProducts: number; saleProducts: number; newProducts: number; totalViews: number; totalSold: number }>();
  const NEW_DAYS = 15;
  const now = Date.now();

  for (const product of products) {
    const categoryId = product.category.parent?.id ?? product.category.id;

    if (!map.has(categoryId)) {
      map.set(categoryId, { totalProducts: 0, saleProducts: 0, newProducts: 0, totalViews: 0, totalSold: 0 });
    }

    const data = map.get(categoryId)!;
    data.totalProducts += 1;
    data.totalViews += Number(product.viewsCount);
    data.totalSold += product.variants.reduce((sum, v) => sum + v.soldCount, 0);

    if (saleProductIds.has(product.id)) data.saleProducts += 1;
    if (now - product.createdAt.getTime() < NEW_DAYS * 24 * 60 * 60 * 1000) data.newProducts += 1;
  }

  const categories = await prisma.categories.findMany({
    where: { id: { in: Array.from(map.keys()) }, isActive: true },
    select: { id: true, name: true, slug: true, imageUrl: true },
  });

  return categories
    .map((cat) => {
      const stat = map.get(cat.id)!;
      const score = stat.saleProducts * 5 + stat.newProducts * 3 + stat.totalSold * 0.1 + stat.totalViews * 0.01 + stat.totalProducts;
      return { ...cat, ...stat, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const getFeaturedProductsByCategories = async (options: { limit?: number; categoriesLimit?: number } = {}) => {
  const results = await repo.findFeaturedProductsByCategories(options);

  return results.map((result) => ({
    category: result.category,
    products: result.products.flatMap((product) => {
      const variantsForCards = getVariantsForCards(product);
      return variantsForCards.flatMap((variant) => {
        const entry = buildCardEntry(product, variant);
        return entry ? [entry] : [];
      });
    }),
    total: result.products.length,
  }));
};

export const getUpcomingPromotions = async (limit = 5) => {
  const promotions = await repo.findUpcomingPromotions(new Date(), limit);
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

export const getProductsByPromotion = async (promotionId: string, limit = 20) => {
  const result = await repo.findProductsByPromotionId(promotionId, limit);
  if (!result) throw new NotFoundError("Promotion");

  return {
    promotion: result.promotion,
    products: result.products.flatMap((product) => {
      const variantsForCards = getVariantsForCards(product);
      return variantsForCards.flatMap((variant) => {
        const entry = buildCardEntry(product, variant);
        return entry ? [entry] : [];
      });
    }),
    total: result.total,
  };
};

export const getFeaturedProducts = async (limit = 12) => {
  const products = await repo.findFeaturedProducts(limit);

  return products.flatMap((product) => {
    const variantsForCards = getVariantsForCards(product);
    return variantsForCards.flatMap((variant) => {
      const entry = buildCardEntry(product, variant);
      return entry ? [entry] : [];
    });
  });
};

export const getBestSellingProducts = async (limit = 12) => {
  const products = await repo.findBestSellingProducts(limit);
  return products.flatMap((product) => {
    const variantsForCards = getVariantsForCards(product);
    return variantsForCards.flatMap((variant) => {
      const entry = buildCardEntry(product, variant);
      return entry ? [entry] : [];
    });
  });
};

export const getRecentlyViewedProducts = async (productIds: string[]) => {
  const products = await repo.findProductsByIds(productIds);
  return products.flatMap((product) => {
    const variantsForCards = getVariantsForCards(product);
    return variantsForCards.flatMap((variant) => {
      const entry = buildCardEntry(product, variant);
      return entry ? [entry] : [];
    });
  });
};

export const getNewArrivalProducts = async (daysAgo = 30, limit = 12) => {
  const products = await repo.findNewArrivalProducts(daysAgo, limit);
  return products.flatMap((product) => {
    const variantsForCards = getVariantsForCards(product);
    return variantsForCards.flatMap((variant) => {
      const entry = buildCardEntry(product, variant);
      return entry ? [entry] : [];
    });
  });
};

export const getSaleSchedule = async (startDate: Date, endDate: Date) => {
  const allPromotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      OR: [
        {
          AND: [{ OR: [{ startDate: null }, { startDate: { lte: endDate } }] }, { OR: [{ endDate: null }, { endDate: { gte: startDate } }] }],
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
    },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }],
  });

  const schedule = new Map<string, any[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  allPromotions.forEach((promo) => {
    const promoStart = promo.startDate ? new Date(promo.startDate) : startDate;
    const promoEnd = promo.endDate ? new Date(promo.endDate) : endDate;

    let currentDate = new Date(Math.max(promoStart.getTime(), startDate.getTime()));
    const lastDate = new Date(Math.min(promoEnd.getTime(), endDate.getTime()));

    while (currentDate <= lastDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      if (!schedule.has(dateKey)) schedule.set(dateKey, []);

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

export const getActivePromotions = async () => {
  const promotions = await repo.findActivePromotions(new Date());
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
