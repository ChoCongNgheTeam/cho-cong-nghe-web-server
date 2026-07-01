import prisma from "@/config/db";
import { buildProductWhere } from "@/app/modules/product/product_filter.where-builder";
import { generateEmbedding } from "../sync/embedding.sync";
import {
  SearchProductsArgs,
  GetProductDetailArgs,
  GetPolicyArgs,
  GetPromotionsArgs,
  ProductSearchResult,
  ProductDetailResult,
  ProductCard,
  PolicyResult,
  PromotionResult,
} from "../chatbot.types";

// ============================================================
// TOOL EXECUTORS
// Mỗi function là 1 tool — AI gọi, backend thực thi, trả data
// ============================================================

const PRODUCT_BASE_URL = "https://chocongnghe.id.vn/products";

// ─── PROMOTION CACHE (TTL: 60s) ─────────────────────────────
interface CachedPromotion {
  id: string;
  priority: number;
  rules: {
    actionType: string;
    discountValue: any;
    buyQuantity: any;
    getQuantity: any;
  }[];
  targets: { targetType: string; targetId: string | null }[];
}

let _promoCache: CachedPromotion[] | null = null;
let _promoCacheAt = 0;
const PROMO_TTL_MS = 60_000;

const getActivePromotionsCache = async (): Promise<CachedPromotion[]> => {
  const now = Date.now();
  if (_promoCache && now - _promoCacheAt < PROMO_TTL_MS) {
    return _promoCache;
  }

  const dbNow = new Date();
  const promos = await prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: dbNow } }] },
        { OR: [{ endDate: null }, { endDate: { gte: dbNow } }] },
      ],
    },
    select: {
      id: true,
      priority: true,
      rules: {
        select: {
          actionType: true,
          discountValue: true,
          buyQuantity: true,
          getQuantity: true,
        },
        take: 1,
        orderBy: { id: "asc" },
      },
      targets: {
        select: { targetType: true, targetId: true },
      },
    },
    orderBy: { priority: "desc" },
    take: 20,
  });

  _promoCache = promos as CachedPromotion[];
  _promoCacheAt = now;
  return _promoCache;
};

// ─── HELPER: tính giá & label từ promo ──────────────────────
const applyPromotion = (
  priceMin: number,
  priceMax: number,
  productId: string,
  promotions: CachedPromotion[],
): { finalPriceMin: number; finalPriceMax: number; promotionLabel?: string } => {
  const promo = promotions.find((p) =>
    p.targets.some(
      (t) => t.targetType === "ALL" || (t.targetType === "PRODUCT" && t.targetId === productId),
    ),
  );

  if (!promo?.rules?.[0]) {
    return { finalPriceMin: priceMin, finalPriceMax: priceMax };
  }

  const rule = promo.rules[0];

  if (rule.actionType === "DISCOUNT_PERCENT" && rule.discountValue) {
    const pct = Number(rule.discountValue);
    return {
      finalPriceMin: Math.round(priceMin * (1 - pct / 100)),
      finalPriceMax: Math.round(priceMax * (1 - pct / 100)),
      promotionLabel: `Giảm ${rule.discountValue}%`,
    };
  }
  if (rule.actionType === "DISCOUNT_FIXED" && rule.discountValue) {
    const fixed = Number(rule.discountValue);
    return {
      finalPriceMin: Math.max(0, priceMin - fixed),
      finalPriceMax: Math.max(0, priceMax - fixed),
      promotionLabel: `Giảm ${fixed.toLocaleString("vi-VN")}đ`,
    };
  }
  if (rule.actionType === "GIFT_PRODUCT") {
    return { finalPriceMin: priceMin, finalPriceMax: priceMax, promotionLabel: "Tặng quà" };
  }
  if (rule.actionType === "BUY_X_GET_Y") {
    return {
      finalPriceMin: priceMin,
      finalPriceMax: priceMax,
      promotionLabel: `Mua ${rule.buyQuantity} tặng ${rule.getQuantity}`,
    };
  }

  return { finalPriceMin: priceMin, finalPriceMax: priceMax };
};

