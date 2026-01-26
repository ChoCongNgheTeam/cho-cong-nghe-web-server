export interface CommentSeedData {
  content: string;
  targetType: "BLOG" | "PRODUCT" | "PAGE";
  targetSlug: string; // slug của blog/product/page để tìm targetId
  parentContent?: string; // nếu là reply → dùng content của parent để match (tạm thời, vì không có id trước)
  isApproved?: boolean;
  userEmail: string; // dùng email để tìm userId
}

export const commentSeeds: CommentSeedData[] = [
  // Comment cấp 1 cho bài blog đầu tiên
  {
    content:
      "Bài viết rất chi tiết và hữu ích! Mình đang định mua iPhone 13 cũ, nhờ bài này mà biết nên check những gì rồi. Cảm ơn admin nhé!",
    targetType: "BLOG",
    targetSlug: "so-sanh-galaxy-s25-ultra-vs-iphone-16-pro-max",
    isApproved: true,
    userEmail: "customer2@example.com",
  },
  {
    content:
      "Mình mua iPhone 12 cũ hồi đầu năm nay, pin còn 87% mà dùng vẫn ổn. Nhưng đúng là nên ưu tiên máy từ iPhone 13 trở lên để còn update iOS lâu dài.",
    targetType: "BLOG",
    targetSlug: "so-sanh-galaxy-s25-ultra-vs-iphone-16-pro-max",
    isApproved: true,
    userEmail: "customer2@example.com",
  },

  // Reply cho comment đầu tiên
  {
    content:
      "@user1 Cảm ơn bạn đã đọc bài! Nếu mua thì nhớ check kỹ Face ID và nguồn gốc máy nhé, tránh mua phải hàng dựng rất khó phát hiện.",
    targetType: "BLOG",
    targetSlug: "so-sanh-galaxy-s25-ultra-vs-iphone-16-pro-max",
    parentContent:
      "Bài viết rất chi tiết và hữu ích! Mình đang định mua iPhone 13 cũ, nhờ bài này mà biết nên check những gì rồi. Cảm ơn admin nhé!",
    isApproved: true,
    userEmail: "admin@example.com",
  },

  // Comment cấp 1 cho bài blog thứ hai
  {
    content:
      "So sánh công bằng đấy! Mình thích camera zoom của S25 Ultra hơn, nhưng quay video thì iPhone vẫn ăn đứt. Chắc cuối năm mình sẽ đổi sang S25 Ultra.",
    targetType: "BLOG",
    targetSlug: "huong-dan-chon-mua-iphone-cu-dang-tin-cay-2025",
    isApproved: true,
    userEmail: "customer2@example.com",
  },
  {
    content:
      "Pin S25 Ultra lớn hơn thật nhưng thực tế dùng thì iPhone 16 Pro Max vẫn trụ được 1.5 ngày dễ dàng. Tùy nhu cầu thôi mọi người ạ.",
    targetType: "BLOG",
    targetSlug: "huong-dan-chon-mua-iphone-cu-dang-tin-cay-2025",
    isApproved: false, // ví dụ comment chờ duyệt
    userEmail: "customer1@example.com",
  },

  // Comment mẫu cho PRODUCT (nếu sau này bạn seed product)
  {
    content:
      "Sản phẩm chất lượng tốt, giao hàng nhanh. Mình mua iPhone 14 256GB đen, dùng 2 tháng vẫn mượt mà.",
    targetType: "PRODUCT",
    targetSlug: "iphone-13", // slug của product
    isApproved: true,
    userEmail: "customer1@example.com",
  },
];
