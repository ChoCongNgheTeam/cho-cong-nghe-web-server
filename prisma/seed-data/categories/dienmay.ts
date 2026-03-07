export const dienMayCategoryData = [
  // ROOT Điện máy
  {
    name: "Điện máy",
    description: "Giải pháp thiết bị gia đình thông minh, nâng tầm chất lượng cuộc sống hiện đại.",
    imagePath: "categories/dien-may.webp",
    isFeatured: true,
  },
  // Tivi
  {
    name: "Tivi",
    description:
      "Trung tâm giải trí gia đình với công nghệ hình ảnh sắc nét và âm thanh sống động.",
    imagePath: "categories/tivi.webp",
    isFeatured: true,
    parentName: "Điện máy",
  },
  {
    name: "Tivi QLED",
    description:
      "Công nghệ chấm lượng tử cho màu sắc rực rỡ và độ sáng vượt trội trong mọi điều kiện.",
    imagePath: "categories/tivi-qled.webp",
    parentName: "Tivi",
  },
  {
    name: "Tivi 4K",
    description:
      "Độ phân giải siêu nét gấp 4 lần Full HD, mang lại trải nghiệm xem chân thực nhất.",
    imagePath: "categories/tivi-4k.webp",
    parentName: "Tivi",
  },
  {
    name: "Google TV",
    description: "Hệ điều hành thông minh cá nhân hóa nội dung yêu thích của bạn một cách dễ dàng.",
    imagePath: "categories/google-tv.webp",
    parentName: "Tivi",
  },

  // Máy giặt
  {
    name: "Máy giặt",
    description: "Trợ thủ đắc lực giúp chăm sóc quần áo sạch thơm và bảo vệ sợi vải tối ưu.",
    imagePath: "categories/may-giat.webp",
    isFeatured: true,
    parentName: "Điện máy",
  },
  {
    name: "Máy giặt cửa trước",
    description: "Thiết kế lồng ngang hiện đại, tiết kiệm nước và chống xoắn rối quần áo hiệu quả.",
    imagePath: "categories/front-load-washer.webp",
    parentName: "Máy giặt",
  },
  {
    name: "Máy giặt cửa trên",
    description: "Dòng máy giặt lồng đứng truyền thống, dễ dàng thêm đồ và phù hợp không gian hẹp.",
    imagePath: "categories/top-load-washer.webp",
    parentName: "Máy giặt",
  },
  {
    name: "Máy giặt sấy",
    description:
      "Sự kết hợp hoàn hảo 2 trong 1, vừa giặt sạch vừa sấy khô tiện lợi trong mọi thời tiết.",
    imagePath: "categories/washer-dryer-combo.webp",
    parentName: "Máy giặt",
  },

  // Máy lạnh - Điều hòa
  {
    name: "Máy lạnh - Điều hòa",
    description: "Tận hưởng bầu không khí trong lành, mát lạnh và bảo vệ sức khỏe cho cả gia đình.",
    imagePath: "categories/may-lanh.webp",
    parentName: "Điện máy",
  },
  {
    name: "Máy lạnh - Điều hòa 1 chiều",
    description: "Giải pháp làm lạnh nhanh chóng và tối ưu cho những ngày hè nắng nóng.",
    imagePath: "categories/ac-1-way.webp",
    parentName: "Máy lạnh - Điều hòa",
  },
  {
    name: "Máy lạnh - Điều hòa 2 chiều",
    description: "Thiết bị đa năng giúp làm mát vào mùa hè và sưởi ấm ấm áp vào mùa đông.",
    imagePath: "categories/ac-2-way.webp",
    parentName: "Máy lạnh - Điều hòa",
  },
  {
    name: "Máy lạnh - Điều hòa Inverter",
    description: "Công nghệ biến tần tiên tiến giúp vận hành êm ái và siêu tiết kiệm điện năng.",
    imagePath: "categories/ac-inverter.webp",
    parentName: "Máy lạnh - Điều hòa",
  },

  // Tủ lạnh
  {
    name: "Tủ lạnh",
    description: "Hệ thống bảo quản thực phẩm tươi ngon lâu hơn với công nghệ làm lạnh đa chiều.",
    imagePath: "categories/tu-lanh.webp",
    isFeatured: true,
    parentName: "Điện máy",
  },
  {
    name: "Tủ lạnh Inverter",
    description: "Vận hành bền bỉ, duy trì nhiệt độ ổn định và tối ưu hóa hóa đơn tiền điện.",
    imagePath: "categories/refrigerator-inverter.webp",
    parentName: "Tủ lạnh",
  },
  {
    name: "Tủ lạnh nhiều cửa",
    description:
      "Thiết kế Multidoor sang trọng, phân chia ngăn chứa thông minh tránh lẫn mùi thực phẩm.",
    imagePath: "categories/multidoor-refrigerator.webp",
    parentName: "Tủ lạnh",
  },
  {
    name: "Side by side",
    description: "Tủ lạnh 2 cánh lớn với dung lượng cực khủng cho gia đình đông thành viên.",
    imagePath: "categories/side-by-side.webp",
    parentName: "Tủ lạnh",
  },
  {
    name: "Mini",
    description: "Thiết kế nhỏ gọn, tiện lợi cho phòng trọ, khách sạn hoặc phòng ngủ cá nhân.",
    imagePath: "categories/mini-fridge.webp",
    parentName: "Tủ lạnh",
  },

  // Tủ đông
  {
    name: "Tủ đông",
    description: "Chuyên dụng để cấp đông thực phẩm số lượng lớn with khả năng làm lạnh sâu.",
    imagePath: "categories/tu-dong.webp",
    parentName: "Điện máy",
  },
];
