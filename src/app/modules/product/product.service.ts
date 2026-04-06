import { slugify } from "transliteration";
import * as repo from "./product.repository";
import { CreateProductInput, UpdateProductInput, ListProductsQuery, ReviewsQuery, SearchSuggestQuery } from "./product.validation";
import { transformProductCard, transformProductDetail, transformProductSpecifications, transformProductHighlights, transformProductVariantResponse } from "./product.transformers";
import { RawVariant, ReviewStats } from "./product.types";
import { buildCategoryPath } from "../category/category.helpers";
import prisma from "prisma/client";
import { findProductsForComparison, findProductsOnSaleDate, findSaleScheduleDays, findTrendingSearchSuggestions, getAdminProductStats, getProductIdsFromPromotions } from "./product.repository";
import { normalizeVariant } from "./product.helpers";
import { NotFoundError, BadRequestError, ConflictError } from "@/errors";

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getVariantsForCards = (product: any): any[] => {
  const variants: any[] = product.variants ?? [];
  if (variants.length === 0) return [];

  if (product.variantDisplay === "CARD") return variants;

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  return defaultVariant ? [defaultVariant] : [];
};

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
      variantAttributes: (variant.variantAttributes ?? []).map((va: any) => ({
        code: va.attributeOption.attribute.code,
        value: va.attributeOption.value,
      })),
    },
  };
};

/**
 * Assert product tồn tại + chưa bị xóa mềm (mặc định).
 * includeDeleted = true → chỉ check tồn tại (dùng cho restore/hardDelete).
 */
const assertProductExists = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const product = await repo.findById(id, options);
  if (!product) throw new NotFoundError("Sản phẩm");
  return product;
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────

// Thêm interleave khi search
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

// Helper interleave
const interleaveBrands = (items: Array<{ card: any; pricingContext: any }>) => {
  const groups = new Map<string, Array<{ card: any; pricingContext: any }>>();

  for (const item of items) {
    // brandId từ pricingContext
    const brandId = item.pricingContext?.brandId ?? "unknown";
    if (!groups.has(brandId)) groups.set(brandId, []);
    groups.get(brandId)!.push(item);
  }

  const result: Array<{ card: any; pricingContext: any }> = [];
  const queues = Array.from(groups.values());
  let i = 0;

  while (result.length < items.length) {
    const active = queues.filter((q) => q.length > 0);
    if (active.length === 0) break;
    const queue = queues[i % queues.length];
    if (queue.length > 0) result.push(queue.shift()!);
    i++;
  }

  return result;
};

export const getSearchSuggestions = async (query: SearchSuggestQuery) => {
  return repo.findSearchSuggestions(query.q, {
    limit: query.limit,
    categorySlug: query.category,
  });
};

export const getProductBySlug = async (slug: string, userId?: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const reviewStats = await repo.getReviewStats(product.id);
  // check view count cho nay
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

  if (userId) {
    const orderItem = await repo.findOrderItemForReview(userId, product.id);
    canReview = !!orderItem && !orderItem.review;
    orderItemId = orderItem?.id ?? null;
  }

  // Extract variantAttributes từ default variant của raw product
  // để pricing use-cases có thể forward cho ATTRIBUTE promotion matching
  const defaultVariant = product.variants?.find((v: any) => v.isDefault) ?? product.variants?.[0];
  const defaultVariantAttributes = (defaultVariant?.variantAttributes ?? [])
    .map((va: any) => ({
      code: va.attributeOption?.attribute?.code,
      value: va.attributeOption?.value,
    }))
    .filter((a: any) => a.code && a.value);

  return {
    ...productDetail,
    categoryPath: buildCategoryPath(product.category),
    highlights,
    highlightGroups,
    canReview,
    orderItemId,
    defaultVariantAttributes, // ← dùng trong getProductDetailWithPricing
  };
};

export const getProductVariant = async (slug: string, options?: Record<string, string>) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  let variant;
  // console.log(options?.bundle);

  // NEW: nếu có bundle param → tìm theo variantId trực tiếp
  if (options?.bundle) {
    variant = await repo.findVariantById(options.bundle);
  } else {
    variant = await repo.findVariantByOptions(product.id, options || {});
  }

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
      variantAttributes: (variant.variantAttributes ?? []).map((va: any) => ({
        code: va.attributeOption.attribute.code,
        value: va.attributeOption.value,
      })),
    },
  };
};

