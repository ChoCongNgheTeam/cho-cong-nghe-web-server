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
} from "./product.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const getStockStatus = (
  quantity: number,
  reservedQuantity: number,
): "in_stock" | "low_stock" | "out_of_stock" => {
  const available = quantity - reservedQuantity;

  if (available <= 0) return "out_of_stock";
  if (available <= 5) return "low_stock";
  return "in_stock";
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
      const attr = va.attributeOption.attribute.name;
      // console.log(attr);

      return testOptions[attr] === va.attributeOption.value;
    }),
  );
};

/**
 * Build available options from variants
 */
const buildAvailableOptionsWithStatus = (
  variants: RawVariant[],
  selectedOptions: Record<string, string>,
): AvailableOption[] => {
  const attributesMap = new Map<string, Map<string, any>>();

  // collect all options
  for (const v of variants) {
    for (const va of v.variantAttributes) {
      const attr = va.attributeOption.attribute.name;
      const opt = va.attributeOption;

      // console.log(attr);
      // console.log(opt);

      if (!attributesMap.has(attr)) {
        attributesMap.set(attr, new Map());
      }

      const optMap = attributesMap.get(attr)!;
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

  // evaluate enabled
  for (const [attr, optMap] of attributesMap.entries()) {
    for (const option of optMap.values()) {
      const testOptions = {
        ...selectedOptions,
        [attr]: option.value,
      };

      option.enabled = isOptionEnabled(variants, testOptions);

      // chỉ color mới có image
      if (attr === "color" && !option.image) {
        const matchedVariant = variants.find((v) =>
          v.variantAttributes.some(
            (va) =>
              va.attributeOption.attribute.name === "color" &&
              va.attributeOption.value === option.value,
          ),
        );

        option.image = matchedVariant?.images?.[0] ?? null;
      }
    }
  }

  return Array.from(attributesMap.entries()).map(([attribute, values]) => ({
    attribute,
    values: Array.from(values.values()),
  }));
};

/**
 * Calculate overall stock status
 */
export const calculateOverallStockStatus = (
  variants: RawVariant[],
): "in_stock" | "low_stock" | "out_of_stock" | "pre_order" => {
  const activeVariants = variants.filter((v) => v.isActive);

  let totalAvailable = 0;
  activeVariants.forEach((v) => {
    const available = (v.inventory?.quantity ?? 0) - (v.inventory?.reservedQuantity ?? 0);
    totalAvailable += Math.max(0, available);
  });

  if (totalAvailable === 0) return "out_of_stock";
  if (totalAvailable <= 10) return "low_stock";
  return "in_stock";
};

export const transformProductCard = (product: any): ProductCard => {
  const defaultVariant = product.variants[0];
  const thumbnail = defaultVariant?.images[0]?.imageUrl || "";
  const inStock = defaultVariant?.inventory
    ? defaultVariant.inventory.quantity > defaultVariant.inventory.reservedQuantity
    : false;

  // Get highlights
  const highlights =
    product.productSpecifications
      ?.filter((spec: any) => spec.isHighlight)
      .slice(0, 3)
      .map((spec: any) => ({
        key: spec.specification.key,
        name: spec.specification.name,
        icon: spec.specification.icon,
        value: spec.value,
      })) || [];

  // Check if product is new (within 6 days)
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

  // lấy option của currentVariant
  const selectedOptions: Record<string, string> = {};
  for (const va of currentVariant.variantAttributes) {
    selectedOptions[va.attributeOption.attribute.name] = va.attributeOption.value;
  }

  // console.log(selectedOptions);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    category: product.category || [],
    priceRange: calculatePriceRange(product.variants),
    currentVariant: transformVariant(currentVariant),
    availableOptions: buildAvailableOptionsWithStatus(validVariants, selectedOptions),
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

export const transformVariant = (variant: RawVariant): ProductVariant => {
  const quantity = variant.inventory?.quantity ?? 0;
  const reservedQuantity = variant.inventory?.reservedQuantity ?? 0;
  const available = Math.max(0, quantity - reservedQuantity);

  return {
    id: variant.id,
    code: variant.code,
    price: Number(variant.price),
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

export const transformProductVariantResponse = (product: any, variant: RawVariant) => {
  const validVariants = product.variants.filter((v: { isActive: boolean }) => v.isActive);

  const selectedOptions: Record<string, string> = {};
  for (const va of variant.variantAttributes) {
    selectedOptions[va.attributeOption.attribute.name] = va.attributeOption.value;
  }

  return {
    variant: transformVariant(variant),
    availableOptions: buildAvailableOptionsWithStatus(validVariants, selectedOptions),
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
