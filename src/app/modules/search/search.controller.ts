import { Request, Response } from "express";
import { searchProducts } from "./search.service";
import { transformProductCard } from "../product/product.transformers";
import { getVariantPricing } from "../pricing/pricing.service";
import { mapPricingToSummary } from "../pricing/pricing.helpers";

export const searchHandler = async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim();
  if (!q) {
    return res.json({
      data: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
      message: "Tìm kiếm thành công",
    });
  }

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 12, 48);

  const result = await searchProducts(q, page, limit);

  const enriched = await Promise.all(
    result.data.map(async (product: any) => {
      const card = transformProductCard(product);
      if (!card) return null;

      const defaultVariant = product.variants?.find((v: any) => v.isDefault) ?? product.variants?.[0];
      if (!defaultVariant) return { ...card, price: null };

      // Build categoryPath từ nested category
      const categoryPath: string[] = [];
      let cat = product.category;
      while (cat) {
        categoryPath.push(cat.id);
        cat = cat.parent;
      }
      categoryPath.reverse();

      const variantAttributes = (defaultVariant.variantAttributes ?? []).map((va: any) => ({
        code: va.attributeOption.attribute.code,
        value: va.attributeOption.value,
      }));

      // Dùng đúng getVariantPricing — trả về PricedProduct
      const priced = await getVariantPricing(
        product.id,
        defaultVariant.id,
        Number(defaultVariant.price),
        product.brand?.id,
        categoryPath,
        undefined, // userId — search không cần
        variantAttributes,
      );

      // mapPricingToSummary convert PricedProduct → summary shape FE dùng
      const priceSummary = mapPricingToSummary(priced);

      return {
        ...card,
        price: priceSummary,
      };
    }),
  );

  res.json({
    data: enriched.filter(Boolean),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Tìm kiếm thành công",
  });
};
