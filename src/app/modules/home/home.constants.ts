// ============================================================
// Limits
// ============================================================

export const HOME_SALE_SCHEDULE_DAYS = 3;
export const HOME_TODAY_SALE_PRODUCT_LIMIT = 12;
export const HOME_FEATURED_CATEGORY_LIMIT = 24;
export const HOME_FEATURED_PRODUCT_LIMIT = 12;
export const HOME_BEST_SELLING_PRODUCT_LIMIT = 12;
export const HOME_SALE_BY_DATE_DEFAULT_LIMIT = 20;
export const HOME_CATEGORY_PRODUCT_LIMIT = 8;

// Slug của các root category hiển thị dạng tab ở section "Sản phẩm theo loại".
// Đổi thứ tự ở đây sẽ đổi thứ tự tab trên FE.
export const HOME_CATEGORY_PRODUCT_TABS = ["dien-thoai", "laptop", "dien-may", "phu-kien"] as const;

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
// Cache tags — re-export từ shared, vì promotion/product/campaign/
// category/media cũng cần dùng chung tag này để gọi revalidateTags().
// home module không còn là nơi định nghĩa gốc.
// ============================================================

export { CACHE_TAGS } from "@/shared/cache/cache-tags.constants";
