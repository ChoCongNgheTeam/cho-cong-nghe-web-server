import { buildVariantDisplayName } from "@/utils/build-variant-display-name";
import { normalizeVariant } from "./product.helpers";
import { ProductCard, ProductDetail, ProductVariant, ReviewStats, PriceRange, AvailableOption, Highlight, ProductSpecificationGroup, RawVariant, ColorImage } from "./product.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const getStockStatus = (quantity: number): "in_stock" | "low_stock" | "out_of_stock" => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 5) return "low_stock";
  return "in_stock";
};

const getVariantColor = (variant: RawVariant): string | undefined => {
  const colorAttr = variant.variantAttributes.find((va) => va.attributeOption.attribute.code === "color");
  return colorAttr?.attributeOption.value;
};

/**
 * Get images for a specific color from product's color images
 */
const getImagesForColor = (colorImages: any[], color?: string): ColorImage[] => {
  if (!color) return [];

  return colorImages
    .filter((img) => img.color === color)
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      id: img.id,
      color: img.color,
      imageUrl: img.imageUrl || "",
      altText: img.altText || "",
      position: img.position,
    }));
};

/**
 * Calculate price range from variants
 */
export const calculatePriceRange = (variants: RawVariant[]): PriceRange => {
  const prices = variants.filter((v) => v.isActive).map((v) => Number(v.price));

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

const isOptionEnabled = (variants: RawVariant[], testType: string, testValue: string, selectedOptions: Record<string, string>): boolean => {
  return variants.some((variant) => {
    // Check xem variant có attribute testType = testValue không
    const hasTestOption = variant.variantAttributes.some((va) => va.attributeOption.attribute.code === testType && va.attributeOption.value === testValue);

    if (!hasTestOption) return false;

    // Check xem variant có match với TẤT CẢ selectedOptions khác không
    const matchesOtherSelections = Object.entries(selectedOptions).every(([type, value]) => {
      if (type === testType) return true; // Skip type đang test

      return variant.variantAttributes.some((va) => va.attributeOption.attribute.code === type && va.attributeOption.value === value);
    });

    return matchesOtherSelections;
  });
};

const buildAvailableOptionsWithStatus = (variants: RawVariant[], colorImages: any[], selectedOptions: Record<string, string>): AvailableOption[] => {
  // Map: attributeCode -> Map(value -> option info)
  const typesMap = new Map<string, Map<string, any>>();

  // Thu thập tất cả các options từ variants
  for (const variant of variants) {
    if (!variant.isActive) continue;

    for (const va of variant.variantAttributes) {
      const type = va.attributeOption.attribute.code;
      const opt = va.attributeOption;

      if (!typesMap.has(type)) {
        typesMap.set(type, new Map());
      }

      const optMap = typesMap.get(type)!;
      if (!optMap.has(opt.value)) {
        optMap.set(opt.value, {
          id: opt.id,
          value: opt.value,
          label: opt.label,
          enabled: false,
          image: null,
        });
      }
    }
  }

  // Tính enabled status cho từng option
  for (const [type, optMap] of typesMap.entries()) {
    for (const option of optMap.values()) {
      option.enabled = isOptionEnabled(variants, type, option.value, selectedOptions);

      // Thêm image nếu là color
      if (type === "color" && !option.image) {
        const colorImgs = getImagesForColor(colorImages, option.value);
        option.image = colorImgs[0] || null;
      }
    }
  }

  return Array.from(typesMap.entries())
    .map(([type, values]) => ({
      type,
      values: Array.from(values.values()),
    }))
    .sort((a, b) => {
      if (a.type === "color") return 1; // color đi sau
      if (b.type === "color") return -1;
      return 0; // giữ nguyên thứ tự các loại khác
    });
};

/**
 * Build danh sách "configuration bundles" cho product có variantDisplay = CARD.
 *
 * Thay vì cho chọn ram/storage riêng lẻ, FE sẽ thấy 1 selector dạng:
 *   - "6GB / 128GB"  ← variant id: xxx
 *   - "8GB / 128GB"  ← variant id: yyy
 *   - "8GB / 256GB"  ← variant id: zzz
 *
 * Trả về AvailableOption[] với type = "bundle" để FE phân biệt mode.
 */
const buildVariantBundles = (variants: RawVariant[], selectedVariantId: string, colorImages: any[]): AvailableOption[] => {
  const BUNDLE_ATTR_ORDER = ["ram", "storage", "gpu", "capacity_cooling", "capacity_washing", "capacity_fridge", "connection"];

  const bundleValues = variants
    .filter((v) => v.isActive)
    .map((v) => {
      // Build label theo thứ tự ưu tiên
      const attrMap = new Map(v.variantAttributes.map((va) => [va.attributeOption.attribute.code, va.attributeOption.label]));

      const labelParts: string[] = [];
      for (const code of BUNDLE_ATTR_ORDER) {
        const label = attrMap.get(code);
        if (label) labelParts.push(label.toUpperCase());
      }

      const label = labelParts.length > 0 ? labelParts.join(" / ") : v.code || v.id;

      return {
        id: v.id,
        value: v.id,
        label,
        enabled: v.isActive,
        selected: v.id === selectedVariantId,
        price: Number(v.price),
        image: null,
      };
    });

  const result: AvailableOption[] = [{ type: "bundle", values: bundleValues }];

  // Thêm color selector riêng nếu có nhiều màu khác nhau
  // (hoặc chỉ 1 màu — vẫn render để user biết đang chọn màu nào)
  const colorMap = new Map<string, any>();
  for (const v of variants) {
    if (!v.isActive) continue;
    const colorAttr = v.variantAttributes.find((va) => va.attributeOption.attribute.code === "color");
    if (colorAttr && !colorMap.has(colorAttr.attributeOption.value)) {
      const colorVal = colorAttr.attributeOption.value;
      const colorImg = colorImages.find((img: any) => img.color === colorVal) ?? null;
      colorMap.set(colorVal, {
        id: colorAttr.attributeOption.id,
        value: colorVal,
        label: colorAttr.attributeOption.label,
        enabled: true,
        image: colorImg
          ? {
              id: colorImg.id,
              color: colorImg.color,
              imageUrl: colorImg.imageUrl || "",
              altText: colorImg.altText || "",
              position: colorImg.position,
            }
          : null,
      });
    }
  }

  if (colorMap.size > 0) {
    result.push({ type: "color", values: Array.from(colorMap.values()) });
  }

  return result;
};

export const calculateOverallStockStatus = (variants: RawVariant[]): "in_stock" | "low_stock" | "out_of_stock" | "pre_order" => {
  const activeVariants = variants.filter((v) => v.isActive);

  let totalAvailable = 0;
  activeVariants.forEach((v) => {
    totalAvailable += Math.max(0, v.quantity);
  });

  if (totalAvailable === 0) return "out_of_stock";
  if (totalAvailable <= 10) return "low_stock";
  return "in_stock";
};

/**
 * Detect xem product có nên dùng bundle mode không.
 * Bundle khi: variantDisplay = CARD, HOẶC có attribute ngoài color (ram, gpu, capacity...)
 */
const shouldUseBundleMode = (product: any, validVariants: RawVariant[]): boolean => {
  if (product.variantDisplay === "CARD") return true;

  // Collect tất cả attribute types từ variants
  const attrTypes = new Set<string>();
  for (const v of validVariants) {
    for (const va of v.variantAttributes) {
      attrTypes.add(va.attributeOption.attribute.code);
    }
  }

  // Nếu có attribute nào ngoài color → bundle
  const NON_BUNDLE_ATTRS = new Set(["color", "storage", "size"]); // chỉ color → individual
  for (const type of attrTypes) {
    if (!NON_BUNDLE_ATTRS.has(type)) return true;
  }

  return false;
};

export const transformProductCard = (product: any): ProductCard | null => {
  const allVariants: any[] = product.variants ?? [];

  // Nếu không có variant nào active → skip
  if (allVariants.length === 0) {
    console.warn(`[transformProductCard] Product ${product.id} (${product.slug}) has no active variant — skipped`);
    return null;
  }

  // Chọn variant đại diện: ưu tiên isDefault, fallback về first
  const defaultVariant = allVariants.find((v: any) => v.isDefault) ?? allVariants[0];

  const firstColorImage = product.img?.[0];
  const thumbnail = firstColorImage?.imageUrl || "";
  const inStock = defaultVariant.quantity > 0;

  // Build display name từ variant attributes (fallback về product.name nếu thiếu data)
  const displayName = defaultVariant.variantAttributes?.length ? buildVariantDisplayName(product.name, defaultVariant.variantAttributes) : product.name;

  return {
    id: product.id,
    name: displayName,
    priceOrigin: Number(defaultVariant.price),
    slug: product.slug,
    thumbnail,
    createdAt: product.createdAt ? new Date(product.createdAt) : null,
    rating: {
      average: Number(product.ratingAverage) || 0,
      count: product.ratingCount || 0,
    },
    isFeatured: product.isFeatured,
    isNew: product.createdAt ? Date.now() - new Date(product.createdAt).getTime() < 6 * 24 * 60 * 60 * 1000 : false,
    highlights: product.productSpecifications.map((spec: any) => ({
      key: spec.specification.key,
      name: spec.specification.name,
      icon: spec.specification.icon,
      value: spec.value,
    })),
    inStock,
    isActive: product.isActive,
  };
};

export const transformProductDetail = (product: any, reviewStats?: ReviewStats): Omit<ProductDetail, "highlights" | "canReview" | "orderItemId"> => {
  const validVariants = product.variants.filter((v: { isActive: boolean }) => v.isActive);
  const currentVariant = validVariants.find((v: { isDefault: boolean }) => v.isDefault) ?? validVariants[0];

  // ← dùng helper mới thay vì chỉ check variantDisplay
  const isBundleMode = shouldUseBundleMode(product, validVariants);

  let availableOptions: AvailableOption[];
  if (isBundleMode) {
    availableOptions = buildVariantBundles(validVariants, currentVariant.id, product.img || []);
  } else {
    const selectedOptions: Record<string, string> = {};
    for (const va of currentVariant.variantAttributes) {
      const type = va.attributeOption.attribute.code;
      selectedOptions[type] = va.attributeOption.value;
    }
    availableOptions = buildAvailableOptionsWithStatus(validVariants, product.img || [], selectedOptions);
  }

  // Display name cho trang detail dùng currentVariant
  const displayName = currentVariant.variantAttributes?.length ? buildVariantDisplayName(product.name, currentVariant.variantAttributes) : product.name;

  return {
    id: product.id,
    name: displayName,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    category: product.category || [],
    priceRange: calculatePriceRange(product.variants),
    currentVariant: transformVariant(currentVariant, product.img),
    availableOptions,
    warranty: "12 tháng chính hãng",
    stockStatus: calculateOverallStockStatus(product.variants),
    rating: reviewStats!,
    viewsCount: Number(product.viewsCount) || 0,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const transformVariant = (variant: RawVariant, colorImages: any[]): ProductVariant => {
  const quantity = variant.quantity ?? 0;
  const available = Math.max(0, quantity);

  const color = getVariantColor(variant);
  const images = getImagesForColor(colorImages || [], color);

  return {
    id: variant.id,
    code: variant.code || "",
    price: Number(variant.price),
    quantity,
    soldCount: variant.soldCount,
    isDefault: variant.isDefault,
    isActive: variant.isActive,
    available: available > 0,
    stockStatus: getStockStatus(quantity),
    color,
    images,
  };
};

export const transformProductVariantResponse = (product: any, variant: RawVariant) => {
  const validVariants: RawVariant[] = product.variants.filter((v: { isActive: boolean }) => v.isActive).map(normalizeVariant);

  const isBundleMode = shouldUseBundleMode(product, validVariants); // ← dùng helper

  let availableOptions: AvailableOption[];
  if (isBundleMode) {
    availableOptions = buildVariantBundles(validVariants, variant.id, product.img || []);
  } else {
    const selectedOptions: Record<string, string> = {};
    for (const va of variant.variantAttributes) {
      const type = va.attributeOption.attribute.code;
      selectedOptions[type] = va.attributeOption.value;
    }
    availableOptions = buildAvailableOptionsWithStatus(validVariants, product.img || [], selectedOptions);
  }

  const displayName = variant.variantAttributes?.length ? buildVariantDisplayName(product.name, variant.variantAttributes) : product.name;

  return { name: displayName, variant: transformVariant(variant, product.img), availableOptions };
};

export const transformProductSpecifications = (product: {
  name: string;
  img: {
    id: string;
    imageUrl: string | null;
    position: number;
    color: string;
    altText: string | null;
  }[];
  productSpecifications: {
    specificationId: string;
    value: string | null;
  }[];
  categorySpecifications: {
    groupName: string;
    specification: {
      id: string;
      key: string;
      name: string;
      icon?: string | null;
      unit?: string | null;
    };
  }[];
}): {
  name: string;
  image: string | null;
  specifications: ProductSpecificationGroup[];
} => {
  const valueMap = new Map<string, string | null>(product.productSpecifications.map((ps) => [ps.specificationId, ps.value]));

  const groups: ProductSpecificationGroup[] = [];

  for (const cs of product.categorySpecifications) {
    let group = groups.find((g) => g.groupName === cs.groupName);
    if (!group) {
      group = { groupName: cs.groupName, items: [] };
      groups.push(group);
    }

    const rawValue = valueMap.get(cs.specification.id) ?? null;

    group.items.push({
      id: cs.specification.id,
      key: cs.specification.key,
      name: cs.specification.name,
      icon: cs.specification.icon ?? undefined,
      unit: cs.specification.unit ?? undefined,
      value: typeof rawValue === "string" ? rawValue : null,
    });
  }

  return {
    name: product.name,
    image: product.img?.[0]?.imageUrl ?? null, // safely handle null
    specifications: groups,
  };
};

export const transformProductHighlights = (product: any): Highlight[] => {
  return (
    product.productSpecifications
      ?.filter((s: any) => s.isHighlight)
      .map((s: any) => ({
        id: s.specification.id,
        key: s.specification.key,
        name: s.specification.name,
        icon: s.specification.icon,
        unit: s.specification.unit,
        value: s.value,
      }))
      .sort((a: any, b: any) => (a.highlightOrder || 0) - (b.highlightOrder || 0)) || []
  );
};
