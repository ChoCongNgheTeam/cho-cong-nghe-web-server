import { getAllProductVariants } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";

interface VariantOption {
  id: string;
  colorLabel: string;
  colorValue: string;
  storageLabel: string;
  storageValue: string;
  price: number; // base price
  finalPrice: number; // sau sale
  discountPercentage: number;
  available: boolean;
  isDefault: boolean;
}

export const getProductVariantOptions = async (slug: string, userId?: string): Promise<VariantOption[]> => {
  const { productId, brandId, categoryPath, variants, images } = await getAllProductVariants(slug); // ✅ cần thêm images (xem bên dưới)

  const results = await Promise.all(
    variants.map(async (variant) => {
      let colorLabel = "";
      let colorValue = "";
      let storageLabel = "";
      let storageValue = "";

      for (const va of variant.variantAttributes) {
        const code = va.attributeOption.attribute.code;
        if (code === "color") {
          colorLabel = va.attributeOption.label;
          colorValue = va.attributeOption.value;
        } else if (code === "storage") {
          storageLabel = va.attributeOption.label;
          storageValue = va.attributeOption.value;
        }
      }

      // ✅ Lấy ảnh đầu tiên theo color
      const firstImage = images.filter((img) => img.color === colorValue).sort((a, b) => a.position - b.position)[0];

      const pricing = await getVariantPricing(productId, variant.id, Number(variant.price), brandId, categoryPath, userId);

      return {
        id: variant.id,
        colorLabel,
        colorValue,
        storageLabel,
        storageValue,
        price: Number(variant.price),
        finalPrice: pricing.final ?? Number(variant.price),
        discountPercentage: pricing.discountPercentage ?? 0,
        available: variant.isActive && variant.quantity > 0,
        isDefault: variant.isDefault,
        imageUrl: firstImage?.imageUrl ?? null, // ✅ thêm
      };
    }),
  );

  return results;
};
