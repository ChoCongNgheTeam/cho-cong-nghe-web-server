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
} from "./product.model";

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
  const attributes: Record<string, string> = {};
  const attributeIds: Record<string, string> = {};

  variant.variantAttributes?.forEach((va: any) => {
    const attrName = va.attributeOption.attribute.name;
    const attrValue = va.attributeOption.value;
    const attrId = va.attributeOption.id;

    attributes[attrName] = attrValue;
    attributeIds[attrName] = attrId;
  });

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
    available: available > 0, // ✅ Nhóm 1
    stockStatus: getStockStatus(quantity, reservedQuantity), // ✅ Nhóm 2
    inventory: {
      quantity,
      reservedQuantity,
      available,
    },
    images: variant.images || [],
    attributes,
    attributeIds,
  };
};

/**
 * Group attributes theo tên để render selector
 * Output: [{ name: "Color", values: ["Black", "White"] }, ...]
 */
const groupAttributes = (variants: any[]): AttributeGroup[] => {
  const attributeMap = new Map<string, AttributeGroup>();

  variants.forEach((variant) => {
    variant.variantAttributes?.forEach((va: any) => {
      const attrId = va.attributeOption.attribute.id;
      const attrName = va.attributeOption.attribute.name;
      const valueId = va.attributeOption.id;
      const value = va.attributeOption.value;

      if (!attributeMap.has(attrName)) {
        attributeMap.set(attrName, {
          id: attrId,
          name: attrName,
          values: [],
        });
      }

      const group = attributeMap.get(attrName)!;
      const existingValue = group.values.find((v) => v.id === valueId);

      if (!existingValue) {
        group.values.push({
          id: valueId,
          value,
          variantIds: [variant.id],
        });
      } else {
        if (!existingValue.variantIds.includes(variant.id)) {
          existingValue.variantIds.push(variant.id);
        }
      }
    });
  });

  return Array.from(attributeMap.values());
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

const extractAvailableColors = (variants: any[]): AvailableColor[] => {
  const colorMap = new Map<string, AvailableColor>();

  variants.forEach((variant) => {
    const colorAttr = variant.variantAttributes?.find(
      (va: any) => va.attributeOption.attribute.name === "Color"
    );

    if (colorAttr) {
      const colorName = colorAttr.attributeOption.value;
      const available = variant.inventory
        ? variant.inventory.quantity - variant.inventory.reservedQuantity > 0
        : false;

      if (!colorMap.has(colorName)) {
        colorMap.set(colorName, {
          name: colorName,
          hex: COLOR_HEX_MAP[colorName] || "#CCCCCC", // Default gray nếu không có mapping
          slug: colorName.toLowerCase().replace(/\s+/g, "-"),
          available: false,
          variantIds: [],
        });
      }

      const color = colorMap.get(colorName)!;
      color.variantIds.push(variant.id);

      // Nếu có ít nhất 1 variant available thì color.available = true
      if (available) {
        color.available = true;
      }
    }
  });

  // Sort: available trước, sau đó theo alphabet
  return Array.from(colorMap.values()).sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
};

/**
 * ✅ NHÓM 1: Extract available storages
 */
const extractAvailableStorages = (variants: any[]): AvailableStorage[] => {
  const storageMap = new Map<string, AvailableStorage>();

  variants.forEach((variant) => {
    const storageAttr = variant.variantAttributes?.find(
      (va: any) => va.attributeOption.attribute.name === "Storage"
    );

    if (storageAttr) {
      const storageName = storageAttr.attributeOption.value;
      const storageValue = parseInt(storageName) || 0; // Extract số: "256GB" -> 256
      const available = variant.inventory
        ? variant.inventory.quantity - variant.inventory.reservedQuantity > 0
        : false;

      if (!storageMap.has(storageName)) {
        storageMap.set(storageName, {
          name: storageName,
          value: storageValue,
          available: false,
          variantIds: [],
        });
      }

      const storage = storageMap.get(storageName)!;
      storage.variantIds.push(variant.id);

      if (available) {
        storage.available = true;
      }
    }
  });

  // Sort theo value tăng dần
  return Array.from(storageMap.values()).sort((a, b) => a.value - b.value);
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

/**
 * ✅ NHÓM 2: Build gallery from all variants
 */
const buildGallery = (variants: any[]): ProductGallery[] => {
  const galleryMap = new Map<string, ProductGallery>();

  variants.forEach((variant) => {
    variant.images?.forEach((img: any) => {
      if (!galleryMap.has(img.imageUrl)) {
        galleryMap.set(img.imageUrl, {
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          position: img.position,
          type: "product", // Có thể phân loại thêm sau
        });
      }
    });
  });

  // Sort theo position
  return Array.from(galleryMap.values()).sort((a, b) => a.position - b.position);
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
        return spec.unit ? `${spec.name} ${spec.unit}` : spec.name;
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
const transformProductDetail = (product: any, reviewStats?: ReviewStats): ProductDetail => {
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

    // ✅ NHÓM 1: Bắt buộc
    availableColors: extractAvailableColors(product.variants),
    availableStorages: extractAvailableStorages(product.variants),
    priceRange: calculatePriceRange(product.variants),

    // ✅ NHÓM 2: Nên có
    gallery: buildGallery(product.variants),
    warranty: "12 tháng chính hãng", // Có thể lấy từ DB nếu có
    stockStatus: calculateOverallStockStatus(product.variants),

    currentVariant: defaultVariant,
    variants: transformedVariants,
    attributes: groupAttributes(product.variants),
    highlights:
      product.productHighlights?.map((h: any) => ({
        id: h.specification.id,
        key: h.specification.key,
        name: h.specification.name,
        icon: h.specification.icon,
        unit: h.specification.unit,
      })) || [],
    specifications:
      product.productSpecifications?.map((s: any) => ({
        id: s.specification.id,
        key: s.specification.key,
        name: s.specification.name,
        icon: s.specification.icon,
        unit: s.specification.unit,
        value: s.value,
      })) || [],
    rating: reviewStats || {
      average: Number(product.ratingAverage) || 0,
      total: product.ratingCount || 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    reviews: [], // Sẽ load riêng qua endpoint /reviews
    viewsCount: Number(product.viewsCount) || 0,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
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

  // Lấy review stats
  const reviewStats = await repo.getReviewStats(product.id);
  const stats: ReviewStats = {
    average: Number(product.ratingAverage) || 0,
    total: reviewStats.total,
    distribution: reviewStats.distribution as any,
  };

  // Increment view count (async, không cần await)
  repo
    .update(product.id, {
      viewsCount: BigInt(product.viewsCount) + BigInt(1),
    })
    .catch(console.error);

  return transformProductDetail(product, stats);
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
