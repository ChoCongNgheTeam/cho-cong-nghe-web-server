export const laptopCategoryData = [
  // ROOT Laptop
  {
    name: "Laptop",
    description:
      "Hệ thống máy tính xách tay đa dạng từ học tập, văn phòng đến đồ họa và gaming chuyên nghiệp.",
    imagePath: "categories/laptop.webp",
    isFeatured: true,
  },
  // Apple (Macbook)
  {
    name: "Apple (Macbook)",
    description:
      "Dòng máy tính cao cấp từ Apple với thiết kế nhôm nguyên khối và chip Apple Silicon mạnh mẽ.",
    imagePath: "categories/apple-macbook.webp",
    parentName: "Laptop",
  },
  {
    name: "MacBook Air 13 inch",
    description:
      "Sự lựa chọn hoàn hảo cho tính di động, mỏng nhẹ bậc nhất và hiệu năng ổn định cho văn phòng.",
    imagePath: "categories/macbook-air-13.webp",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook Air 15 inch",
    description:
      "Màn hình lớn hơn trong một thân máy siêu mỏng, mang lại không gian làm việc rộng rãi.",
    imagePath: "categories/macbook-air-15.webp",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook Pro 14 inch",
    description:
      "Cấu hình chuyên nghiệp, màn hình Liquid Retina XDR dành cho các nhà sáng tạo nội dung.",
    imagePath: "categories/macbook-pro-14.webp",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook Pro 16 inch",
    description:
      "Quái vật hiệu năng với kích thước màn hình lớn nhất, đáp ứng mọi tác vụ đồ họa nặng nhất.",
    imagePath: "categories/macbook-pro-16.webp",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook M5 Series",
    description:
      "Thế hệ MacBook mới nhất tích hợp chip xử lý thế hệ 5 với khả năng tính toán vượt trội.",
    imagePath: "categories/macbook-m5.webp",
    parentName: "Apple (Macbook)",
  },
  // Asus
  {
    name: "Asus",
    description: "Thương hiệu laptop đa dạng mẫu mã, tiên phong trong công nghệ màn hình OLED.",
    imagePath: "categories/asus-laptop.webp",
    parentName: "Laptop",
  },
  {
    name: "Asus ZenBook",
    description: "Dòng laptop cao cấp, mỏng nhẹ và sang trọng dành cho doanh nhân và quản lý.",
    imagePath: "categories/asus-zenbook.webp",
    parentName: "Asus",
  },
  {
    name: "Asus VivoBook",
    description: "Thiết kế trẻ trung, năng động với nhiều màu sắc cá tính phù hợp cho sinh viên.",
    imagePath: "categories/asus-vivobook.webp",
    parentName: "Asus",
  },
  {
    name: "Asus TUF Gaming",
    description: "Laptop chơi game bền bỉ chuẩn quân đội với hiệu năng mạnh mẽ trong tầm giá.",
    imagePath: "categories/asus-tuf.webp",
    parentName: "Asus",
  },
  {
    name: "Asus ROG",
    description: "Đỉnh cao laptop gaming với cấu hình khủng và hệ thống tản nhiệt tiên tiến.",
    imagePath: "categories/asus-rog.webp",
    parentName: "Asus",
  },
  // Lenovo
  {
    name: "Lenovo",
    description: "Nổi tiếng với độ bền cao và bàn phím tốt nhất thế giới.",
    imagePath: "categories/lenovo-laptop.webp",
    parentName: "Laptop",
  },
  {
    name: "Lenovo Gaming LOQ",
    description: "Dòng gaming mới với mức giá tiếp cận dễ dàng nhưng hiệu năng rất ấn tượng.",
    imagePath: "categories/lenovo-loq.webp",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo Yoga",
    description: "Laptop 2-trong-1 linh hoạt với màn hình cảm ứng xoay gập 360 độ.",
    imagePath: "categories/lenovo-yoga.webp",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo Legion Gaming",
    description: "Biểu tượng laptop gaming with hệ thống tản nhiệt Legion Coldfront trứ danh.",
    imagePath: "categories/lenovo-legion.webp",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo ThinkBook",
    description: "Sự giao thoa giữa phong cách hiện đại và tính bảo mật cao của dòng ThinkPad.",
    imagePath: "categories/lenovo-thinkbook.webp",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo ThinkPad",
    description: "Huyền thoại laptop doanh nhân với độ bền đạt chuẩn quân đội Mỹ.",
    imagePath: "categories/lenovo-thinkpad.webp",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo IdeaPad",
    description: "Dòng máy đa năng, phù hợp cho mọi nhu cầu từ học tập đến giải trí gia đình.",
    imagePath: "categories/lenovo-ideapad.webp",
    parentName: "Lenovo",
  },
  // Acer
  {
    name: "Acer",
    description: "Luôn dẫn đầu về việc trang bị cấu hình mới nhất với mức giá hợp lý nhất.",
    imagePath: "categories/acer-laptop.webp",
    parentName: "Laptop",
  },
  {
    name: "Acer Swift",
    description: "Laptop siêu mỏng nhẹ, vỏ nhôm sang trọng và thời lượng pin cực dài.",
    imagePath: "categories/acer-swift.webp",
    parentName: "Acer",
  },
  {
    name: "Acer Nitro",
    description: "Dòng laptop gaming quốc dân, mạnh mẽ và vô cùng phổ biến tại Việt Nam.",
    imagePath: "categories/acer-nitro.webp",
    parentName: "Acer",
  },
  {
    name: "Acer Aspire",
    description: "Người bạn đồng hành tin cậy cho công việc học tập và văn phòng mỗi ngày.",
    imagePath: "categories/acer-aspire.webp",
    parentName: "Acer",
  },
  {
    name: "Acer Aspire Gaming",
    description: "Sự kết hợp giữa diện mạo văn phòng và linh hồn của một cỗ máy chơi game.",
    imagePath: "categories/acer-aspire-gaming.webp",
    parentName: "Acer",
  },
  {
    name: "Acer Predator",
    description: "Dòng gaming cao cấp nhất của Acer với thiết kế hầm hố và hiệu năng tối thượng.",
    imagePath: "categories/acer-predator.webp",
    parentName: "Acer",
  },
  // Dell
  {
    name: "Dell",
    description: "Thương hiệu laptop hàng đầu thế giới về độ bền và dịch vụ hậu mãi xuất sắc.",
    imagePath: "categories/dell-laptop.webp",
    parentName: "Laptop",
  },
  {
    name: "Dell XPS",
    description: "Kiệt tác thiết kế với viền màn hình siêu mỏng InfinityEdge và hiệu năng cao.",
    imagePath: "categories/dell-xps.webp",
    parentName: "Dell",
  },
  {
    name: "Dell Inspiron",
    description: "Dòng laptop phổ biến nhất, đáp ứng tốt mọi nhu cầu cá nhân và gia đình.",
    imagePath: "categories/dell-inspiron.webp",
    parentName: "Dell",
  },
  {
    name: "Dell Vostro",
    description: "Laptop bền bỉ với bảo mật vân tay, dành riêng cho doanh nghiệp vừa và nhỏ.",
    imagePath: "categories/dell-vostro.webp",
    parentName: "Dell",
  },
  {
    name: "Dell Latitude",
    description: "Dòng máy doanh nhân cao cấp với độ bền đạt chuẩn và khả năng kết nối linh hoạt.",
    imagePath: "categories/dell-latitude.webp",
    parentName: "Dell",
  },
  {
    name: "Dell Gaming G Series",
    description: "Mang DNA từ Alienware, cung cấp sức mạnh chơi game đáng gờm cho game thủ.",
    imagePath: "categories/dell-gaming.webp",
    parentName: "Dell",
  },
  // HP
  {
    name: "HP",
    description: "Sự kết hợp hoàn hảo giữa tính thời trang và công nghệ bảo mật tiên tiến.",
    imagePath: "categories/hp-laptop.webp",
    parentName: "Laptop",
  },
  {
    name: "HP 14/15 - 14s/15s",
    description: "Laptop cơ bản có thiết kế mỏng nhẹ, thanh lịch cho dân văn phòng.",
    imagePath: "categories/hp-basic-series.webp",
    parentName: "HP",
  },
  {
    name: "HP cơ bản",
    description: "Các dòng máy tập trung vào tính thực dụng và giá thành tiết kiệm.",
    imagePath: "categories/hp-essential.webp",
    parentName: "HP",
  },
  {
    name: "HP Pavilion",
    description: "Dòng laptop giải trí đa phương tiện with âm thanh B&O chất lượng cao.",
    imagePath: "categories/hp-pavilion.webp",
    parentName: "HP",
  },
  {
    name: "HP Envy",
    description: "Vẻ đẹp sang trọng quyến rũ cùng hiệu năng mạnh mẽ cho người dùng sáng tạo.",
    imagePath: "categories/hp-envy.webp",
    parentName: "HP",
  },
  {
    name: "HP Victus",
    description: "Dòng laptop gaming mới với thiết kế tối giản nhưng hiệu năng cực kỳ mạnh.",
    imagePath: "categories/hp-victus.webp",
    parentName: "HP",
  },
  {
    name: "HP ProBook",
    description: "Laptop làm việc tin cậy cho doanh nhân với thiết kế vỏ nhôm chắc chắn.",
    imagePath: "categories/hp-probook.webp",
    parentName: "HP",
  },
];
