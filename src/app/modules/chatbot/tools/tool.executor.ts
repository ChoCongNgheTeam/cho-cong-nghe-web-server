import prisma from "@/config/db";
import { buildProductWhere } from "@/app/modules/product/product_filter.where-builder";
import {
  SearchProductsArgs,
  GetProductDetailArgs,
  GetPolicyArgs,
  GetPromotionsArgs,
  ProductSearchResult,
  ProductDetailResult,
  PolicyResult,
  PromotionResult,
} from "../chatbot.types";

// ============================================================
// TOOL EXECUTORS
// Mỗi function là 1 tool — AI gọi, backend thực thi, trả data
// AI KHÔNG query DB trực tiếp
// ============================================================

// ─── 1. SEARCH PRODUCTS ─────────────────────────────────────
export const executeSearchProducts = async (args: SearchProductsArgs): Promise<ProductSearchResult[]> => {
  const {
    keyword,
    categorySlug,
    brandSlug,
    minPrice,
    maxPrice,
    storage,
    color,
    specsFilter,
    attrsFilter,
    limit = 5,
  } = args;

  const now = new Date();

  // ── Build dynamic query object cho buildProductWhere ──────
  // Tái sử dụng toàn bộ filter logic đã có trong product module
  // thay vì duplicate code
  const dynamicQuery: Record<string, any> = {
    search: keyword,
  };

  if (categorySlug) dynamicQuery.category = categorySlug;
  if (minPrice) dynamicQuery.minPrice = minPrice;
  if (maxPrice) dynamicQuery.maxPrice = maxPrice;
  if (storage) dynamicQuery[`attr_storage`] = storage;
  if (color) dynamicQuery[`attr_color`] = color;

  // Brand: resolve slug → id
  if (brandSlug) {
    const brand = await prisma.brands.findUnique({
      where: { slug: brandSlug, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (brand) dynamicQuery.brandId = brand.id;
  }

  // specsFilter: { "spec_ram": "16 GB", "ram": "16 GB", "spec_nfc": "true" }
  // Key đã có prefix "spec_" → spread thẳng
  // Key không có prefix → thêm prefix "spec_"
  if (specsFilter) {
    for (const [key, value] of Object.entries(specsFilter)) {
      if (key.startsWith("spec_")) {
        dynamicQuery[key] = value;
      } else {
        dynamicQuery[`spec_${key}`] = value;
      }
    }
  }

  // attrsFilter: { "storage": "256GB", "ram": ["8GB", "16GB"] }
  // → thêm prefix "attr_"
  if (attrsFilter) {
    for (const [key, value] of Object.entries(attrsFilter)) {
      dynamicQuery[`attr_${key}`] = value;
    }
  }

  // ── Dùng buildProductWhere để build Prisma where clause ───
  const where = await buildProductWhere(dynamicQuery, true);

  // ── Query sản phẩm ────────────────────────────────────────
  const products = await prisma.products.findMany({
    where,
    take: Math.min(limit, 10),
    orderBy: [{ totalSoldCount: "desc" }, { ratingAverage: "desc" }],
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
        select: { price: true, quantity: true },
        orderBy: { price: "asc" },
      },
      productSpecifications: {
        // Bỏ take: 3 → lấy tất cả highlight specs
        // AI cần đọc đủ specs để đánh giá (GPU, RAM, camera, pin...)
        where: { isHighlight: true },
        select: {
          value: true,
          specification: {
            select: {
              name: true,
              key: true, // AI dùng key để hiểu loại spec
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // ── Lấy promotions active để gắn label ───────────────────
  const activePromotions = await prisma.promotions.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    include: { rules: true, targets: true },
    orderBy: { priority: "desc" },
    take: 20,
  });

  return products.map((p) => {
    const prices = p.variants.map((v) => Number(v.price));
    const priceMin = prices.length ? Math.min(...prices) : 0;
    const priceMax = prices.length ? Math.max(...prices) : 0;
    const inStock = p.variants.some((v) => v.quantity > 0);

    // Tìm promotion áp dụng cho sản phẩm này
    const applicablePromo = activePromotions.find((promo) =>
      promo.targets.some(
        (t) =>
          t.targetType === "ALL" ||
          (t.targetType === "PRODUCT" && t.targetId === p.id),
      ),
    );

    let promotionLabel: string | undefined;
    if (applicablePromo?.rules?.[0]) {
      const rule = applicablePromo.rules[0];
      if (rule.actionType === "DISCOUNT_PERCENT" && rule.discountValue) {
        promotionLabel = `Giảm ${rule.discountValue}%`;
      } else if (rule.actionType === "DISCOUNT_FIXED" && rule.discountValue) {
        promotionLabel = `Giảm ${Number(rule.discountValue).toLocaleString("vi-VN")}đ`;
      } else if (rule.actionType === "GIFT_PRODUCT") {
        promotionLabel = "Tặng quà";
      } else if (rule.actionType === "BUY_X_GET_Y") {
        promotionLabel = `Mua ${rule.buyQuantity} tặng ${rule.getQuantity}`;
      }
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      thumbnail: p.img[0]?.imageUrl || "",
      priceMin,
      priceMax,
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
    };
  });
};

// ─── 2. GET PRODUCT DETAIL ──────────────────────────────────
export const executeGetProductDetail = async (
  args: GetProductDetailArgs,
): Promise<ProductDetailResult | null> => {
  const product = await prisma.products.findFirst({
    where: { slug: args.slug, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      ratingAverage: true,
      img: { select: { imageUrl: true }, take: 1 },
      variants: {
        where: { isActive: true, deletedAt: null },
        select: {
          id: true,
          price: true,
          quantity: true,
          variantAttributes: {
            select: {
              attributeOption: {
                select: {
                  value: true,
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
          specification: {
            select: {
              name: true,
              key: true,
              group: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) return null;

  const prices = product.variants.map((v) => Number(v.price));
  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 0;

  // Group specs by group name
  const specGroups: Record<string, { name: string; value: string }[]> = {};
  for (const ps of product.productSpecifications) {
    const group = ps.specification.group || "Thông số khác";
    if (!specGroups[group]) specGroups[group] = [];
    specGroups[group].push({ name: ps.specification.name, value: ps.value });
  }

  // Format variants thành label đọc được
  const variants = product.variants.map((v) => {
    const attrLabels = v.variantAttributes
      .map((va) => va.attributeOption.label)
      .join(" / ");
    return {
      label: attrLabels || "Mặc định",
      price: Number(v.price),
      inStock: v.quantity > 0,
    };
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || undefined,
    brand: product.brand.name,
    category: product.category.name,
    priceMin,
    priceMax,
    inStock: product.variants.some((v) => v.quantity > 0),
    rating: Number(product.ratingAverage),
    specifications: Object.entries(specGroups).map(([group, items]) => ({
      group,
      items,
    })),
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
    include: {
      rules: { take: 1 },
      targets: { take: 3 },
    },
    orderBy: { priority: "desc" },
    take: limit,
  });

  return promotions.map((p) => {
    const rule = p.rules[0];
    let discountSummary = "Xem chi tiết";

    if (rule) {
      if (rule.actionType === "DISCOUNT_PERCENT" && rule.discountValue) {
        discountSummary = `Giảm ${rule.discountValue}%`;
      } else if (rule.actionType === "DISCOUNT_FIXED" && rule.discountValue) {
        discountSummary = `Giảm ${Number(rule.discountValue).toLocaleString("vi-VN")}đ`;
      } else if (rule.actionType === "FREE_SHIPPING") {
        discountSummary = "Miễn phí vận chuyển";
      } else if (rule.actionType === "GIFT_PRODUCT") {
        discountSummary = "Tặng quà kèm";
      } else if (rule.actionType === "BUY_X_GET_Y" && rule.buyQuantity && rule.getQuantity) {
        discountSummary = `Mua ${rule.buyQuantity} tặng ${rule.getQuantity}`;
      }
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
    select: {
      title: true,
      content: true,
    },
  });

  if (!page) return null;

  // Strip HTML tags để AI đọc được, giữ lại text
  const plainContent = page.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);

  return {
    title: page.title,
    content: plainContent,
  };
};