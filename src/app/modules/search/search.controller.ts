import { Request, Response } from "express";
import { searchProducts } from "./search.service";
import { SearchQuery } from "./search.validation";
import { transformProductCard } from "../product/product.transformers";
import { getVariantPricing } from "../pricing/pricing.service";
import { mapPricingToSummary } from "../pricing/pricing.helpers";
import { ProductCardRow } from "./search.repository";

// Enrich 1 sản phẩm với giá — tách riêng để Promise.allSettled bên dưới có thể
// bắt lỗi từng sản phẩm mà không làm sập toàn bộ response tìm kiếm.
const enrichProductWithPrice = async (product: ProductCardRow) => {
  const card = transformProductCard(product);
  if (!card) return null;

  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];
  if (!defaultVariant) return { ...card, price: null };

  // `selectCategoryTree` (product.repository.ts) chỉ lấy tối đa 2 cấp cha
  // (category → parent → grandparent) — grandparent KHÔNG có field `.parent` nữa.
  // Không dùng while-loop giả định đệ quy vô hạn (sai với shape thật, và nếu cây
  // category sâu hơn 3 cấp thì phần trên cũng bị cắt cụt do query chỉ join 2 cấp).
  // Xây trực tiếp theo đúng 3 cấp cố định: grandparent → parent → category.
  const categoryPath: string[] = [];
  const grandparent = product.category?.parent?.parent;
  const parent = product.category?.parent;
  if (grandparent) categoryPath.push(grandparent.id);
  if (parent) categoryPath.push(parent.id);
  if (product.category) categoryPath.push(product.category.id);

  const variantAttributes = (defaultVariant.variantAttributes ?? []).map((va) => ({
    code: va.attributeOption.attribute.code,
    value: va.attributeOption.value,
  }));

  const priced = await getVariantPricing(
    product.id,
    defaultVariant.id,
    Number(defaultVariant.price),
    product.brand?.id,
    categoryPath,
    undefined, // userId — search không cần
    variantAttributes,
  );

  const priceSummary = mapPricingToSummary(priced);

  return { ...card, price: priceSummary };
};

export const searchHandler = async (req: Request, res: Response) => {
  // Đã validate ở route middleware (validate(searchQuerySchema, "query")) — chỉ cast type ở đây.
  const query = req.query as unknown as SearchQuery;

  if (!query.q) {
    return res.json({
      data: [],
      meta: { page: 1, limit: query.limit, total: 0, totalPages: 0 },
      message: "Tìm kiếm thành công",
    });
  }

  const result = await searchProducts(query);

  // Promise.allSettled thay vì Promise.all: 1 sản phẩm lỗi tính giá (vd thiếu attribute,
  // promotion lỗi) sẽ không kéo sập toàn bộ kết quả tìm kiếm — chỉ sản phẩm đó bị bỏ qua,
  // có log lại để theo dõi thay vì âm thầm nuốt lỗi.
  const settled = await Promise.allSettled(result.data.map(enrichProductWithPrice));

  const enriched = settled.flatMap((r, i) => {
    if (r.status === "fulfilled") return r.value ? [r.value] : [];
    console.error(`[search] Lỗi enrich giá cho sản phẩm id=${result.data[i]?.id}:`, r.reason);
    return [];
  });

  res.json({
    data: enriched,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Tìm kiếm thành công",
  });
};
