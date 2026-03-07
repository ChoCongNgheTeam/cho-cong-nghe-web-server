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

  {
    title: "Galaxy S27 Ultra có thể trang bị Polar ID: Công nghệ nhận diện khuôn mặt mới",
    slug: "galaxy-s27-ultra-trang-bi-polar-id-nhan-dien-khuon-mat-moi",
    content: `
# Galaxy S27 Ultra: Bước tiến mới với bảo mật Polar ID

Samsung được kỳ vọng sẽ tạo nên một cuộc cách mạng về bảo mật sinh trắc học trên thế hệ flagship tiếp theo - Galaxy S27 Ultra - thông qua công nghệ Polar ID.

### 1. Polar ID là gì?
Khác với FaceID truyền thống, Polar ID sử dụng cảm biến phân cực để quét các chi tiết sâu hơn dưới bề mặt da và cấu trúc gương mặt. Điều này giúp ngăn chặn hoàn toàn việc sử dụng ảnh 2D hoặc mặt nạ 3D để đánh lừa hệ thống.

### 2. Ưu điểm vượt trội
- **Tốc độ:** Nhận diện gần như tức thì ngay cả trong điều kiện ánh sáng cực yếu.
- **Kích thước:** Cảm biến mới nhỏ gọn hơn, giúp Samsung tối ưu hóa phần "nốt ruồi" trên màn hình trở nên siêu nhỏ.

### 3. Kỳ vọng trên Galaxy S27 Ultra
Sự kết hợp giữa Snapdragon 8 Gen 5 và Polar ID sẽ biến S27 Ultra thành chiếc điện thoại bảo mật nhất thế giới vào năm 2027.
    `.trim(),
    imagePath: "blogs/galaxy_s27_ultra_co_the_trang_bi_polar_id_nhan_dien_khuon_mat_moi.webp",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-12"),
    authorEmail: "admin@example.com",
  },

  {
    title: "Giới thiệu Oppo Reno 16: Camera AI và thiết kế mỏng nhẹ đỉnh cao",
    slug: "gioi-thieu-dien-thoai-oppo-reno-16",
    content: `
# Oppo Reno 16: Định nghĩa lại phong cách smartphone phân khúc cận cao cấp

Oppo tiếp tục khẳng định vị thế "Chuyên gia chân dung" với dòng Reno 16 mới nhất, tập trung vào thiết kế thời trang và khả năng nhiếp ảnh thông minh.

### 1. Thiết kế Glow độc bản
Mặt lưng của Reno 16 sử dụng công nghệ kính nhám mịn mới, không chỉ chống bám vân tay mà còn thay đổi màu sắc linh hoạt theo góc nhìn. Thân máy chỉ dày 7.2mm, mang lại cảm giác cầm nắm cực kỳ thoải mái.

### 2. Hệ thống Camera AI Gen 3
- **Chụp đêm:** Thuật toán AI mới giúp giảm nhiễu hạt nhưng vẫn giữ lại chi tiết da tự nhiên.
- **Video Bokeh:** Khả năng tách nền xóa phông khi quay video mượt mà như máy ảnh chuyên dụng.

Đây chắc chắn là lựa chọn hàng đầu cho các bạn trẻ yêu thích sáng tạo nội dung trên mạng xã hội.
    `.trim(),
    imagePath: "blogs/gioi-thieu-dien-thoai-oppo-reno-16.webp",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-15"),
    authorEmail: "admin@example.com",
  },

  {
    title: "Máy sấy bơm nhiệt Samsung: Giải pháp làm khô quần áo thông minh và tiết kiệm",
    slug: "may-say-bom-nhiet-samsung-tiet-kiem-dien",
    content: `
# Tại sao máy sấy bơm nhiệt (Heatpump) Samsung lại được ưa chuộng năm 2026?

Việc chăm sóc quần áo cao cấp đòi hỏi sự tỉ mỉ, và máy sấy bơm nhiệt Samsung là "trợ lý" đắc lực nhất cho mọi gia đình hiện đại.

### 1. Công nghệ Heatpump tiết kiệm 50% điện năng
Thay vì dùng điện trở nhiệt, máy sử dụng máy nén để tạo ra luồng khí nóng tuần hoàn, giúp quần áo khô nhanh ở nhiệt độ thấp, bảo vệ sợi vải không bị co rút.

### 2. Cảm biến AI Dry thông minh
Máy tự động điều chỉnh thời gian và nhiệt độ sấy dựa trên độ ẩm thực tế của quần áo, giúp bạn không còn lo lắng về việc sấy quá khô gây hỏng vải.

### 3. Kết nối SmartThings
Bạn có thể điều khiển và theo dõi chu trình sấy ngay trên điện thoại, vô cùng tiện lợi cho những người bận rộn.
    `.trim(),
    imagePath: "blogs/may_say_bom_nhiet_samsung.webp",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-18"),
    authorEmail: "admin@example.com",
  },

  {
    title: "Đánh giá chi tiết các dòng tai nghe True Wireless đáng mua nhất hiện nay",
    slug: "danh-gia-san-pham-tai-nghe-true-wireless",
    content: `
# Review tai nghe 2026: Đâu là lựa chọn hoàn hảo cho đôi tai của bạn?

Thị trường âm thanh đang bùng nổ với hàng loạt mẫu tai nghe True Wireless (TWS) tích hợp chống ồn chủ động (ANC) thế hệ mới.

### 1. Phân khúc cao cấp: Chất âm lên ngôi
Các dòng tai nghe đầu bảng hiện nay đã hỗ trợ codec lossless, mang lại trải nghiệm âm thanh không thua kém gì tai nghe có dây. Khả năng chống ồn cũng được nâng cấp để triệt tiêu được cả tiếng người nói chuyện xung quanh.

### 2. Phân khúc thể thao: Độ bền và cảm giác đeo
Các mẫu tai nghe đạt chuẩn IP68 và thiết kế wing-tip đang chiếm ưu thế, giúp người dùng thoải mái vận động mạnh mà không sợ rơi hay hỏng do mồ hôi.

### 3. Thời lượng pin
Tiêu chuẩn năm 2026 cho một chiếc tai nghe TWS tốt là ít nhất 8 giờ sử dụng liên tục và tổng cộng 30 giờ kèm hộp sạc.
    `.trim(),
    imagePath: "blogs/danh-gia-san-pham-tai-nghe.webp",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-20"),
    authorEmail: "customer2@example.com",
  },

  {
    title: "Review Red Magic: Gaming Phone mạnh nhất thế giới có gì đặc biệt?",
    slug: "review-san-pham-red-magic-gaming-phone",
    content: `
# Red Magic: Quái vật hiệu năng dành riêng cho game thủ chuyên nghiệp

Nếu bạn tìm kiếm một chiếc điện thoại để "cày" các tựa game nặng nhất, Red Magic chính là câu trả lời với những trang bị phần cứng cực khủng.

### 1. Hệ thống tản nhiệt chủ động
Điểm khác biệt lớn nhất là quạt tản nhiệt vật lý tích hợp bên trong máy với tốc độ vòng quay cực cao, giúp CPU luôn duy trì ở mức nhiệt độ ổn định ngay cả khi chơi game liên tục nhiều giờ.

### 2. Màn hình vô khuyết và tần số quét 240Hz
Red Magic mang đến trải nghiệm hình ảnh không góc chết nhờ camera ẩn dưới màn hình thế hệ mới, đi kèm tần số quét siêu cao giúp mọi thao tác vuốt chạm trở nên tức thì.

### 3. Chế độ Game Space độc quyền
Tối ưu hóa toàn bộ tài nguyên máy cho game, cho phép tùy chỉnh macro, nhạy độ cảm ứng và quản lý thông báo thông minh.
    `.trim(),
    imagePath: "blogs/review-san-pham-red-magic.webp",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-22"),
    authorEmail: "admin@example.com",
  },

  {
    title: "Tin cập nhật iPhone: Những tính năng mới sắp xuất hiện trên iOS 20",
    slug: "tin-cap-nhat-iphone-ios-20-moi-nhat",
    content: `
# iPhone và iOS 20: Sự kết hợp hoàn hảo của trí tuệ nhân tạo

Apple chuẩn bị tung ra bản cập nhật lớn nhất cho hệ điều hành iOS, tập trung sâu vào khả năng xử lý AI cục bộ trên iPhone.

### 1. Siri 2.0: Thông minh hơn bao giờ hết
Siri giờ đây có thể hiểu được các ngữ cảnh phức tạp và thực hiện nhiều bước tác vụ liên hoàn chỉ bằng một câu lệnh đơn giản.

### 2. Cá nhân hóa màn hình khóa
iOS 20 cho phép người dùng can thiệp sâu hơn vào bố cục, phông chữ và các widget động, giúp mỗi chiếc iPhone đều mang đậm cá tính riêng của chủ sở hữu.

### 3. Cải tiến bảo mật và quyền riêng tư
Apple tiếp tục dẫn đầu với tính năng mã hóa đầu cuối cho toàn bộ dữ liệu lưu chuyển trên các ứng dụng bên thứ ba thông qua hệ thống "Private Cloud Compute".
    `.trim(),
    imagePath: "blogs/tin-cap-nhat-ip.webp",
    status: "PUBLISHED",
    publishedAt: new Date("2026-02-25"),
    authorEmail: "admin@example.com",
  },
];
