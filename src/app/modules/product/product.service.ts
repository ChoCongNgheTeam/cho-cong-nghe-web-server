import { slugify } from "transliteration";
import * as repo from "./product.repository";
import {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  ReviewsQuery,
  BulkUpdateInput,
} from "./product.validation";
import {
  ProductCard,
  ProductDetail,
  AttributeGroup,
  ProductVariant,
  ReviewStats,
  AvailableColor,
  AvailableStorage,
  PriceRange,
  ProductGallery,
  AvailableOption,
} from "./product.model";
import { group } from "node:console";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// =====================
// === TRANSFORM HELPERS ===
// =====================

/**
 * Tính stock status dựa trên inventory
 */
const getStockStatus = (
  quantity: number,
  reservedQuantity: number
): "in_stock" | "low_stock" | "out_of_stock" => {
  const available = quantity - reservedQuantity;

  if (available <= 0) return "out_of_stock";
  if (available <= 5) return "low_stock"; // Còn <= 5 sản phẩm
  return "in_stock";
};

/**
 * Transform raw variant data sang FE-friendly format
 */
const transformVariant = (variant: any): ProductVariant => {
  // Build attributes object: { "Color": "Black", "Storage": "256GB" }
  const quantity = variant.inventory?.quantity ?? 0;
  const reservedQuantity = variant.inventory?.reservedQuantity ?? 0;
  const available = Math.max(0, quantity - reservedQuantity);

  return {
    id: variant.id,
    code: variant.code,
    price: Number(variant.price),
    originalPrice: variant.originalPrice ? Number(variant.originalPrice) : undefined,
    discountPrice: variant.discountPrice ? Number(variant.discountPrice) : undefined,
    discountPercentage: variant.discountPercentage ?? undefined,
    weight: variant.weight ? Number(variant.weight) : undefined,
    soldCount: variant.soldCount,
    isDefault: variant.isDefault,
    isActive: variant.isActive,
    available: available > 0,
    stockStatus: getStockStatus(quantity, reservedQuantity),
    inventory: {
      quantity,
      reservedQuantity,
      available,
    },
    images: variant.images || [],
  };
};

/**
 * ✅ NHÓM 1: Extract available colors
 * Mapping màu phổ biến sang hex code
 */
const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#FF0000",
  Blue: "#0000FF",
  Green: "#00FF00",
  Yellow: "#FFFF00",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Gray: "#808080",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  // Thêm các màu khác nếu cần
};

/**
 * ✅ NHÓM 1: Calculate price range
 */
const calculatePriceRange = (variants: any[]): PriceRange => {
  const prices = variants.filter((v) => v.isActive).map((v) => Number(v.price));

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

// Build gallery from all variants

const buildGallery = (variants: any[]): ProductGallery[] => {
  const galleryMap = new Map<string, ProductGallery>();
  let position = 0;

  variants.forEach((variant) => {
    variant.images?.forEach((img: any) => {
      if (!galleryMap.has(img.imageUrl)) {
        galleryMap.set(img.imageUrl, {
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          position: position++,
          type: "product", // Có thể phân loại thêm sau
        });
      }
    });
  });

  // Sort theo position
  return Array.from(galleryMap.values()).sort((a, b) => a.position - b.position);
};

const buildAvailableOptions = (variants: any[]): AvailableOption[] => {
  const map = new Map();

  for (const variant of variants) {
    for (const va of variant.variantAttributes) {
      const attributeName = va.attributeOption.attribute.name;
      const optionValue = va.attributeOption.value;
      const optionId = va.attributeOption.id;

      if (!map.has(attributeName)) {
        map.set(attributeName, new Map());
      }

      const valueMap = map.get(attributeName);

      if (!valueMap.has(optionId)) {
        valueMap.set(optionId, {
          id: optionId,
          value: optionValue,
          variantIds: [],
        });
      }

      valueMap.get(optionId).variantIds.push(variant.id);
    }
  }

  return Array.from(map.entries()).map(([attribute, values]) => ({
    attribute,
    values: Array.from(values.values()),
  }));
};

/**
 * ✅ NHÓM 2: Calculate overall stock status
 */
const calculateOverallStockStatus = (
  variants: any[]
): "in_stock" | "low_stock" | "out_of_stock" | "pre_order" => {
  const activeVariants = variants.filter((v) => v.isActive);

  let totalAvailable = 0;
  activeVariants.forEach((v) => {
    const available = (v.inventory?.quantity ?? 0) - (v.inventory?.reservedQuantity ?? 0);
    totalAvailable += Math.max(0, available);
  });

  if (totalAvailable === 0) return "out_of_stock";
  if (totalAvailable <= 10) return "low_stock"; // Tổng <= 10 sản phẩm
  return "in_stock";
};

/**
 * Transform product card data (for listing)
 */
const transformProductCard = (product: any): ProductCard => {
  const defaultVariant = product.variants[0];
  const price = defaultVariant ? Number(defaultVariant.price) : 0;
  const thumbnail = defaultVariant?.images[0]?.imageUrl || "";
  const inStock = defaultVariant?.inventory
    ? defaultVariant.inventory.quantity > defaultVariant.inventory.reservedQuantity
    : false;

  // Lấy highlights
  const highlights =
    product.productHighlights
      ?.map((h: any) => {
        const spec = h.specification;

        return {
          key: spec.key,
          name: spec.name,
          icon: spec.icon,
          value: spec.unit ? spec.unit : undefined,
        };
      })
      .slice(0, 3) || [];

  // Check sản phẩm mới (trong 30 ngày)
  const isNew = product.createdAt
    ? new Date().getTime() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price,
    thumbnail,
    rating: {
      average: Number(product.ratingAverage) || 0,
      count: product.ratingCount || 0,
    },
    isFeatured: product.isFeatured,
    isNew,
    highlights,
    inStock,
  };
};

