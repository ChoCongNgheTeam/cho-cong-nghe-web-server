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

  return Array.from(typesMap.entries()).map(([type, values]) => ({
    type,
    values: Array.from(values.values()),
  }));
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
const buildVariantBundles = (variants: RawVariant[], selectedVariantId: string): AvailableOption[] => {
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
        id: v.id, // dùng variantId làm id để FE navigate
        value: v.id, // value = variantId
        label,
        enabled: v.isActive,
        selected: v.id === selectedVariantId,
        price: Number(v.price),
        image: null,
      };
    });

  return [{ type: "bundle", values: bundleValues }];
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

  // Bundle mode khi product.variantDisplay = CARD
  const isBundleMode = product.variantDisplay === "CARD";

  // Build availableOptions theo mode
  let availableOptions: AvailableOption[];
  if (isBundleMode) {
    // Bundle mode: FE chọn theo cụm cấu hình (6GB/128GB, 8GB/256GB...)
    availableOptions = buildVariantBundles(validVariants, currentVariant.id);
  } else {
    // Individual mode: FE chọn riêng từng attribute (color, storage...)
    const selectedOptions: Record<string, string> = {};
    for (const va of currentVariant.variantAttributes) {
      // console.log("va:", va);
      // console.log("attributeOption:", va.attributeOption);
      // console.log("attribute:", va.attributeOption?.attribute);
      const type = va.attributeOption.attribute.code;
      // console.log("type:", type);

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

  const isBundleMode = product.variantDisplay === "CARD";

  let availableOptions: AvailableOption[];
  if (isBundleMode) {
    availableOptions = buildVariantBundles(validVariants, variant.id);
  } else {
    const selectedOptions: Record<string, string> = {};
    for (const va of variant.variantAttributes) {
      const type = va.attributeOption.attribute.code;
      selectedOptions[type] = va.attributeOption.value;
    }
    availableOptions = buildAvailableOptionsWithStatus(validVariants, product.img || [], selectedOptions);
  }

  // Build name theo variant đang được chọn
  const displayName = variant.variantAttributes?.length ? buildVariantDisplayName(product.name, variant.variantAttributes) : product.name;

  return {
    name: displayName,
    variant: transformVariant(variant, product.img),
    availableOptions,
  };
};

export const transformProductSpecifications = (product: {
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
}): { specifications: ProductSpecificationGroup[] } => {
  const valueMap = new Map<string, string | null>(product.productSpecifications.map((ps) => [ps.specificationId, ps.value]));

  const groups: ProductSpecificationGroup[] = [];

  for (const cs of product.categorySpecifications) {
    let group = groups.find((g) => g.groupName === cs.groupName);

    if (!group) {
      group = {
        groupName: cs.groupName,
        items: [],
      };
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

  return { specifications: groups };
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