// ─── 1. SEARCH PRODUCTS ─────────────────────────────────────
export const executeSearchProducts = async (
  args: SearchProductsArgs,
): Promise<ProductSearchResult[]> => {
  const {
    categorySlug,
    brandSlug,
    minPrice,
    maxPrice,
    storage,
    color,
    limit = 5,
    sortBy = "BEST_SELLING",
  } = args;
  
  let { specsFilter, attrsFilter, semanticQuery } = args;

  const dynamicQuery: Record<string, any> = {};

  if (categorySlug) dynamicQuery.category = categorySlug;
  if (minPrice) dynamicQuery.minPrice = minPrice;
  if (maxPrice) dynamicQuery.maxPrice = maxPrice;
  if (storage) dynamicQuery["attr_storage"] = storage;
  if (color) dynamicQuery["attr_color"] = color;

  if (brandSlug) {
    const brand = await prisma.brands.findUnique({
      where: { slug: brandSlug, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (brand) dynamicQuery.brandId = brand.id;
  }

  if (specsFilter) {
    if (typeof specsFilter === "string") {
      try { specsFilter = JSON.parse(specsFilter); } catch (e) {}
    }
    if (typeof specsFilter === "object" && specsFilter !== null) {
      for (const [key, value] of Object.entries(specsFilter)) {
        dynamicQuery[key.startsWith("spec_") ? key : `spec_${key}`] = value;
      }
    }
  }

  if (attrsFilter) {
    if (typeof attrsFilter === "string") {
      try { attrsFilter = JSON.parse(attrsFilter); } catch (e) {}
    }
    if (typeof attrsFilter === "object" && attrsFilter !== null) {
      for (const [key, value] of Object.entries(attrsFilter)) {
        dynamicQuery[`attr_${key}`] = value;
      }
    }
  }

  const where = await buildProductWhere(dynamicQuery, true);
  const takeCount = sortBy !== "BEST_SELLING" ? 20 : Math.min(limit, 10);

  let productIds: string[] = [];

  if (semanticQuery && semanticQuery.trim() !== "") {
    // 1. Lọc thô lấy ID
    const candidates = await prisma.products.findMany({ where, select: { id: true } });
    if (candidates.length > 0) {
      const candidateIds = candidates.map((c) => `'${c.id}'`).join(',');
      
      console.time('generateEmbedding');
      const embedding = await generateEmbedding(semanticQuery.trim(), 'query');
      console.timeEnd('generateEmbedding');
      
      console.time('vectorQuery');
      const vectorQuery = `
        SELECT "productId" as id FROM products_vector
        WHERE "productId" IN (${candidateIds})
        ORDER BY embedding <-> '[${embedding.join(',')}]'::vector
        LIMIT ${takeCount}
      `;
      const vectorRows: { id: string }[] = await prisma.$queryRawUnsafe(vectorQuery);
      productIds = vectorRows.map(r => r.id);
      console.timeEnd('vectorQuery');
    }
  } else {
    // Nếu không có semantic query thì fallback về SQL truyền thống
    const candidates = await prisma.products.findMany({ 
      where, 
      select: { id: true },
      orderBy: [{ totalSoldCount: "desc" }, { ratingAverage: "desc" }],
      take: takeCount
    });
    productIds = candidates.map(c => c.id);
  }

  console.time('fetchProductsData');
  const [products, promotions] = await Promise.all([
    prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        ratingAverage: true,
        img: {
          select: { imageUrl: true },
          orderBy: { position: "asc" },
          take: 1,
        },
        variants: {
          where: { isActive: true, deletedAt: null },
          select: { 
            id: true, 
            price: true, 
            quantity: true,
            variantAttributes: {
              select: {
                attributeOption: {
                  select: { label: true }
                }
              }
            }
          },
          orderBy: { price: "asc" },
          take: 10,
        },
        productSpecifications: {
          where: { isHighlight: true },
          select: {
            value: true,
            specification: { select: { name: true, key: true } },
          },
          orderBy: { sortOrder: "asc" },
          take: 4,
        },
      },
    }),
    getActivePromotionsCache(),
  ]);
  console.timeEnd('fetchProductsData');

  // Sort products to match the productIds order (vector search order)
  products.sort((a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id));

  let mappedProducts = products.map((p) => {
    const prices = p.variants.map((v) => Number(v.price));
    const priceMin = prices.length ? Math.min(...prices) : 0;
    const priceMax = prices.length ? Math.max(...prices) : 0;
    const inStockVariants = p.variants.filter((v) => v.quantity > 0);
    const inStock = inStockVariants.length > 0;
    const defaultVariantId = inStockVariants.length > 0 ? inStockVariants[0].id : undefined;

    const { finalPriceMin, finalPriceMax, promotionLabel } = applyPromotion(
      priceMin,
      priceMax,
      p.id,
      promotions,
    );

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      productUrl: `${PRODUCT_BASE_URL}/${p.slug}`,
      thumbnail: p.img[0]?.imageUrl || "",
      originalPriceMin: priceMin,
      originalPriceMax: priceMax,
      priceMin: finalPriceMin,
      priceMax: finalPriceMax,
      brand: p.brand.name,
      category: p.category.name,
      inStock,
      rating: Number(p.ratingAverage),
      highlights: p.productSpecifications.map((ps) => ({
        key: ps.specification.key,
        name: ps.specification.name,
        value: ps.value,
      })),
      promotionLabel,
      defaultVariantId,
      variants: p.variants
    .filter((v) => v.quantity > 0)
    .map((v) => ({
      id: v.id,
      label: v.variantAttributes.map((va) => va.attributeOption.label).join(" / ") || "Mặc định"
    })),
    };
  });

  if (sortBy === "PRICE_ASC") {
    mappedProducts.sort((a, b) => a.priceMin - b.priceMin);
  } else if (sortBy === "PRICE_DESC") {
    mappedProducts.sort((a, b) => b.priceMin - a.priceMin);
  }

  return mappedProducts.slice(0, Math.min(limit, 10));
};

