/**
 * search.helpers.ts
 *
 * Utility THUẦN cho module search — không import Prisma/DB.
 *  - normalize tiếng Việt (bỏ dấu, chuẩn hóa space/hyphen)
 *  - build keyword variants để tăng recall
 *  - word-boundary intent check (dùng bởi search.service.ts để phân loại strong/weak intent)
 */

// BẢNG MAP DẤU TIẾNG VIỆT → LATIN

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

// WORD-BOUNDARY INTENT CHECK

/**
 * Kiểm tra keyword có phải là "word" trong text không.
 *
 * Dùng word-boundary thay vì substring để tránh false positive:
 *   "ip" trong "iPhone 14 Series" → "ip" là PREFIX của word "iphone" → false positive
 *   "iphone" trong "Apple (iPhone)" → toàn bộ word → TRUE
 *   "samsung" trong "Samsung" → TRUE
 *
 * Keyword < 3 ký tự (sau normalize) không được coi là intent dù có match,
 * trừ khi match chính xác toàn bộ candidate name.
 */
export const isWordIntent = (keyword: string, candidateName: string): boolean => {
  const kNorm = normalizeVietnamese(keyword);
  const cNorm = normalizeVietnamese(candidateName);

  if (cNorm === kNorm) return true;
  if (kNorm.length < 3) return false;

  const words = cNorm.split(/[\s()\[\],\/\\-]+/).filter(Boolean);
  if (words.includes(kNorm)) return true;

  const firstWord = words[0];
  if (firstWord && kNorm.length >= 4 && firstWord.startsWith(kNorm)) {
    const coverage = kNorm.length / firstWord.length;
    return coverage >= 0.5;
  }

  if (kNorm.includes(" ") && cNorm.startsWith(kNorm)) return true;

  return false;
};
