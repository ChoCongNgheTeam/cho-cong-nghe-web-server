export interface BlogSeedData {
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  authorEmail: string; // dùng email để tìm authorId sau
}

export const blogSeeds: BlogSeedData[] = [
  {
    title: "Hướng dẫn chọn mua iPhone cũ đáng tin cậy năm 2025",
    slug: "huong-dan-chon-mua-iphone-cu-dang-tin-cay-2025",
    content: `
# Hướng dẫn chọn mua iPhone cũ đáng tin cậy năm 2025

Trong bối cảnh iPhone mới ngày càng đắt đỏ, việc mua iPhone cũ (refurbished hoặc second-hand) đang trở thành lựa chọn phổ biến. Bài viết này sẽ giúp bạn tránh "tiền mất tật mang" khi mua máy cũ.

### 1. Ưu tiên các dòng máy còn hỗ trợ cập nhật iOS
- iPhone 13 series và mới hơn: còn hỗ trợ ít nhất 4–5 năm nữa
- iPhone 12 series: vẫn ổn đến khoảng 2027–2028
- Tránh iPhone 11 trở về trước nếu bạn muốn dùng lâu dài

### 2. Kiểm tra tình trạng máy thật kỹ
- **Pin health**: Nên ≥ 85% (tốt nhất ≥ 90%)
- **Face ID / Touch ID**: hoạt động bình thường
- **Camera**: chụp thử cả trước + sau, kiểm tra vết xước lens
- **Màn hình**: không ám vàng, không điểm chết, True Tone hoạt động
- **Khung viền & mặt lưng**: không cong vênh, không thay vỏ kém chất lượng

### 3. Nguồn gốc và bảo hành
- Ưu tiên mua từ cửa hàng uy tín có bảo hành 6–12 tháng
- Kiểm tra IMEI trên website Apple để xem còn bảo hành chính hãng không
- Tránh máy lock, máy dựng, hoặc máy từ nước ngoài không rõ nguồn gốc

### 4. Giá tham khảo (tháng 1/2025)
- iPhone 13 128GB pin 88–92%: ~9.5–11 triệu
- iPhone 14 128GB pin 90%+: ~12–14 triệu
- iPhone 15 128GB pin 90%+: ~16–18 triệu

Chúc bạn tìm được chiếc iPhone ưng ý với mức giá hợp lý!

(Nguồn: kinh nghiệm thực tế từ cộng đồng và các cửa hàng uy tín tại Việt Nam)
    `.trim(),
    thumbnail: "blogs/iphone-cu-2025.jpg",
    status: "PUBLISHED",
    publishedAt: new Date("2025-01-15"),
    authorEmail: "admin@example.com", // thay bằng email admin thật của bạn
  },

  {
    title: "So sánh nhanh Galaxy S25 Ultra vs iPhone 16 Pro Max",
    slug: "so-sanh-galaxy-s25-ultra-vs-iphone-16-pro-max",
    content: `
# So sánh nhanh Galaxy S25 Ultra vs iPhone 16 Pro Max

Cuộc chiến flagship 2025 đang rất nóng. Dưới đây là bảng so sánh ngắn gọn giữa hai "quái vật" Android và iOS.

### Thiết kế & Màn hình
- **S25 Ultra**: Titanium frame, Gorilla Glass Armor 2, màn hình 6.9" Dynamic AMOLED 2X, 120Hz LTPO, viền siêu mỏng
- **iPhone 16 Pro Max**: Titanium grade 5, Ceramic Shield, màn hình 6.9" Super Retina XDR, 120Hz ProMotion

→ S25 Ultra thắng về chống xước & viền mỏng hơn.

### Camera
- **S25 Ultra**: Chính 200MP + Ultra-wide 50MP + 3x & 5x telephoto 50MP, zoom quang 5x, zoom số 100x
- **iPhone 16 Pro Max**: Chính 48MP Fusion + Ultra-wide 48MP + 5x telephoto 12MP, quay video ProRes 4K 120fps

→ S25 Ultra vượt trội về zoom, iPhone thắng về quay video chuyên nghiệp.

### Hiệu năng & Pin
- **S25 Ultra**: Snapdragon 8 Elite for Galaxy, pin 5000mAh, sạc 45W
- **iPhone 16 Pro Max**: A18 Pro, pin ~4685mAh, sạc 25W có dây + 15W MagSafe

→ S25 Ultra pin lớn hơn, sạc nhanh hơn. iPhone tối ưu năng lượng tốt hơn.

### Phần mềm & Hỗ trợ
- **S25 Ultra**: One UI 7 (Android 15) + 7 năm cập nhật
- **iPhone 16 Pro Max**: iOS 18 + thường 6–7 năm cập nhật

### Kết luận
- Chọn S25 Ultra nếu bạn thích zoom cực mạnh, sạc nhanh, màn hình sáng & chống xước tốt.
- Chọn iPhone 16 Pro Max nếu bạn cần hệ sinh thái Apple, quay video chuyên nghiệp, và sự ổn định lâu dài.

Bạn sẽ chọn bên nào?
    `.trim(),
    thumbnail: "blogs/s25-vs-iphone16.jpg",
    status: "PUBLISHED",
    publishedAt: new Date("2025-02-10"),
    authorEmail: "customer2@example.com",
  },
];
