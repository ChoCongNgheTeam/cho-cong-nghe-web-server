/**
 * search.helpers.ts
 *
 * Utilities cho module search:
 *  - normalize tiếng Việt (bỏ dấu, chuẩn hóa space/hyphen)
 *  - build keyword variants để tăng recall
 *  - fetch category & brand IDs + detect intent chính xác
 */

import { PrismaClient } from "@prisma/client";

// ── Bảng map dấu tiếng Việt → Latin ──────────────────────────────────────────

const VIETNAMESE_MAP: Record<string, string> = {
  à: "a",
  á: "a",
  â: "a",
  ã: "a",
  ả: "a",
  ạ: "a",
  ă: "a",
  ằ: "a",
  ắ: "a",
  ẵ: "a",
  ẩ: "a",
  ặ: "a",
  ẫ: "a",
  ẳ: "a",
  è: "e",
  é: "e",
  ê: "e",
  ẽ: "e",
  ẻ: "e",
  ẹ: "e",
  ề: "e",
  ế: "e",
  ễ: "e",
  ể: "e",
  ệ: "e",
  ì: "i",
  í: "i",
  ĩ: "i",
  ỉ: "i",
  ị: "i",
  ò: "o",
  ó: "o",
  ô: "o",
  õ: "o",
  ỏ: "o",
  ọ: "o",
  ồ: "o",
  ố: "o",
  ỗ: "o",
  ổ: "o",
  ộ: "o",
  ơ: "o",
  ờ: "o",
  ớ: "o",
  ỡ: "o",
  ở: "o",
  ợ: "o",
  ù: "u",
  ú: "u",
  û: "u",
  ũ: "u",
  ủ: "u",
  ụ: "u",
  ư: "u",
  ừ: "u",
  ứ: "u",
  ữ: "u",
  ử: "u",
  ự: "u",
  ỳ: "y",
  ý: "y",
  ỹ: "y",
  ỷ: "y",
  ỵ: "y",
  đ: "d",
  À: "a",
  Á: "a",
  Â: "a",
  Ã: "a",
  Ả: "a",
  Ạ: "a",
  Ă: "a",
  Ằ: "a",
  Ắ: "a",
  Ẵ: "a",
  Ẩ: "a",
  Ặ: "a",
  Ẫ: "a",
  Ẳ: "a",
  È: "e",
  É: "e",
  Ê: "e",
  Ẽ: "e",
  Ẻ: "e",
  Ẹ: "e",
  Ề: "e",
  Ế: "e",
  Ễ: "e",
  Ể: "e",
  Ệ: "e",
  Ì: "i",
  Í: "i",
  Ĩ: "i",
  Ỉ: "i",
  Ị: "i",
  Ò: "o",
  Ó: "o",
  Ô: "o",
  Õ: "o",
  Ỏ: "o",
  Ọ: "o",
  Ồ: "o",
  Ố: "o",
  Ỗ: "o",
  Ổ: "o",
  Ộ: "o",
  Ơ: "o",
  Ờ: "o",
  Ớ: "o",
  Ỡ: "o",
  Ở: "o",
  Ợ: "o",
  Ù: "u",
  Ú: "u",
  Û: "u",
  Ũ: "u",
  Ủ: "u",
  Ụ: "u",
  Ư: "u",
  Ừ: "u",
  Ứ: "u",
  Ữ: "u",
  Ử: "u",
  Ự: "u",
  Ỳ: "y",
  Ý: "y",
  Ỹ: "y",
  Ỷ: "y",
  Ỵ: "y",
  Đ: "d",
};

/**
 * Bỏ dấu tiếng Việt, lowercase, normalize space/hyphen.
 * "Điện Thoại" → "dien thoai"
 * "dien-thoai" → "dien thoai"
 */
