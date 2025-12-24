export const laptopCategoryData = [
  // ROOT Laptop
  {
    name: "Laptop",
    description:
      "Hệ thống máy tính xách tay đa dạng từ học tập, văn phòng đến đồ họa và gaming chuyên nghiệp.",
    categoryImage: "./images/categories/laptop.png",
  },
  // Apple (Macbook)
  {
    name: "Apple (Macbook)",
    description:
      "Dòng máy tính cao cấp từ Apple với thiết kế nhôm nguyên khối và chip Apple Silicon mạnh mẽ.",
    categoryImage: "./images/categories/apple.png",
    parentName: "Laptop",
  },
  {
    name: "MacBook Air 13 inch",
    description:
      "Sự lựa chọn hoàn hảo cho tính di động, mỏng nhẹ bậc nhất và hiệu năng ổn định cho văn phòng.",
    categoryImage: "./images/categories/macbook.png",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook Air 15 inch",
    description:
      "Màn hình lớn hơn trong một thân máy siêu mỏng, mang lại không gian làm việc rộng rãi.",
    categoryImage: "./images/categories/macbook.png",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook Pro 14 inch",
    description:
      "Cấu hình chuyên nghiệp, màn hình Liquid Retina XDR dành cho các nhà sáng tạo nội dung.",
    categoryImage: "./images/categories/macbook.png",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook Pro 16 inch",
    description:
      "Quái vật hiệu năng với kích thước màn hình lớn nhất, đáp ứng mọi tác vụ đồ họa nặng nhất.",
    categoryImage: "./images/categories/macbook.png",
    parentName: "Apple (Macbook)",
  },
  {
    name: "MacBook M5 Series",
    description:
      "Thế hệ MacBook mới nhất tích hợp chip xử lý thế hệ 5 với khả năng tính toán vượt trội.",
    categoryImage: "./images/categories/macbook.png",
    parentName: "Apple (Macbook)",
  },
  // Asus
  {
    name: "Asus",
    description: "Thương hiệu laptop đa dạng mẫu mã, tiên phong trong công nghệ màn hình OLED.",
    categoryImage: "./images/categories/asus.png",
    parentName: "Laptop",
  },
  {
    name: "Asus ZenBook",
    description: "Dòng laptop cao cấp, mỏng nhẹ và sang trọng dành cho doanh nhân và quản lý.",
    categoryImage: "./images/categories/asus.png",
    parentName: "Asus",
  },
  {
    name: "Asus VivoBook",
    description: "Thiết kế trẻ trung, năng động với nhiều màu sắc cá tính phù hợp cho sinh viên.",
    categoryImage: "./images/categories/asus.png",
    parentName: "Asus",
  },
  {
    name: "Asus TUF Gaming",
    description: "Laptop chơi game bền bỉ chuẩn quân đội với hiệu năng mạnh mẽ trong tầm giá.",
    categoryImage: "./images/categories/asus.png",
    parentName: "Asus",
  },
  {
    name: "Asus ROG",
    description: "Đỉnh cao laptop gaming với cấu hình khủng và hệ thống tản nhiệt tiên tiến.",
    categoryImage: "./images/categories/asus.png",
    parentName: "Asus",
  },
  // MSI
  {
    name: "MSI",
    description: "Chuyên gia laptop gaming và máy trạm với hiệu suất tối đa.",
    categoryImage: "./images/categories/msi.png",
    parentName: "Laptop",
  },
  {
    name: "MSI Gaming Thin GF / Cyborg",
    description: "Sự kết hợp giữa thiết kế mỏng nhẹ và khả năng chơi game ổn định.",
    categoryImage: "./images/categories/msi.png",
    parentName: "MSI",
  },
  {
    name: "MSI Gaming Katana/ Sword/ Crosshair",
    description: "Lấy cảm hứng từ những vũ khí sắc bén, tối ưu cho các game thủ chuyên nghiệp.",
    categoryImage: "./images/categories/msi.png",
    parentName: "MSI",
  },
  {
    name: "MSI Modern",
    description: "Dòng văn phòng thời trang, mỏng gọn giúp bạn xử lý công việc mọi lúc mọi nơi.",
    categoryImage: "./images/categories/msi.png",
    parentName: "MSI",
  },
  // Theo phân khúc giá
  {
    name: "Theo phân khúc giá",
    description: "Lọc laptop theo ngân sách để tìm được sản phẩm ưng ý nhất.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Laptop",
  },
  {
    name: "Dưới 10 triệu",
    description: "Laptop giá rẻ đáp ứng nhu cầu học tập cơ bản và lướt web.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 10 - 15 triệu",
    description: "Phân khúc phổ thông với cấu hình ổn định cho công việc văn phòng.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 15 - 20 triệu",
    description: "Lựa chọn tốt cho các bạn cần laptop mỏng nhẹ hoặc chơi game tầm trung.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 20 - 25 triệu",
    description: "Cấu hình mạnh mẽ, màn hình đẹp cho trải nghiệm làm việc chuyên nghiệp.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Từ 25 - 30 triệu",
    description: "Dòng máy cận cao cấp với vật liệu hoàn thiện tốt và hiệu năng cao.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Theo phân khúc giá",
  },
  {
    name: "Trên 30 triệu",
    description: "Laptop cao cấp, Flagship hội tụ những tinh hoa công nghệ mới nhất.",
    categoryImage: "./images/categories/gia.png",
    parentName: "Theo phân khúc giá",
  },
  // Lenovo
  {
    name: "Lenovo",
    description: "Nổi tiếng với độ bền cao và bàn phím tốt nhất thế giới.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Laptop",
  },
  {
    name: "Lenovo Gaming LOQ",
    description: "Dòng gaming mới với mức giá tiếp cận dễ dàng nhưng hiệu năng rất ấn tượng.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo Yoga",
    description: "Laptop 2-trong-1 linh hoạt với màn hình cảm ứng xoay gập 360 độ.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo Legion Gaming",
    description: "Biểu tượng laptop gaming với hệ thống tản nhiệt Legion Coldfront trứ danh.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo ThinkBook",
    description: "Sự giao thoa giữa phong cách hiện đại và tính bảo mật cao của dòng ThinkPad.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo ThinkPad",
    description: "Huyền thoại laptop doanh nhân với độ bền đạt chuẩn quân đội Mỹ.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Lenovo",
  },
  {
    name: "Lenovo IdeaPad",
    description: "Dòng máy đa năng, phù hợp cho mọi nhu cầu từ học tập đến giải trí gia đình.",
    categoryImage: "./images/categories/lenovo.png",
    parentName: "Lenovo",
  },
  // Acer
  {
    name: "Acer",
    description: "Luôn dẫn đầu về việc trang bị cấu hình mới nhất với mức giá hợp lý nhất.",
    categoryImage: "./images/categories/acer.png",
    parentName: "Laptop",
  },
  {
    name: "Acer Swift",
    description: "Laptop siêu mỏng nhẹ, vỏ nhôm sang trọng và thời lượng pin cực dài.",
    categoryImage: "./images/categories/acer.png",
    parentName: "Acer",
  },
  {
    name: "Acer Nitro",
    description: "Dòng laptop gaming quốc dân, mạnh mẽ và vô cùng phổ biến tại Việt Nam.",
    categoryImage: "./images/categories/acer.png",
    parentName: "Acer",
  },
  {
    name: "Acer Aspire",
    description: "Người bạn đồng hành tin cậy cho công việc học tập và văn phòng mỗi ngày.",
    categoryImage: "./images/categories/acer.png",
    parentName: "Acer",
  },
  {
    name: "Acer Aspire Gaming",
    description: "Sự kết hợp giữa diện mạo văn phòng và linh hồn của một cỗ máy chơi game.",
    categoryImage: "./images/categories/acer.png",
    parentName: "Acer",
  },
  {
    name: "Acer Predator",
    description: "Dòng gaming cao cấp nhất của Acer với thiết kế hầm hố và hiệu năng tối thượng.",
    categoryImage: "./images/categories/acer.png",
    parentName: "Acer",
  },
  // Thương hiệu khác
  {
    name: "Thương hiệu khác",
    description: "Nơi quy tụ những cái tên laptop chất lượng và đầy tiềm năng khác.",
    categoryImage: "./images/categories/other-laptop.png",
    parentName: "Laptop",
  },
  {
    name: "Gigabyte",
    description: "Laptop hiệu năng cao cho game thủ và những người làm đồ họa chuyên nghiệp.",
    categoryImage: "./images/categories/gigabyte.png",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Huawei",
    description: "Thiết kế mỏng gọn đầy tinh tế cùng khả năng đồng bộ hệ sinh thái tuyệt vời.",
    categoryImage: "./images/categories/huawei.png",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Masstel",
    description: "Laptop giá rẻ dành riêng cho học sinh, sinh viên với các tính năng giáo dục.",
    categoryImage: "./images/categories/masstel.png",
    parentName: "Thương hiệu khác",
  },
  {
    name: "Colorful",
    description: "Dòng laptop mới mẻ với thiết kế độc đáo và cấu hình phần cứng mạnh mẽ.",
    categoryImage: "./images/categories/colorful.png",
    parentName: "Thương hiệu khác",
  },
  // Dell
  {
    name: "Dell",
    description: "Thương hiệu laptop hàng đầu thế giới về độ bền và dịch vụ hậu mãi xuất sắc.",
    categoryImage: "./images/categories/dell.png",
    parentName: "Laptop",
  },
  {
    name: "Dell XPS",
    description: "Kiệt tác thiết kế với viền màn hình siêu mỏng InfinityEdge và hiệu năng cao.",
    categoryImage: "./images/categories/dell.png",
    parentName: "Dell",
  },
  {
    name: "Dell Inspiron",
    description: "Dòng laptop phổ biến nhất, đáp ứng tốt mọi nhu cầu cá nhân và gia đình.",
    categoryImage: "./images/categories/dell.png",
    parentName: "Dell",
  },
  {
    name: "Dell Vostro",
    description: "Laptop bền bỉ với bảo mật vân tay, dành riêng cho doanh nghiệp vừa và nhỏ.",
    categoryImage: "./images/categories/dell.png",
    parentName: "Dell",
  },
  {
    name: "Dell Latitude",
    description: "Dòng máy doanh nhân cao cấp với độ bền đạt chuẩn và khả năng kết nối linh hoạt.",
    categoryImage: "./images/categories/dell.png",
    parentName: "Dell",
  },
  {
    name: "Dell Gaming G Series",
    description: "Mang DNA từ Alienware, cung cấp sức mạnh chơi game đáng gờm cho game thủ.",
    categoryImage: "./images/categories/dell.png",
    parentName: "Dell",
  },
  // HP
  {
    name: "HP",
    description: "Sự kết hợp hoàn hảo giữa tính thời trang và công nghệ bảo mật tiên tiến.",
    categoryImage: "./images/categories/hp.png",
    parentName: "Laptop",
  },
  {
    name: "HP 14/15 - 14s/15s",
    description: "Laptop cơ bản có thiết kế mỏng nhẹ, thanh lịch cho dân văn phòng.",
    categoryImage: "./images/categories/hp.png",
    parentName: "HP",
  },
  {
    name: "HP cơ bản",
    description: "Các dòng máy tập trung vào tính thực dụng và giá thành tiết kiệm.",
    categoryImage: "./images/categories/hp.png",
    parentName: "HP",
  },
  {
    name: "HP Pavilion",
    description: "Dòng laptop giải trí đa phương tiện với âm thanh B&O chất lượng cao.",
    categoryImage: "./images/categories/hp.png",
    parentName: "HP",
  },
  {
    name: "HP Envy",
    description: "Vẻ đẹp sang trọng quyến rũ cùng hiệu năng mạnh mẽ cho người dùng sáng tạo.",
    categoryImage: "./images/categories/hp.png",
    parentName: "HP",
  },
  {
    name: "HP Victus",
    description: "Dòng laptop gaming mới với thiết kế tối giản nhưng hiệu năng cực kỳ mạnh.",
    categoryImage: "./images/categories/hp.png",
    parentName: "HP",
  },
  {
    name: "HP ProBook",
    description: "Laptop làm việc tin cậy cho doanh nhân với thiết kế vỏ nhôm chắc chắn.",
    categoryImage: "./images/categories/hp.png",
    parentName: "HP",
  },
  // Theo nhu cầu
  {
    name: "Theo nhu cầu",
    description: "Tìm kiếm laptop chuẩn xác dựa trên mục đích sử dụng thực tế của bạn.",
    categoryImage: "./images/categories/nhu-cau.png",
    parentName: "Laptop",
  },
  {
    name: "Gaming - Đồ họa",
    description:
      "Trang bị card đồ họa rời mạnh mẽ cho các trận game đỉnh cao và thiết kế 3D chuyên nghiệp.",
    categoryImage: "./images/categories/nhu-cau.png",
    parentName: "Theo nhu cầu",
  },
  {
    name: "Laptop AI",
    description: "Thế hệ máy tính tích hợp NPU chuyên dụng để xử lý các tác vụ trí tuệ nhân tạo.",
    categoryImage: "./images/categories/nhu-cau.png",
    parentName: "Theo nhu cầu",
  },
  {
    name: "Sinh viên - Văn phòng",
    description: "Tối ưu cho việc soạn thảo văn bản, làm slide và các phần mềm quản lý.",
    categoryImage: "./images/categories/nhu-cau.png",
    parentName: "Theo nhu cầu",
  },
  {
    name: "Mỏng nhẹ",
    description:
      "Ưu tiên trọng lượng dưới 1.5kg, dễ dàng mang đi công tác hoặc di chuyển hàng ngày.",
    categoryImage: "./images/categories/nhu-cau.png",
    parentName: "Theo nhu cầu",
  },
];
