// ============================================================
// Limits
// ============================================================

export const HOME_SALE_SCHEDULE_DAYS = 3;
export const HOME_TODAY_SALE_PRODUCT_LIMIT = 12;
export const HOME_FEATURED_CATEGORY_LIMIT = 24;
export const HOME_FEATURED_PRODUCT_LIMIT = 12;
export const HOME_BEST_SELLING_PRODUCT_LIMIT = 12;
export const HOME_SALE_BY_DATE_DEFAULT_LIMIT = 20;

export const HOME_BLOG_CONFIG = {
  page: 1,
  limit: 7,
  sortBy: "publishedAt",
  sortOrder: "desc",
  includeDeleted: false,
} as const;

// ============================================================
// Timezone
// ============================================================

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

// ============================================================
// Cache tags — đồng bộ với FE
// Đặt ở đây để khi cần revalidate (sau này) chỉ sửa 1 chỗ.
// ============================================================

export const CACHE_TAGS = {
  HOME_STATIC: "home-static", // banners + categories + campaigns + blogs
  HOME_PRODUCTS: "home-products", // featured + best selling
  SALE_SCHEDULE: "sale-schedule", // sale schedule + today products
} as const;