export const getProductVariantOptions = async (slug: string, options?: Record<string, string>) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  // Lấy tất cả active variants
  const allVariants = await repo.findAllActiveVariants(product.id);

  // Filter theo storage nếu có
  const storageFilter = options?.storage?.toLowerCase();

  const filtered = storageFilter
    ? allVariants.filter((v: any) => v.variantAttributes.some((va: any) => va.attributeOption.attribute.code === "storage" && va.attributeOption.value.toLowerCase() === storageFilter))
    : allVariants;

  // Map sang VariantOption format
  return filtered.map((v: any) => {
    const colorAttr = v.variantAttributes.find((va: any) => va.attributeOption.attribute.code === "color");
    const storageAttr = v.variantAttributes.find((va: any) => va.attributeOption.attribute.code === "storage");

    // Tìm ảnh cho color này
    const colorImage = product.img?.find((img: any) => img.color === colorAttr?.attributeOption.value);

    return {
      id: v.id, // variantId — đúng cho changeVariant
      colorLabel: colorAttr?.attributeOption.label ?? "",
      colorValue: colorAttr?.attributeOption.value ?? "",
      storageLabel: storageAttr?.attributeOption.label ?? "",
      // price: Number(v.price),
      // price: Number(10000000000),
      available: v.isActive && v.quantity > 0,
      imageUrl: colorImage?.imageUrl ?? null,
    };
  });
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

  return transformProductSpecifications(product);
};

export const getProductGallery = async (slug: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const colorImages = await repo.findColorImagesByProductId(product.id);

  // Build colorVariantMap: color → variantId của default variant có màu đó
  // Dùng để FE tự động chọn variant khi user click ảnh thuộc màu khác
  const activeVariants = product.variants.filter((v: any) => v.isActive);
  const colorVariantMap: Record<string, string> = {};

  for (const variant of activeVariants) {
    const colorAttr = variant.variantAttributes?.find((va: any) => va.attributeOption.attribute.code === "color");
    if (colorAttr) {
      const colorVal = colorAttr.attributeOption.value;
      // Ưu tiên isDefault, sau đó first active
      if (!colorVariantMap[colorVal] || variant.isDefault) {
        colorVariantMap[colorVal] = variant.id;
      }
    }
  }

  // Trả về flat list images + colorVariantMap để FE dùng
  return {
    images: colorImages.map((img) => ({
      id: img.id,
      color: img.color,
      imageUrl: img.imageUrl,
      altText: img.altText,
      position: img.position,
      // variantId tương ứng màu này — FE dùng để sync variant selector
      variantId: colorVariantMap[img.color] ?? null,
    })),
    // Map tổng: { "black": "variant-uuid", "white": "variant-uuid" }
    // FE dùng để biết khi scroll tới ảnh màu nào → select variant nào
    colorVariantMap,
  };
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

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — LIST & DETAIL
// ─────────────────────────────────────────────────────────────────────────────

export const getProductsAdmin = async (query: Record<string, any>) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: result.data.map(transformProductCard).filter(Boolean) };
};

export const getDeletedProducts = async (query: Record<string, any> = {}) => {
  const result = await repo.findAllDeleted(query);
  return { ...result, data: result.data.map(transformProductCard).filter(Boolean) };
};

// export const getProductById = async (id: string, options: { includeDeleted?: boolean } = {}) => {
//   const product = await repo.findById(id, options);
//   if (!product) throw new NotFoundError("Sản phẩm");

//   const reviewStats = await repo.getReviewStats(product.id);
//   const stats: ReviewStats = {
//     average: Number(product.ratingAverage) || 0,
//     total: reviewStats.total,
//     distribution: reviewStats.distribution as any,
//   };

