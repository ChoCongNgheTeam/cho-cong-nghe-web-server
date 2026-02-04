export interface BlogSeedData {
  title: string;
  slug: string;
  content: string;
  imagePath?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: Date;
  authorEmail: string;
}

export const blogSeeds: BlogSeedData[] = [
  {
    title: "Honor Power 2 gây chú ý với viên pin cực khủng và giao diện Transparency độc đáo",
    slug: "honor-power-2-gay-chu-y-voi-pin-khung-va-giao-dien-transparency",
    content: `
# Honor Power 2: Bước đột phá về pin và thiết kế giao diện năm 2026

Honor vừa chính thức trình làng mẫu smartphone mới mang tên **Honor Power 2**, nhắm thẳng vào phân khúc người dùng cần hiệu năng pin bền bỉ nhưng vẫn yêu thích sự đột phá trong thiết kế.

### 1. Dung lượng pin "vô đối" trong phân khúc
Điểm nhấn lớn nhất chính là viên pin thế hệ mới giúp người dùng có thể sử dụng liên tục lên đến 3 ngày. Đây là nỗ lực của Honor trong việc tối ưu hóa kích thước pin mà không làm máy quá dày.

### 2. Giao diện Transparency (Trong suốt) độc đáo
Khác với các giao diện Android thông thường, Honor Power 2 giới thiệu ngôn ngữ thiết kế **Transparency**. Các widget và thông báo được hiển thị với hiệu ứng kính mờ, giúp trải nghiệm thị giác trở nên nhẹ nhàng và hiện đại hơn rất nhiều.

### 3. Hiệu năng ổn định
- **Chipset:** Tối ưu cho việc tiết kiệm điện năng.
- **Màn hình:** Tần số quét thích ứng giúp giảm tiêu thụ pin khi không cần thiết.

Đây hứa hẹn sẽ là mẫu máy làm chao đảo thị trường tầm trung trong thời gian tới.
    `.trim(),
    imagePath: "blogs/honor_power2_gay_chu_y_voi_pin_lon_va_giao_dien_transparency.jpg",
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-15"),
    authorEmail: "admin@example.com",
  },

  {
    title: "So sánh hiệu năng thực tế: RTX 2080 Super vs RTX 3080 trong năm 2026",
    slug: "so-sanh-hieu-nang-rtx-2080-super-vs-rtx-3080-nam-2026",
    content: `
# RTX 2080 Super vs RTX 3080: Có còn đáng để nâng cấp?

Dù đã ra mắt được một thời gian, nhưng cuộc chiến giữa các dòng card đồ họa cũ và mới vẫn luôn là chủ đề nóng cho những ai muốn build PC giá rẻ mà hiệu năng vẫn "chiến".

### 1. Sức mạnh thuần túy (Raw Performance)
- **RTX 3080:** Vẫn là một con quái vật ở độ phân giải 4K nhờ kiến trúc Ampere và số lượng nhân CUDA vượt trội.
- **RTX 2080 Super:** Dù đuối sức hơn ở 4K, nhưng ở độ phân giải 2K, nó vẫn cân tốt hầu hết các tựa game AAA hiện nay ở mức setting High.

### 2. Công nghệ DLSS và Ray Tracing
Cả hai đều hỗ trợ Ray Tracing, nhưng thế hệ nhân RT thứ 2 trên RTX 3080 cho khả năng xử lý ánh sáng mượt mà hơn hẳn, giảm thiểu tình trạng tụt FPS khi bật các hiệu ứng đồ họa nặng.

### 3. Giá thành và sự lựa chọn
Ở thị trường máy cũ năm 2026:
- Nếu bạn làm đồ họa chuyên nghiệp và chơi game 4K: **RTX 3080** là lựa chọn bắt buộc.
- Nếu ngân sách hạn chế và chỉ chơi game Esport hoặc 2K: **RTX 2080 Super** vẫn là một món hời về hiệu năng trên giá thành.

Kết luận: RTX 3080 vẫn nhanh hơn khoảng 30-40% so với người tiền nhiệm trong các tác vụ thực tế.
    `.trim(),
    imagePath: "blogs/RTX_2080_Super_vs_RTX_3080_2.jpg",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-10"),
    authorEmail: "customer2@example.com",
  },
];
