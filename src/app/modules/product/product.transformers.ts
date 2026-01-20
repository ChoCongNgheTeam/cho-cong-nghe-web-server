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

export const transformVariant = (variant: RawVariant): ProductVariant => {
  const quantity = variant.inventory?.quantity ?? 0;
  const reservedQuantity = variant.inventory?.reservedQuantity ?? 0;
  const available = Math.max(0, quantity - reservedQuantity);

  return {
    id: variant.id,
    code: variant.code,
    price: Number(variant.price),
    weight: undefined,
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
 * Calculate price range from variants
 */
export const calculatePriceRange = (variants: RawVariant[]): PriceRange => {
  const prices = variants.filter((v) => v.isActive).map((v) => Number(v.price));

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

/**
 * Build available options from variants
 */
export const buildAvailableOptions = (variants: RawVariant[]): AvailableOption[] => {
  const map = new Map();

  for (const variant of variants) {
    for (const va of variant.variantAttributes) {
      const attributeName = va.attributeOption.attribute.name;
      const optionValue = va.attributeOption.value;
      const optionLabel = va.attributeOption.label;
      const optionId = va.attributeOption.id;

      if (!map.has(attributeName)) {
        map.set(attributeName, new Map());
      }

      const valueMap = map.get(attributeName);

      if (!valueMap.has(optionId)) {
        valueMap.set(optionId, {
          id: optionId,
          value: optionValue,
          label: optionLabel,
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
  const price = defaultVariant ? Number(defaultVariant.price) : 0;
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

  // Check if product is new (within 10 days)
  const isNew = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < 10 * 24 * 60 * 60 * 1000
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

export const transformProductDetail = (
  product: any,
  reviewStats?: ReviewStats,
): Omit<ProductDetail, "highlights" | "canReview" | "orderItemId"> => {
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
    warranty: "12 tháng chính hãng",
    stockStatus: calculateOverallStockStatus(product.variants),
    currentVariant: defaultVariant,
    rating: reviewStats!,
    viewsCount: Number(product.viewsCount) || 0,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
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