//   return transformProductDetail(product, stats);
// };
export const getProductById = async (id: string, options: { includeDeleted?: boolean } = {}) => {
  const product = await repo.findById(id, options);
  if (!product) throw new NotFoundError("Sản phẩm");

  // Trả về raw data để admin có thể edit variants, img, specifications
  return {
    ...product,
    // Normalize Decimal → number để JSON serialize đúng
    ratingAverage: Number(product.ratingAverage),
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
    productSpecifications: product.productSpecifications.map((s) => ({
      ...s,
      sortOrder: s.sortOrder ?? 0,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const createProduct = async (input: CreateProductInput) => {
  const defaultCount = input.variants.filter((v) => v.isDefault).length;
  if (defaultCount !== 1) throw new BadRequestError("Phải có đúng 1 biến thể mặc định");

  const baseSlug = slugify(input.name).toLowerCase();
  let slug = baseSlug;
  let counter = 1;

  // Slug conflict: thêm suffix -2, -3... nếu trùng
  while (await repo.checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const product = await repo.create({ ...input, slug });
  return transformProductDetail(product);
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  await assertProductExists(id);

  const { brandId, categoryId, ...rest } = input;

  const updateData: any = {
    ...rest,
    ...(brandId && {
      brand: {
        connect: { id: brandId },
      },
    }),
    ...(categoryId && {
      category: {
        connect: { id: categoryId },
      },
    }),
  };

  if (input.name) {
    const baseSlug = slugify(input.name).toLowerCase();
    let slug = baseSlug;
    let counter = 1;
    while (await repo.checkSlugExists(slug, id)) {
      slug = `${baseSlug}-${counter++}`;
    }
    updateData.slug = slug;
  }

  if (input.variants) {
    const defaultCount = input.variants.filter((v) => v.isDefault).length;
    if (defaultCount > 1) throw new BadRequestError("Chỉ được có tối đa 1 biến thể mặc định");
  }

  await repo.update(id, updateData);

  // Fetch lại raw data để FE admin dùng (giống getProductById)
  const updated = await repo.findById(id);
  return {
    ...updated!,
    ratingAverage: Number(updated!.ratingAverage),
    variants: updated!.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
    productSpecifications: updated!.productSpecifications.map((s) => ({
      ...s,
      sortOrder: s.sortOrder ?? 0,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — SOFT DELETE LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soft delete — set deletedAt/deletedBy + isActive = false.
 * Dùng cho nút "Xóa" trên admin list.
 */
export const softDeleteProduct = async (id: string, deletedBy: string) => {
  await assertProductExists(id); // chưa bị xóa
  return repo.softDelete(id, deletedBy);
};

/**
 * Restore từ trash.
 * Kiểm tra slug conflict: nếu có product khác đang dùng slug này thì báo lỗi.
 */
export const restoreProduct = async (id: string) => {
  const product = await assertProductExists(id, { includeDeleted: true });

  if (!product.deletedAt) throw new BadRequestError("Sản phẩm chưa bị xóa");

  // Kiểm tra slug conflict
  const slugConflict = await repo.checkSlugExists(product.slug, id);
  if (slugConflict) {
    throw new ConflictError(`Không thể khôi phục: slug "${product.slug}" đã được dùng bởi sản phẩm khác. Vui lòng đổi tên sản phẩm kia trước.`);
  }

  return repo.restore(id);
};

/**
 * Hard delete — xóa vĩnh viễn.
 * Bắt buộc phải soft-delete trước (theo pattern).
 * Controller cần xóa cloudinary images trước khi gọi hàm này.
 */
export const hardDeleteProduct = async (id: string) => {
  const product = await assertProductExists(id, { includeDeleted: true });
  if (!product.deletedAt) throw new BadRequestError("Phải soft-delete trước khi xóa vĩnh viễn");
  return repo.hardDelete(id);
};

/**
 * Bulk soft-delete nhiều sản phẩm
 */
export const bulkSoftDeleteProducts = async (ids: string[], deletedBy: string) => {
  if (!ids.length) throw new BadRequestError("Danh sách ID không được rỗng");
  return repo.bulkSoftDelete(ids, deletedBy);
};

/**
 * Bulk update (isActive, isFeatured...)
 */
export const bulkUpdateProducts = async (ids: string[], updates: any) => {
  if (!ids.length) throw new BadRequestError("Danh sách ID không được rỗng");
  return repo.bulkUpdate(ids, updates);
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — VARIANT SOFT DELETE
// ─────────────────────────────────────────────────────────────────────────────

export const softDeleteVariant = async (variantId: string, deletedBy: string) => {
  return repo.softDeleteVariant(variantId, deletedBy);
};

export const restoreVariant = async (variantId: string) => {
  return repo.restoreVariant(variantId);
};

// ─────────────────────────────────────────────────────────────────────────────
// PROMOTION / SALE (public — unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export const getFlashSaleProducts = async (date: Date = new Date(), options: { limit?: number; categoryId?: string } = {}) => {
  const { products, promotions } = await repo.findProductsOnSaleByDate(date, options);

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

// ─────────────────────────────────────────────────────────────────────────────
// 1. SEARCH SUGGESTIONS TRENDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSearchSuggestionsTrending
 *
 * Khi q rỗng (user focus vào ô search chưa gõ):
 *   → Trả về top 8 sản phẩm trending nhất (viewsCount + soldCount)
 *
 * Khi q có nội dung:
 *   → Filter ILIKE + sort viewsCount
 *
 * Mỗi item có isTrending = true/false để FE render icon 🔥.
 */
export const getSearchSuggestionsTrending = async (q: string, options: { limit?: number; category?: string } = {}) => {
  return findTrendingSearchSuggestions(q, {
    limit: options.limit,
    categorySlug: options.category,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. SALE SCHEDULE V2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSaleScheduleV2
 *
 * Trả về lịch sale dạng calendar (metadata only, không load products).
 * Default: 14 ngày từ hôm nay.
 * Max range: 60 ngày để tránh quá tải.
 */
export const getSaleScheduleV2 = async (startDate?: Date, endDate?: Date) => {
  const now = new Date();
  const from = startDate ?? now;
  const to = endDate ?? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // Guard: không cho phép range > 60 ngày
  const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 60) {
    throw new BadRequestError("Khoảng thời gian tối đa là 60 ngày");
  }

  return findSaleScheduleDays(from, to);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRODUCTS ON SALE DATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getProductsOnSaleDate
 *
 * Trả về products có promotion vào đúng 1 ngày.
 * FE gọi khi user click vào 1 ô ngày trên calendar.
 */
export const getProductsOnSaleDate = async (
  date: Date,
  options: {
    promotionId?: string;
    page?: number;
    limit?: number;
    categoryId?: string;
    activeNow?: boolean;
  } = {},
) => {
  const result = await findProductsOnSaleDate(date, options);

  const cards: Array<{ card: any; pricingContext: any }> = [];

  for (const product of result.products) {
    const variants: any[] = product.variants ?? [];
    if (variants.length === 0) continue;

    const variantsForCards =
      product.variantDisplay === "CARD"
        ? [variants.find((v: any) => v.isDefault) ?? variants[0]].filter(Boolean) // ← chỉ lấy default dù CARD
        : [variants.find((v: any) => v.isDefault) ?? variants[0]].filter(Boolean);

    for (const variant of variantsForCards) {
      const card = transformProductCard({ ...product, variants: [variant] });
      if (!card) continue;

      cards.push({
        card,
        pricingContext: {
          productId: product.id,
          variantId: variant.id,
          price: Number(variant.price),
          brandId: product.brand?.id,
          categoryPath: buildCategoryPath(product.category),
          variantAttributes: (variant.variantAttributes ?? []).map((va: any) => ({
            code: va.attributeOption.attribute.code,
            value: va.attributeOption.value,
          })),
        },
      });

      // Giới hạn cứng sau khi expand variants
      if (cards.length >= (options.limit ?? 20)) break;
    }

    if (cards.length >= (options.limit ?? 20)) break;
  }

  return {
    date: new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }), // ← thay result.date
    promotions: result.promotions,
    data: cards,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};
// ─────────────────────────────────────────────────────────────────────────────
// 4. PRODUCT COMPARISON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * compareProducts
 *
 * Validate → fetch → normalize thành spec matrix.
 *
 * Response shape:
 * {
 *   categoryId: string,
 *   categoryName: string,
 *   products: [
 *     {
 *       id, name, slug, thumbnail, brand,
 *       price, inStock,
 *       rating: { average, count },
 *       totalSoldCount,
 *     },
 *     ...
 *   ],
 *   specMatrix: [
 *     {
 *       groupName: "Màn hình",
 *       specs: [
 *         {
 *           key: "screen_size",
 *           name: "Kích thước màn hình",
 *           icon: "...",
 *           unit: "inch",
 *           values: ["6.1", "6.7", null, "6.4"]  // null = sản phẩm đó không có spec này
 *         },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 */
export const compareProducts = async (ids: string[]) => {
  if (ids.length < 2 || ids.length > 4) {
    throw new BadRequestError("Cần 2-4 sản phẩm để so sánh");
  }

  const products = await findProductsForComparison(ids);

  // Validate tất cả sản phẩm tồn tại
  const foundIds = new Set(products.map((p) => p.id));
  const missingIds = ids.filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    throw new NotFoundError(`Sản phẩm không tồn tại: ${missingIds.join(", ")}`);
  }

  // Validate cùng category (so sánh categoryId cấp lá)
  const categoryIds = [...new Set(products.map((p) => p.categoryId))];
  if (categoryIds.length > 1) {
    throw new BadRequestError("Chỉ có thể so sánh sản phẩm trong cùng danh mục");
  }

  // Giữ đúng thứ tự ids đầu vào
  const orderedProducts = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;

  // Lấy category specs từ sản phẩm đầu tiên (cùng category nên specs giống nhau)
  const categorySpecs = orderedProducts[0].category.categorySpecifications;

  // Build spec value map: productId → specificationId → value
  const specValueMap = new Map<string, Map<string, string | null>>();
  for (const product of orderedProducts) {
    const valueMap = new Map<string, string | null>();
    for (const ps of product.productSpecifications) {
      valueMap.set(ps.specificationId, ps.value);
    }
    specValueMap.set(product.id, valueMap);
  }

  // Build spec matrix theo group
  const groupMap = new Map<
    string,
    Array<{
      specificationId: string;
      key: string;
      name: string;
      icon?: string | null;
      unit?: string | null;
      sortOrder: number;
      values: (string | null)[];
    }>
  >();

  // Track thứ tự group
  const groupOrder: string[] = [];

  for (const catSpec of categorySpecs) {
    const { groupName, specification } = catSpec;

    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
      groupOrder.push(groupName);
    }

    const values = orderedProducts.map((p) => {
      const pMap = specValueMap.get(p.id);
      return pMap?.get(specification.id) ?? null;
    });

    // Bỏ qua spec mà TẤT CẢ sản phẩm đều null (không có dữ liệu)
    const hasAnyValue = values.some((v) => v !== null);
    if (!hasAnyValue) continue;

    groupMap.get(groupName)!.push({
      specificationId: specification.id,
      key: specification.key,
      name: specification.name,
      icon: specification.icon,
      unit: specification.unit,
      sortOrder: specification.sortOrder,
      values,
    });
  }

  // Sort specs trong mỗi group theo sortOrder
  const specMatrix = groupOrder.map((groupName) => ({
    groupName,
    specs: (groupMap.get(groupName) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  // Build product summaries
  const productSummaries = orderedProducts.map((p) => {
    const defaultVariant = p.variants[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: p.img[0]?.imageUrl ?? null,
      brand: p.brand,
      price: defaultVariant ? Number(defaultVariant.price) : 0,
      inStock: defaultVariant ? defaultVariant.quantity > 0 : false,
      rating: {
        average: Number(p.ratingAverage),
        count: p.ratingCount,
      },
      totalSoldCount: p.totalSoldCount,
      isFeatured: p.isFeatured,
    };
  });

  return {
    categoryId: orderedProducts[0].category.id,
    categoryName: orderedProducts[0].category.name,
    categorySlug: orderedProducts[0].category.slug,
    products: productSummaries,
    specMatrix: specMatrix.filter((g) => g.specs.length > 0),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADMIN STATS
// ─────────────────────────────────────────────────────────────────────────────

export const getProductStats = async () => {
  const [stats, lowStockProducts, outOfStockProducts] = await Promise.all([
    getAdminProductStats(),
    repo.getLowStockProducts(5, 20), // quantity > 0 && <= 5
    repo.getOutOfStockProducts(20), // quantity = 0
  ]);

  // console.log("stats", stats);
  // console.log("lowStockProducts", lowStockProducts);
  // console.log("outOfStockProducts", outOfStockProducts);

  return {
    ...stats,
    lowStock: lowStockProducts.length,
    lowStockProducts,
    outOfStockProducts, // FE dùng cho banner
  };
};

/**
 * getProductVariantsBySelection
 *
 * Trả về variants + images đã lọc theo selectedOptions.
 *
 * VD: selectedOptions = { storage: "128gb" }
 *   → variants: 128GB × [Đen, Trắng, Đỏ]
 *   → images: chỉ ảnh của Đen/Trắng/Đỏ
 *
 * VD: selectedOptions = {} → tất cả variants (giống cũ)
 */
export const getProductVariantsBySelection = async (slug: string, selectedOptions: Record<string, string>, userId?: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) throw new NotFoundError("Sản phẩm");

  const matchedVariants = await repo.findActiveVariantsMatchingSelection(product.id, selectedOptions);

  const normalizedVariants = matchedVariants.map(normalizeVariant);

  // Collect màu từ matched variants để filter images
  const relevantColors = new Set<string>();
  for (const v of normalizedVariants) {
    const colorAttr = v.variantAttributes.find((va) => va.attributeOption.attribute.code === "color");
    if (colorAttr) relevantColors.add(colorAttr.attributeOption.value);
  }

  // Filter images theo màu — nếu không có attribute color thì trả về tất cả ảnh
  const filteredImages = relevantColors.size > 0 ? (product.img ?? []).filter((img: any) => relevantColors.has(img.color)) : (product.img ?? []);

  return {
    productId: product.id,
    brandId: (product as any).brand?.id,
    categoryPath: buildCategoryPath((product as any).category),
    selectedOptions,
    variants: normalizedVariants,
    images: filteredImages,
  };
};