export const normalizeVietnamese = (text: string): string => {
  return text
    .split("")
    .map((ch) => VIETNAMESE_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Tạo slug từ text.
 * "Điện Thoại" → "dien-thoai"
 */
export const toSlug = (text: string): string => normalizeVietnamese(text).replace(/\s+/g, "-");

/**
 * Sinh ra nhiều biến thể keyword để tăng recall:
 *  "điện thoại" → ["điện thoại", "dien thoai", "dien-thoai"]
 *  "dien thoai" → ["dien thoai", "dien-thoai"]
 *  "ip"         → ["ip"]
 */
export const buildKeywordVariants = (q: string): string[] => {
  const raw = q.trim();
  const normalized = normalizeVietnamese(raw);
  const slug = normalized.replace(/\s+/g, "-");
  return [...new Set([raw, normalized, slug].filter(Boolean))];
};

// ── Word-boundary intent check ────────────────────────────────────────────────

/**
 * Kiểm tra keyword có phải là "word" trong text không.
 *
 * Dùng word-boundary thay vì substring để tránh false positive:
 *   "ip" trong "iPhone 14 Series" → "ip" là PREFIX của word "iphone" → false positive
 *   "iphone" trong "Apple (iPhone)" → toàn bộ word → TRUE
 *   "samsung" trong "Samsung" → TRUE
 *   "laptop" trong "Laptop" → TRUE
 *   "dien thoai" trong "Điện Thoại" (normalized) → TRUE
 *
 * Rule: keyword match nếu:
 *   - keyword là toàn bộ một "token" trong text (split by space/paren/dash)
 *   - HOẶC text sau khi normalize bắt đầu bằng keyword + space/end
 *   - HOẶC keyword = normalized text hoàn toàn
 *
 * Minimum length: keyword < 3 ký tự (sau normalize) sẽ không được coi là intent
 * dù có match, vì quá ngắn để xác định intent ("ip", "hp" gây false positive).
 * Ngoại lệ: keyword chính xác bằng tên brand/category (vd brand slug "hp" = "hp" exact).
 */
const isWordIntent = (keyword: string, candidateName: string): boolean => {
  const kNorm = normalizeVietnamese(keyword);
  const cNorm = normalizeVietnamese(candidateName);

  // Exact match → luôn là intent
  if (cNorm === kNorm) return true;

  // Keyword quá ngắn (< 3 ký tự) → chỉ accept nếu exact match ở trên
  // "ip" (2 chars) không thể là intent của "iPhone Series" dù contains
  if (kNorm.length < 3) return false;

  // Word-boundary check: keyword phải là một "word" đầy đủ trong candidate name
  // Split theo space, dấu ngoặc, gạch ngang
  const words = cNorm.split(/[\s()\[\],\/\\-]+/).filter(Boolean);

  // Keyword match toàn bộ một word → TRUE
  if (words.includes(kNorm)) return true;

  // Keyword là prefix của toàn bộ chuỗi (user đang gõ dở tên brand/category)
  // Minimum 3 ký tự + phải cover ít nhất 50% độ dài candidate word ngắn nhất
  // VD: "sam" → "samsung" → prefix, 3/7 = 43% < 50% → FALSE (quá ngắn)
  //     "sams" → "samsung" → 4/7 = 57% → TRUE
  //     "lapt" → "laptop"  → 4/6 = 67% → TRUE
  //     "dien" → "dien thoai" → first word match prefix → TRUE
  const firstWord = words[0];
  if (firstWord && kNorm.length >= 4 && firstWord.startsWith(kNorm)) {
    const coverage = kNorm.length / firstWord.length;
    return coverage >= 0.5;
  }

  // Multi-word keyword: "dien thoai" → check nếu cNorm starts với kNorm
  if (kNorm.includes(" ") && cNorm.startsWith(kNorm)) return true;

  return false;
};

// ── SearchIntent ──────────────────────────────────────────────────────────────

export interface SearchIntent {
  categoryIds: string[];
  brandIds: string[];
  /**
   * true = keyword thực sự match TÊN category/brand theo word-boundary
   * false = chỉ match slug substring hoặc keyword quá ngắn
   */
  hasStrongIntent: boolean;
}

export const buildSearchCategoryAndBrandIdsV2 = async (q: string, prismaClient: PrismaClient): Promise<SearchIntent> => {
  const variants = buildKeywordVariants(q);

  // ── Condition sets ──────────────────────────────────────────────────────────

  // Name-only conditions để fetch candidates (rộng, dùng contains)
  const nameOnlyConditions = variants.map((v) => ({
    name: { contains: v, mode: "insensitive" as const },
  }));

  // Name + slug conditions để mở rộng categoryIds cho scopeWhere
  const nameOrSlugConditions = variants.flatMap((v) => [{ name: { contains: v, mode: "insensitive" as const } }, { slug: { contains: v, mode: "insensitive" as const } }]);

  // ── Query song song ─────────────────────────────────────────────────────────
  const [
    nameMatchedCats, // candidates cho intent check
    allMatchedCats, // candidates cho expand scope
    nameMatchedBrands, // candidates cho intent check
    allMatchedBrands, // candidates cho expand scope
  ] = await Promise.all([
    prismaClient.categories.findMany({
      where: { deletedAt: null, OR: nameOnlyConditions },
      select: { id: true, name: true }, // cần name để word-boundary check
    }),
    prismaClient.categories.findMany({
      where: { deletedAt: null, OR: nameOrSlugConditions },
      select: { id: true },
    }),
    prismaClient.brands.findMany({
      where: { deletedAt: null, OR: nameOnlyConditions },
      select: { id: true, name: true },
    }),
    prismaClient.brands.findMany({
      where: { deletedAt: null, OR: nameOrSlugConditions },
      select: { id: true },
    }),
  ]);

  // ── Expand descendants cho allMatchedCats ───────────────────────────────────
  const categoryIds: string[] = [];
  for (const cat of allMatchedCats) {
    const rows: { id: string }[] = await prismaClient.$queryRaw`
      WITH RECURSIVE descendants AS (
        SELECT id FROM categories WHERE id = ${cat.id}::uuid AND "deletedAt" IS NULL
        UNION ALL
        SELECT c.id FROM categories c
        JOIN descendants d ON c."parentId" = d.id
        WHERE c."deletedAt" IS NULL
      )
      SELECT id FROM descendants
    `;
    rows.forEach((r) => categoryIds.push(r.id));
  }

  // ── Word-boundary intent check ──────────────────────────────────────────────
  // Dùng isWordIntent thay vì chỉ check .length > 0
  // "ip" → nameMatchedCats = ["iPhone 14 Series", "Apple (iPhone)"...]
  //       → isWordIntent("ip", "iPhone 14 Series") → false (quá ngắn, < 3 chars)
  //       → isWordIntent("ip", "Apple (iPhone)") → false
  //       → hasStrongIntent = false ✓
  //
  // "iphone" → isWordIntent("iphone", "Apple (iPhone)") → "iphone" in words ["apple","iphone"] → TRUE ✓
  // "samsung" → isWordIntent("samsung", "Samsung") → exact → TRUE ✓
  // "laptop"  → isWordIntent("laptop", "Laptop") → exact → TRUE ✓
  // "dien thoai" → multi-word, cNorm "dien thoai" startsWith "dien thoai" → TRUE ✓
  // "sam"  (3 chars) → isWordIntent("sam", "Samsung") → length=3 < 4 for prefix → FALSE ✓
  // "sams" (4 chars) → isWordIntent("sams", "Samsung") → 4/7=57% ≥ 50% → TRUE ✓

  const hasCatIntent = nameMatchedCats.some((cat: any) => variants.some((v) => isWordIntent(v, cat.name)));
  const hasBrandIntent = nameMatchedBrands.some((brand: any) => variants.some((v) => isWordIntent(v, brand.name)));

  const hasStrongIntent = hasCatIntent || hasBrandIntent;

  console.log("[search] word-boundary intent check:", {
    q,
    variants,
    nameMatchedCats: nameMatchedCats.map((c: any) => c.name),
    nameMatchedBrands: nameMatchedBrands.map((b: any) => b.name),
    hasCatIntent,
    hasBrandIntent,
    hasStrongIntent,
  });

  return {
    categoryIds: [...new Set(categoryIds)],
    brandIds: allMatchedBrands.map((b: any) => b.id),
    hasStrongIntent,
  };
};
