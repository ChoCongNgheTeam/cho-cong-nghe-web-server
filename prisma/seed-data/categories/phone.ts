export const phoneCategoryData = [
  // Root Điện thoại
  {
    name: "Điện thoại",
    description: "Khám phá thế giới smartphone đa dạng từ các thương hiệu hàng đầu thế giới.",
    imagePath: "categories/dien-thoai.webp",
  },
  // Apple (iPhone)
  {
    name: "Apple (iPhone)",
    description: "Đẳng cấp smartphone từ Apple với hiệu năng mạnh mẽ và hệ điều hành iOS mượt mà.",
    imagePath: "categories/apple-iphone.webp",
    parentName: "Điện thoại",
  },
  {
    name: "iPhone 17 Series",
    description: "Siêu phẩm iPhone mới nhất với những đột phá công nghệ dẫn đầu thị trường.",
    imagePath: "categories/iphone-17.webp",
    parentName: "Apple (iPhone)",
  },
  {
    name: "iPhone 16 Series",
    description:
      "Trải nghiệm đỉnh cao với camera cải tiến và bộ vi xử lý Apple Silicon thế hệ mới.",
    imagePath: "categories/iphone-16.webp",
    parentName: "Apple (iPhone)",
  },
  {
    name: "iPhone 15 Series",
    description: "Dòng iPhone đột phá với cổng sạc USB-C và thiết kế Dynamic Island hiện đại.",
    imagePath: "categories/iphone-15.webp",
    parentName: "Apple (iPhone)",
  },
  {
    name: "iPhone 14 Series",
    description: "Sự kết hợp hoàn hảo giữa thiết kế sang trọng và thời lượng pin ấn tượng.",
    imagePath: "categories/iphone-14.webp",
    parentName: "Apple (iPhone)",
  },
  {
    name: "iPhone 13 Series",
    description: "Dòng sản phẩm bền bỉ với khả năng chụp ảnh chuyên nghiệp và giá thành hợp lý.",
    imagePath: "categories/iphone-13.webp",
    parentName: "Apple (iPhone)",
  },
  // Xiaomi
  {
    name: "Xiaomi",
    description: "Thương hiệu điện thoại quốc dân với cấu hình mạnh mẽ và mức giá cạnh tranh.",
    imagePath: "categories/xiaomi-phone.webp",
    parentName: "Điện thoại",
  },
  {
    name: "Poco Series",
    description: "Dòng điện thoại tập trung vào hiệu năng cực khủng dành riêng cho các game thủ.",
    imagePath: "categories/poco-series.webp",
    parentName: "Xiaomi",
  },
  {
    name: "Xiaomi Series",
    description:
      "Dòng smartphone cao cấp nhất của Xiaomi với camera Leica và công nghệ tiên phong.",
    imagePath: "categories/xiaomi-series.webp",
    parentName: "Xiaomi",
  },
  {
    name: "Redmi Note Series",
    description: "Sự lựa chọn số 1 phân khúc tầm trung với màn hình lớn và pin siêu trâu.",
    imagePath: "categories/redmi-note.webp",
    parentName: "Xiaomi",
  },
  {
    name: "Redmi Series",
    description: "Smartphone phổ thông đáp ứng tốt mọi nhu cầu cơ bản với chi phí tối ưu.",
    imagePath: "categories/redmi-series.webp",
    parentName: "Xiaomi",
  },
  // Phổ thông 4G
  {
    name: "Phổ thông 4G",
    description: "Các dòng điện thoại phím bấm truyền thống tích hợp công nghệ 4G hiện đại.",
    imagePath: "categories/feature-phone.webp",
    parentName: "Điện thoại",
  },
  {
    name: "Nokia",
    description: "Biểu tượng của sự bền bỉ với thiết kế cổ điển và thời lượng pin dài ngày.",
    imagePath: "categories/nokia-phone.webp",
    parentName: "Phổ thông 4G",
  },
  {
    name: "Itel",
    description: "Điện thoại phổ thông giá rẻ, dễ dàng sử dụng cho mọi lứa tuổi.",
    imagePath: "categories/itel-phone.webp",
    parentName: "Phổ thông 4G",
  },
  {
    name: "Masstel",
    description: "Thương hiệu Việt uy tín với các dòng máy hỗ trợ loa to, chữ lớn cho người già.",
    imagePath: "categories/masstel-phone.webp",
    parentName: "Phổ thông 4G",
  },
  {
    name: "Mobell",
    description: "Thiết bị nhỏ gọn, nghe gọi ổn định và có mức giá cực kỳ tiết kiệm.",
    imagePath: "categories/mobell-phone.webp",
    parentName: "Phổ thông 4G",
  },
  {
    name: "Viettel",
    description: "Dòng điện thoại chính hãng từ nhà mạng với khả năng bắt sóng cực khỏe.",
    imagePath: "categories/viettel-phone.webp",
    parentName: "Phổ thông 4G",
  },
  // Samsung
  {
    name: "Samsung",
    description: "Gã khổng lồ công nghệ Hàn Quốc với các dòng smartphone đột phá mọi giới hạn.",
    imagePath: "categories/samsung-phone.webp",
    parentName: "Điện thoại",
  },
  {
    name: "Galaxy AI",
    description: "Kỷ nguyên điện thoại trí tuệ nhân tạo, hỗ trợ tối đa cho công việc và sáng tạo.",
    imagePath: "categories/galaxy-ai.webp",
    parentName: "Samsung",
  },
  {
    name: "Galaxy S Series",
    description: "Đỉnh cao Flagship với màn hình hiển thị xuất sắc và camera zoom siêu phân giải.",
    imagePath: "categories/galaxy-s-series.webp",
    parentName: "Samsung",
  },
  {
    name: "Galaxy Z Series",
    description: "Tiên phong điện thoại màn hình gập độc đáo, khẳng định phong cách thời thượng.",
    imagePath: "categories/galaxy-z-series.webp",
    parentName: "Samsung",
  },
  {
    name: "Galaxy A Series",
    description:
      "Smartphone dành cho giới trẻ với thiết kế hiện đại và nhiều tính năng vượt tầm giá.",
    imagePath: "categories/galaxy-a-series.webp",
    parentName: "Samsung",
  },
  {
    name: "Galaxy M Series",
    description: "Dòng máy sở hữu dung lượng pin mãnh thú, đồng hành cùng bạn suốt cả ngày dài.",
    imagePath: "categories/galaxy-m-series.webp",
    parentName: "Samsung",
  },
  {
    name: "Galaxy XCover",
    description:
      "Dòng điện thoại siêu bền bỉ, chống va đập dành cho môi trường làm việc khắc nghiệt.",
    imagePath: "categories/galaxy-xcover.webp",
    parentName: "Samsung",
  },
  // HONOR
  {
    name: "HONOR",
    description: "Thương hiệu smartphone trẻ trung với công nghệ tiên tiến và thiết kế bắt mắt.",
    imagePath: "categories/honor-phone.webp",
    parentName: "Điện thoại",
  },
  {
    name: "HONOR 400 Series",
    description: "Dòng sản phẩm mới nhất với camera chân dung chuyên nghiệp và thiết kế siêu mỏng.",
    imagePath: "categories/honor-400.webp",
    parentName: "HONOR",
  },
  {
    name: "HONOR Magic Series",
    description: "Hội tụ những công nghệ cao cấp nhất của HONOR về màn hình và sạc siêu nhanh.",
    imagePath: "categories/honor-magic.webp",
    parentName: "HONOR",
  },
  {
    name: "HONOR X Series",
    description: "Sự cân bằng hoàn hảo giữa độ bền màn hình và trải nghiệm sử dụng ổn định.",
    imagePath: "categories/honor-x-series.webp",
    parentName: "HONOR",
  },
  {
    name: "HONOR Series",
    description: "Các dòng điện thoại phổ biến đáp ứng đa dạng nhu cầu của người dùng.",
    imagePath: "categories/honor-main-series.webp",
    parentName: "HONOR",
  },
  {
    name: "HONOR Play Series",
    description: "Dòng máy tối ưu cho trải nghiệm giải trí và chơi game mượt mà.",
    imagePath: "categories/honor-play.webp",
    parentName: "HONOR",
  },
  // Theo phân khúc giá
  {
    name: "Theo phân khúc giá",
    description: "Dễ dàng tìm kiếm chiếc điện thoại phù hợp với túi tiền của bạn.",
    imagePath: "categories/phone-price.webp",
    parentName: "Điện thoại",
  },
  {
    name: "Dưới 2 triệu",
    description: "Lựa chọn tối ưu cho nhu cầu liên lạc cơ bản và người dùng mới bắt đầu.",
    imagePath: "categories/price-under-2m.webp",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 2 - 4 triệu",
    description: "Smartphone phổ thông với đầy đủ các tính năng giải trí và mạng xã hội.",
    imagePath: "categories/price-2-4m.webp",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 4 - 7 triệu",
    description: "Phân khúc tầm trung được ưa chuộng với cấu hình mạnh và thiết kế đẹp.",
    imagePath: "categories/price-4-7m.webp",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 7 - 13 triệu",
    description: "Cận cao cấp với trải nghiệm mượt mà, camera sắc nét và sạc nhanh.",
    imagePath: "categories/price-7-13m.webp",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 13 - 20 triệu",
    description: "Smartphone cao cấp sở hữu nhiều công nghệ hàng đầu và thiết kế sang trọng.",
    imagePath: "categories/price-13-20m.webp",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Trên 20 triệu",
    description: "Những siêu phẩm Flagship đỉnh cao nhất dành cho những tín đồ công nghệ.",
    imagePath: "categories/price-over-20m.webp",
    parentName: "Theo phân khúc giá",
  },
  // OPPO
  {
    name: "OPPO",
    description: "Chuyên gia selfie với công nghệ làm đẹp AI và thiết kế Glow độc quyền.",
    imagePath: "categories/oppo-phone.webp",
    parentName: "Điện thoại",
  },
  {
    name: "OPPO Reno Series",
    description: "Dòng máy dẫn đầu xu hướng thiết kế và khả năng chụp ảnh chân dung nghệ thuật.",
    imagePath: "categories/oppo-reno.webp",
    parentName: "OPPO",
  },
  {
    name: "OPPO A Series",
    description: "Smartphone thời trang, pin bền bỉ phù hợp cho mọi hoạt động hàng ngày.",
    imagePath: "categories/oppo-a-series.webp",
    parentName: "OPPO",
  },
  {
    name: "OPPO Find Series",
    description: "Flagship cao cấp với công nghệ màn hình và camera hàng đầu thế giới.",
    imagePath: "categories/oppo-find.webp",
    parentName: "OPPO",
  },
  // Thương hiệu khác
  {
    name: "Thương hiệu khác",
    description: "Khám phá thêm nhiều lựa chọn smartphone từ các nhà sản xuất uy tín khác.",
    imagePath: "categories/other-phones.webp",
    parentName: "Điện thoại",
  },
  {
    name: "Tecno",
    description: "Thương hiệu smartphone bùng nổ với cấu hình ấn tượng trong tầm giá rẻ.",
    imagePath: "categories/tecno-phone.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Realme",
    description: "Sản phẩm dành cho Gen Z với hiệu năng mạnh mẽ và sạc siêu nhanh Dart Charge.",
    imagePath: "categories/realme-phone.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Vivo",
    description: "Nổi bật với thiết kế siêu mỏng và công nghệ âm thanh, hình ảnh sống động.",
    imagePath: "categories/vivo-phone.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Inoi",
    description: "Sự lựa chọn mới lạ với các dòng máy thực dụng và giá thành cạnh tranh.",
    imagePath: "categories/inoi-phone.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Benco",
    description: "Điện thoại phổ thông tập trung vào độ bền và tính năng bảo mật.",
    imagePath: "categories/benco-phone.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "TCL",
    description: "Thương hiệu nổi tiếng với công nghệ màn hình bảo vệ mắt NXTPAPER.",
    imagePath: "categories/tcl-phone.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Nubia - ZTE",
    description: "Dòng smartphone chuyên biệt với thiết kế đậm chất gaming và cá tính.",
    imagePath: "categories/nubia-zte.webp",
    parentName: "Thương hiệu khác",
  },
  {
    name: "RedMagic",
    description: "Vua điện thoại chơi game với hệ thống tản nhiệt chủ động và hiệu năng đỉnh bảng.",
    imagePath: "categories/redmagic-phone.webp",
    parentName: "Thương hiệu khác",
  },
];