/**
 * Transform product detail data (for product page)
 */

interface GroupedSpecification {
  groupName: string;
  items: any[]; // Danh sách các spec thuộc group này
}

const transformProductDetail = (
  product: any,
  reviewStats?: ReviewStats
): Omit<ProductDetail, "highlights" | "specifications"> => {
  const transformedVariants = product.variants.map(transformVariant);
  const defaultVariant =
    transformedVariants.find((v: { isDefault: any }) => v.isDefault) || transformedVariants[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    category: product.category || [],
    availableOptions: buildAvailableOptions(product.variants),
    priceRange: calculatePriceRange(product.variants),
    gallery: buildGallery(product.variants),
    warranty: "12 tháng chính hãng",
    stockStatus: calculateOverallStockStatus(product.variants),
    currentVariant: defaultVariant,
    variants: transformedVariants,

    rating: reviewStats!,
    viewsCount: Number(product.viewsCount) || 0,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const transformProductSpecifications = (product: any) => {
  const valueMap = new Map(
    product.productSpecifications.map((ps: any) => [ps.specificationId, ps.value])
  );

  const groups: any[] = [];

  for (const cs of product.category.categorySpecifications) {
    const existingGroup = groups.find((g) => g.groupName === cs.groupName);

    const item = {
      id: cs.specification.id,
      key: cs.specification.key,
      name: cs.specification.name,
      icon: cs.specification.icon,
      unit: cs.specification.unit,
      value: valueMap.get(cs.specification.id) ?? null,
    };

    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({
        groupName: cs.groupName,
        items: [item],
      });
    }
  }

  return { specifications: groups };
};

export const transformProductHighlights = (product: any) => {
  const highlightMap = new Map(
    product.productHighlights?.map((h: any) => [h.specificationId, h.sortOrder])
  );

  return (
    product.productSpecifications
      ?.map((s: any) => {
        const highlightOrder = highlightMap.get(s.specificationId);
        if (highlightOrder === undefined) return null;

        return {
          id: s.specification.id,
          key: s.specification.key,
          group: s.specification.group || "Khác",
          name: s.specification.name,
          icon: s.specification.icon,
          unit: s.specification.unit,
          value: s.value,
          isHighlight: true,
          highlightOrder,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.highlightOrder ?? 0) - (b.highlightOrder ?? 0)) || []
  );
};

// =====================
// === PUBLIC SERVICES ===
// =====================

export const getProductsPublic = async (query: ListProductsQuery) => {
  const result = await repo.findAllPublic(query);

  return {
    ...result,
    data: result.data.map(transformProductCard),
  };
};

export const getProductBySlug = async (slug: string) => {
  const product = await repo.findBySlug(slug);
  if (!product || !product.isActive) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const reviewStats = await repo.getReviewStats(product.id);

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

  return {
    ...productDetail,
    highlights,
  };
};

export const getProductSpecificationsBySlug = async (slug: string) => {
  const product = await repo.findSpecificationsBySlug(slug);

  if (!product || !product.isActive) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const { specifications } = transformProductSpecifications(product);

  return { specifications };
};

export const getRelatedProducts = async (slug: string, limit: number = 8) => {
  const product = await repo.findBySlug(slug);
  if (!product) {
    const error: any = new Error("Không tìm thấy sản phẩm");
    error.statusCode = 404;
    throw error;
  }

  const related = await repo.findRelatedProducts(product.id, limit);
  return related.map(transformProductCard);
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

export const getProductsAdmin = async (query: ListProductsQuery) => {
  const result = await repo.findAllAdmin(query);

  return {
    ...result,
    data: result.data.map(transformProductCard),
  };
};

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
  const slug = slugify(input.name).toLowerCase();

  const product = await repo.create({
    ...input,
    slug,
    categories: input.categories,
    variants: input.variants,
    highlights: input.highlights,
    specifications: input.specifications,
  });

  return transformProductDetail(product);
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  await getProductById(id); // Check existence

  const updateData: any = { ...input };

  if (input.name) {
    updateData.slug = slugify(input.name).toLowerCase();
  }

  const product = await repo.update(id, updateData);
  return transformProductDetail(product);
};

export const deleteProduct = async (id: string) => {
  await getProductById(id);
  return repo.remove(id);
};

export const bulkUpdateProducts = async (input: BulkUpdateInput) => {
  const { productIds, updates } = input;

  // Nếu có thêm categories, cần xử lý riêng từng product
  if (updates.categoryIds) {
    await Promise.all(
      productIds.map((id) =>
        repo.update(id, {
          categories: updates.categoryIds,
        })
      )
    );
    delete updates.categoryIds;
  }

  // Bulk update các field còn lại
  if (Object.keys(updates).length > 0) {
    await repo.bulkUpdate(productIds, updates);
  }

  return { success: true, updated: productIds.length };
};
