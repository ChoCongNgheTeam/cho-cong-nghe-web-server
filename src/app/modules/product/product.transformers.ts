import {
  ProductCard,
  ProductDetail,
  ProductVariant,
  ReviewStats,
  PriceRange,
  AvailableOption,
  Highlight,
  ProductSpecificationGroup,
  RawVariant,
  ColorImage,
} from "./product.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// UPDATE: Simplified - dùng quantity trực tiếp
const getStockStatus = (quantity: number): "in_stock" | "low_stock" | "out_of_stock" => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 5) return "low_stock";
  return "in_stock";
};

/**
 * Get color từ type="color"
 */
const getVariantColor = (variant: RawVariant): string | undefined => {
  const colorAttr = variant.variantAttributes.find((va) => va.attributeOption.type === "color");
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

const isOptionEnabled = (variants: RawVariant[], testOptions: Record<string, string>) => {
  return variants.some((variant) =>
    variant.variantAttributes.every((va) => {
      const type = va.attributeOption.type;
      return testOptions[type] === va.attributeOption.value;
    }),
  );
};

/**
 * Build available options theo type
 */
const buildAvailableOptionsWithStatus = (
  variants: RawVariant[],
  colorImages: any[],
  selectedOptions: Record<string, string>,
): AvailableOption[] => {
  const typesMap = new Map<string, Map<string, any>>();

  for (const v of variants) {
    for (const va of v.variantAttributes) {
      const type = va.attributeOption.type;
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

  for (const [type, optMap] of typesMap.entries()) {
    for (const option of optMap.values()) {
      const testOptions = {
        ...selectedOptions,
        [type]: option.value,
      };

      option.enabled = isOptionEnabled(variants, testOptions);

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
 * UPDATE: Calculate overall stock status - dùng quantity trực tiếp
 */
export const calculateOverallStockStatus = (
  variants: RawVariant[],
): "in_stock" | "low_stock" | "out_of_stock" | "pre_order" => {
  const activeVariants = variants.filter((v) => v.isActive);

  let totalAvailable = 0;
  activeVariants.forEach((v) => {
    totalAvailable += Math.max(0, v.quantity);
  });

  if (totalAvailable === 0) return "out_of_stock";
  if (totalAvailable <= 10) return "low_stock";
  return "in_stock";
};

export const transformProductCard = (product: any): ProductCard => {
  const defaultVariant = product.variants[0];

  const firstColorImage = product.img?.[0];
  const thumbnail = firstColorImage?.imageUrl || "";
  const inStock = defaultVariant?.quantity > 0;

  // console.log(product);

  const highlights =
    product.productSpecifications.map((spec: any) => ({
      key: spec.specification.key,
      name: spec.specification.name,
      icon: spec.specification.icon,
      value: spec.value,
    })) || [];

  const isNew = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < 6 * 24 * 60 * 60 * 1000
    : false;

  return {
    id: product.id,
    name: product.name,
    priceOrigin: Number(defaultVariant.price),
    slug: product.slug,
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

export const transformProductDetail = (
  product: any,
  reviewStats?: ReviewStats,
): Omit<ProductDetail, "highlights" | "canReview" | "orderItemId"> => {
  const validVariants = product.variants.filter((v: { isActive: boolean }) => v.isActive);

  const currentVariant =
    validVariants.find((v: { isDefault: boolean }) => v.isDefault) ?? validVariants[0];

  const selectedOptions: Record<string, string> = {};
  for (const va of currentVariant.variantAttributes) {
    selectedOptions[va.attributeOption.type] = va.attributeOption.value;
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    category: product.category || [],
    priceRange: calculatePriceRange(product.variants),
    currentVariant: transformVariant(currentVariant, product.img),
    availableOptions: buildAvailableOptionsWithStatus(
      validVariants,
      product.img || [],
      selectedOptions,
    ),
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

// UPDATE: transformVariant - dùng quantity trực tiếp
export const transformVariant = (variant: RawVariant, colorImages: any[]): ProductVariant => {
  const quantity = variant.quantity ?? 0; // ✅ Direct field
  const available = Math.max(0, quantity);

  const color = getVariantColor(variant);
  const images = getImagesForColor(colorImages || [], color);

  return {
    id: variant.id,
    code: variant.code,
    price: Number(variant.price),
    quantity, // ✅ NEW: Direct field
    soldCount: variant.soldCount,
    isDefault: variant.isDefault,
    isActive: variant.isActive,
    available: available > 0,
    stockStatus: getStockStatus(quantity), // ✅ Simplified
    color,
    images,
  };
};

export const transformProductVariantResponse = (product: any, variant: RawVariant) => {
  const validVariants = product.variants.filter((v: { isActive: boolean }) => v.isActive);

  const selectedOptions: Record<string, string> = {};
  for (const va of variant.variantAttributes) {
    selectedOptions[va.attributeOption.type] = va.attributeOption.value;
  }

  return {
    variant: transformVariant(variant, product.img),
    availableOptions: buildAvailableOptionsWithStatus(
      validVariants,
      product.img || [],
      selectedOptions,
    ),
  };
};

export const transformProductSpecifications = (
  product: any,
): { specifications: ProductSpecificationGroup[] } => {
  const valueMap = new Map(
    product.productSpecifications.map((ps: any) => [ps.specificationId, ps.value]),
  );

  const groups: ProductSpecificationGroup[] = [];

  for (const cs of product.category.categorySpecifications) {
    const existingGroup = groups.find((g) => g.groupName === cs.groupName);

    const rawValue = valueMap.get(cs.specification.id);

    const item = {
      id: cs.specification.id,
      key: cs.specification.key,
      name: cs.specification.name,
      icon: cs.specification.icon,
      unit: cs.specification.unit,
      value: typeof rawValue === "string" ? rawValue : null,
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
