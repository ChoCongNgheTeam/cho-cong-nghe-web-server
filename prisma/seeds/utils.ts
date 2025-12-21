import { slugify } from "transliteration";

/**
 * Tạo slug từ tên, đảm bảo unique bằng cách thêm số nếu cần
 * Ví dụ: "iPhone 15" → "iphone-15"
 *         "iPhone 15" (đã tồn tại) → "iphone-15-2"
 */
export async function generateUniqueSlug(
  model: any, // Prisma delegate, ví dụ: prisma.brands hoặc prisma.products
  name: string,
  field: string = "slug"
): Promise<string> {
  const baseSlug = slugify(name, { lowercase: true, separator: "-" }).replace(/[^a-z0-9-]/g, "-");

  let slug = baseSlug;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await model.findUnique({ where: { [field]: slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${++counter}`;
  }
}

/**
 * Hàm đơn giản nếu bạn không muốn check DB (chỉ dùng cho seed nhỏ)
 */
export function simpleSlug(name: string): string {
  return slugify(name, { lowercase: true, separator: "-" }).replace(/[^a-z0-9-]/g, "-");
}
