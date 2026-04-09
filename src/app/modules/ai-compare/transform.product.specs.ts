// ============================================================
// transformProductSpecs.ts
// Flatten product_specifications + specifications → specs object
//
// Dùng cùng selectProductCard fragment của product.repository.ts
// (productSpecifications đã include specification với key, name, unit, group)
// ============================================================

import { AIProductPayload, ProductCompareCard } from "./ai-compare.types";

// ─── Type khớp với select fragment trong product.repository.ts ───────────────

interface SpecificationMeta {
  key: string;
  name: string;
  group: string;
  unit: string | null;
  icon: string | null;
}

interface ProductSpecification {
  value: string;
  isHighlight: boolean;
  sortOrder: number;
  specificationId: string;
  specification: SpecificationMeta;
}

interface VariantFromDB {
  price: string | number; // Decimal từ Prisma serialize thành string
  isDefault: boolean;
  isActive: boolean;
}

// Shape khớp với kết quả Prisma query trong ai.repository.ts
export interface ProductForAI {
  id: string;
  name: string;
  slug: string;
  brand: { id: string; name: string; slug: string } | null;
  img: Array<{ imageUrl: string | null }>;
  variants: VariantFromDB[];
  productSpecifications: ProductSpecification[];
}

// ─── Helper: lấy giá từ default variant ──────────────────────────────────────

function resolvePrice(variants: VariantFromDB[]): number {
  // Ưu tiên isDefault && isActive, fallback về active đầu tiên
  const chosen =
    variants.find((v) => v.isDefault && v.isActive) ??
    variants.find((v) => v.isActive);

  if (!chosen) return 0;
  return typeof chosen.price === "string"
    ? parseFloat(chosen.price)
    : Number(chosen.price);
}

// ─── Main transform ───────────────────────────────────────────────────────────

export interface TransformedProduct {
  /** Dùng để build ProductCompareCard trả về client */
  meta: Omit<ProductCompareCard, "highlightSpecs"> & { highlightSpecs: Record<string, string> };
  /** Dùng để gửi vào AI (chỉ chứa specs, không có noise) */
  payload: AIProductPayload;
}

/**
 * transformProductSpecs
 *
 * Flatten productSpecifications thành hai object:
 *   - specs: toàn bộ thông số (gửi cho AI)
 *   - highlightSpecs: chỉ isHighlight = true (trả về client để render card)
 *
 * Kết hợp value + unit:
 *   { ram_capacity: "12 GB", screen_size: "6.8 inch" }
 */
export function transformProductSpecs(product: ProductForAI): TransformedProduct {
  const specs: Record<string, string> = {};
  const highlightSpecs: Record<string, string> = {};

  // Sort theo sortOrder để specs có thứ tự nhất quán khi gửi AI
  const sorted = [...product.productSpecifications].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  for (const ps of sorted) {
    const { key, unit } = ps.specification;
    const rawValue = ps.value?.trim();
    if (!rawValue) continue;

    const displayValue = unit ? `${rawValue} ${unit}`.trim() : rawValue;
    specs[key] = displayValue;

    if (ps.isHighlight) {
      highlightSpecs[key] = displayValue;
    }
  }

  const price = resolvePrice(product.variants);

  return {
    meta: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand?.name ?? "Không rõ",
      price,
      thumbnail: product.img[0]?.imageUrl ?? null,
      highlightSpecs,
    },
    payload: {
      name: product.name,
      brand: product.brand?.name ?? "Không rõ",
      price_vnd: price,
      specs,
    },
  };
}