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

// =====================
// === PUBLIC SERVICES ===
// =====================

export const getProductsPublic = async (query: ListProductsQuery) => {
  const result = await repo.findAllPublic(query);

  const productIds = result.data.map((p) => p.id);
  const variantOptionsMap = await repo.getProductVariantOptionsMap(productIds);

  return {
    ...result,
    data: result.data.map((product) => {
      const defaultVariant = product.variants?.[0];
      const variantOptions = variantOptionsMap.get(product.id) ?? [];

      return {
        card: {
          ...transformProductCard(product),
          variantOptions,
        },

        // chỉ dùng nội bộ - KHÔNG trả về client
        pricingContext: defaultVariant
          ? {
              productId: product.id,
              variantId: defaultVariant.id,
              price: Number(defaultVariant.price),
              brandId: product.brand?.id,
              categoryId: product.category?.id,
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
    pricingContext: {
      productId: product.id,
      brandId: product.brand?.id,
      categoryId: product.category?.id,
      categoryPath: buildCategoryPath(product.category),
    },
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
    inventory: variant.inventory ?? undefined,
    images: variant.images.map((img) => ({
      ...img,
      imageUrl: img.imageUrl ?? "",
      altText: img.altText ?? "",
    })),
  };

  const variantResponse = transformProductVariantResponse(product, normalizedVariant);

  return {
    ...variantResponse,
    pricingContext: {
      productId: product.id,
      brandId: product.brand?.id,
      categoryId: product.category?.id,
      categoryPath: buildCategoryPath(product.category),
    },
  };
};

export const getProductSpecificationsBySlug = async (slug: string) => {
  const product = await repo.findSpecificationsBySlug(slug);

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

  const variants = await repo.findAllVariantsWithImages(product.id);

  // Collect all images from variants
  const allImages = variants.flatMap((variant) => variant.images);

  // Deduplicate by imageUrl
  const uniqueImages = Array.from(new Map(allImages.map((img) => [img.imageUrl, img])).values());

  return uniqueImages.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    altText: img.altText,
    position: img.position,
  }));
};

/**
 * IMPROVED: Return related products with pricing context
 */
export const getRelatedProducts = async (slug: string, limit: number = 8) => {
  const product = await repo.findBySlug(slug);
  if (!product) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const related = await repo.findRelatedProducts(product.id, limit);

  // Transform and include pricing context for each product
  return related.map((p) => {
    const defaultVariant = p.variants?.[0];
    const transformed = transformProductCard(p);

    return {
      ...transformed,
      // Internal use only - needed for pricing
      _pricingContext: defaultVariant
        ? {
            productId: p.id,
            variantId: defaultVariant.id,
            price: Number(defaultVariant.price),
            brandId: p.brand?.id,
            categoryId: p.category?.id,
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