// ─── 2. GET PRODUCT DETAIL ──────────────────────────────────
export const executeGetProductDetail = async (
  args: GetProductDetailArgs,
): Promise<ProductDetailResult | null> => {
  const [product, promotions] = await Promise.all([
    prisma.products.findFirst({
      where: { slug: args.slug, isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        ratingAverage: true,
        img: {
          select: { imageUrl: true },
          orderBy: { position: "asc" },
          take: 1,
        },
        variants: {
          where: { isActive: true, deletedAt: null },
          select: {
            id: true, // ← quan trọng: cần id để FE gọi cart API
            price: true,
            quantity: true,
            variantAttributes: {
              select: {
                attributeOption: {
                  select: {
                    label: true,
                    attribute: { select: { code: true, name: true } },
                  },
                },
              },
            },
          },
          orderBy: { price: "asc" },
        },
        productSpecifications: {
          select: {
            value: true,
            specification: { select: { name: true, key: true, group: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    getActivePromotionsCache(),
  ]);

  if (!product) return null;

  const prices = product.variants.map((v) => Number(v.price));
  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 0;

  const { finalPriceMin, finalPriceMax, promotionLabel } = applyPromotion(
    priceMin,
    priceMax,
    product.id,
    promotions,
  );

  const applyPromoPrice = (originalPrice: number): number => {
    const promo = promotions.find((p) =>
      p.targets.some(
        (t) => t.targetType === "ALL" || (t.targetType === "PRODUCT" && t.targetId === product.id),
      ),
    );
    if (!promo?.rules?.[0]) return originalPrice;
    const rule = promo.rules[0];
    if (rule.actionType === "DISCOUNT_PERCENT" && rule.discountValue) {
      return Math.round(originalPrice * (1 - Number(rule.discountValue) / 100));
    }
    if (rule.actionType === "DISCOUNT_FIXED" && rule.discountValue) {
      return Math.max(0, originalPrice - Number(rule.discountValue));
    }
    return originalPrice;
  };

  const specGroups: Record<string, { name: string; value: string }[]> = {};
  for (const ps of product.productSpecifications) {
    const group = ps.specification.group || "Thông số khác";
    if (!specGroups[group]) specGroups[group] = [];
    specGroups[group].push({ name: ps.specification.name, value: ps.value });
  }

  const variants = product.variants.map((v) => {
    const attrLabels = v.variantAttributes
      .map((va) => va.attributeOption.label)
      .join(" / ");
    return {
      id: v.id, // ← expose ra để extractProductCards dùng
      label: attrLabels || "Mặc định",
      originalPrice: Number(v.price),
      price: applyPromoPrice(Number(v.price)),
      inStock: v.quantity > 0,
    };
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    thumbnail: product.img[0]?.imageUrl || "",
    productUrl: `${PRODUCT_BASE_URL}/${product.slug}`,
    description: product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) || undefined,
    brand: product.brand.name,
    category: product.category.name,
    originalPriceMin: priceMin,
    originalPriceMax: priceMax,
    priceMin: finalPriceMin,
    priceMax: finalPriceMax,
    inStock: product.variants.some((v) => v.quantity > 0),
    rating: Number(product.ratingAverage),
    promotionLabel,
    specifications: Object.entries(specGroups).map(([group, items]) => ({ group, items })),
    variants,
  };
};

// ─── 3. GET ACTIVE PROMOTIONS ───────────────────────────────
export const executeGetActivePromotions = async (
  args: GetPromotionsArgs,
): Promise<PromotionResult[]> => {
  const now = new Date();
  const limit = Math.min(args.limit || 5, 10);

  const promotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    select: {
      name: true,
      description: true,
      endDate: true,
      rules: {
        select: { actionType: true, discountValue: true, buyQuantity: true, getQuantity: true },
        take: 1,
      },
    },
    orderBy: { priority: "desc" },
    take: limit,
  });

  return promotions.map((p) => {
    const rule = p.rules[0];
    let discountSummary = "Xem chi tiết";

    if (rule) {
      if (rule.actionType === "DISCOUNT_PERCENT" && rule.discountValue)
        discountSummary = `Giảm ${rule.discountValue}%`;
      else if (rule.actionType === "DISCOUNT_FIXED" && rule.discountValue)
        discountSummary = `Giảm ${Number(rule.discountValue).toLocaleString("vi-VN")}đ`;
      else if (rule.actionType === "FREE_SHIPPING")
        discountSummary = "Miễn phí vận chuyển";
      else if (rule.actionType === "GIFT_PRODUCT")
        discountSummary = "Tặng quà kèm";
      else if (rule.actionType === "BUY_X_GET_Y" && rule.buyQuantity && rule.getQuantity)
        discountSummary = `Mua ${rule.buyQuantity} tặng ${rule.getQuantity}`;
    }

    return {
      name: p.name,
      description: p.description || undefined,
      discountSummary,
      endDate: p.endDate ? p.endDate.toLocaleDateString("vi-VN") : undefined,
    };
  });
};

// ─── 4. GET POLICY ──────────────────────────────────────────
export const executeGetPolicy = async (
  args: GetPolicyArgs,
): Promise<PolicyResult | null> => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "POLICY",
      policyType: args.policyType as any,
      isPublished: true,
      deletedAt: null,
    },
    select: { title: true, content: true },
  });

  if (!page) return null;

  const plainContent = page.content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim()
    .slice(0, 10000);

  // Programmatically extract the Lưu ý and Footnotes at the bottom
  const luuYMatch = plainContent.match(/(Lưu ý:[\s\S]+)$/i);
  const exactNotes = luuYMatch ? luuYMatch[1].trim() : "";

  console.log("=== POLICY PLAIN CONTENT ===");
  console.log(plainContent);
  console.log("============================");

  return { title: page.title, content: plainContent, exactNotes };
};

// ─── 5. EXTRACT PRODUCT CARDS ───────────────────────────────
// Chuyển tool result JSON → ProductCard[] để đính vào ChatResponse
// Đặt ở đây vì executor đã biết shape của ProductSearchResult & ProductDetailResult
export const extractProductCards = (
  toolName: string,
  rawContent: string,
): ProductCard[] => {
  let parsed: any;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return [];
  }

  if (!parsed?.found) return [];

  // ── search_products: mảng nhiều sản phẩm ──────────────────
  if (toolName === "search_products") {
    const items: ProductSearchResult[] = parsed.data ?? [];
    return items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      productUrl: p.productUrl,
      thumbnail: p.thumbnail,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      originalPriceMin: p.originalPriceMin,
      originalPriceMax: p.originalPriceMax,
      inStock: p.inStock,
      promotionLabel: p.promotionLabel,
      defaultVariantId: p.defaultVariantId,
      variants: p.variants,
    }));
  }

  // ── get_product_detail: 1 sản phẩm, có đủ variants ────────
  if (toolName === "get_product_detail") {
    const p: ProductDetailResult = parsed.data;
    if (!p) return [];

    // Tìm variant còn hàng rẻ nhất (đã sort by price asc từ DB)
    const firstInStockVariant = p.variants.find((v) => v.inStock);

    return [
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        productUrl: p.productUrl,
        thumbnail: p.thumbnail,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        originalPriceMin: p.originalPriceMin,
        originalPriceMax: p.originalPriceMax,
        inStock: p.inStock,
        promotionLabel: p.promotionLabel,
       variants: p.variants
          .filter((v) => v.inStock) // Chỉ lấy các bản còn hàng
          .map((v) => ({ id: v.id, label: v.label })),
      },
    ];
  }

  return [];
};