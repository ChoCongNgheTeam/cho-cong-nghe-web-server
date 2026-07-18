// Cache tags dùng chung giữa BE và FE (Next.js `revalidateTag`).
// Giá trị string phải khớp CHÍNH XÁC với tag FE dùng trong `next: { tags: [...] }`
// (xem HOME_CACHE_TAGS ở FE `home.api.ts`). Chỉ sửa ở đây khi cần đổi tên tag.

export const CACHE_TAGS = {
  HOME_STATIC: "home-static", // banners + categories + campaigns + blogs
  HOME_PRODUCTS: "home-products", // featured + best selling
  SALE_SCHEDULE: "sale-schedule", // sale schedule + today products
  HOME_CATEGORY_PRODUCTS: "home-category-products", // best selling theo từng category (tabs)
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
