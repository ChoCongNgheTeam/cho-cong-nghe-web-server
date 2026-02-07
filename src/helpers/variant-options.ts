import { RawVariant } from "@/app/modules/product/product.types";

export const extractVariantOptions = (variant: RawVariant): Record<string, string> => {
  const options: Record<string, string> = {};

  for (const va of variant.variantAttributes) {
    const type = va.attributeOption.attribute.code; // "color", "storage", etc.
    options[type] = va.attributeOption.value;
  }

  return options;
};
