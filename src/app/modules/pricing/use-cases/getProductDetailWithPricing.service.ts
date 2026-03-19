import { getProductBySlug } from "../../product/product.service";
import { getVariantPricing } from "../pricing.service";

export const getProductDetailWithPricing = async (slug: string, userId?: string) => {
  const productDetail = await getProductBySlug(slug, userId);

  // defaultVariantAttributes được expose từ getProductBySlug
  // (lấy từ raw product trước transform, nên có đầy đủ attributeOption.attribute.code)
  const price = await getVariantPricing(
    productDetail.id,
    productDetail.currentVariant.id,
    Number(productDetail.currentVariant.price),
    productDetail.brand?.id,
    productDetail.categoryPath,
    userId,
    productDetail.defaultVariantAttributes,
  );

  return { ...productDetail, price };
};
