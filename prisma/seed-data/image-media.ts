export interface ImageMediaSeed {
  type: "SLIDER" | "BANNER";
  position: "HOME_TOP" | "BELOW_SLIDER" | "HOME_SECTION_1" | "HOME_SECTION_2";
  title?: string;
  subTitle?: string;
  imagePath: string;
  linkUrl?: string;
  order: number;
  isActive?: boolean;
}

export const imageMediaSeeds: ImageMediaSeed[] = [
  // ==========================================
  // 1. SLIDER (HOME_TOP) - 5 isActive: true
  // ==========================================

  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "SIÊU PHẨM CÔNG NGHỆ 2026",
    subTitle: "Trải nghiệm thiết kế đột phá và hiệu năng đỉnh cao. Trả góp 0% ngay hôm nay!",
    imagePath: "sliders/slider-1.png",
    linkUrl: "/category/apple-iphone",
    order: 1,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "CHIẾN GAME ĐỈNH - LÀM VIỆC NHANH",
    subTitle: "Combo Laptop, bàn phím cơ và chuột Gaming cực chất. Giảm đến 30%.",
    imagePath: "sliders/slider-2.png",
    linkUrl: "/category/gaming-gear",
    order: 2,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "TIỆN NGHI CHO GIA ĐÌNH HIỆN ĐẠI",
    subTitle: "Tủ lạnh, máy giặt, TV chính hãng. Nâng tầm không gian sống của bạn.",
    imagePath: "sliders/slider-3.png",
    linkUrl: "/category/dien-may",
    order: 3,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "THẾ GIỚI PHỤ KIỆN CHÍNH HÃNG",
    subTitle: "Tai nghe, sạc dự phòng tốc độ cao. Luôn sẵn sàng cho mọi hành trình.",
    imagePath: "sliders/slider-4.png",
    linkUrl: "/category/phu-kien",
    order: 4,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "ÂM NHẠC SỐNG ĐỘNG MỌI CUỘC VUI",
    subTitle: "Loa JBL, Marshall và tai nghe cực cháy. Chất âm đỉnh cao, ưu đãi cực sốc.",
    imagePath: "sliders/slider-5.png",
    linkUrl: "/category/am-thanh",
    order: 5,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "GIẢI PHÁP LÀM MÁT THÔNG MINH",
    subTitle: "Máy lạnh Inverter, quạt thế hệ mới. Tiết kiệm điện, miễn phí lắp đặt.",
    imagePath: "sliders/slider-6.png",
    linkUrl: "/category/may-lanh-dieu-hoa",
    order: 6,
    isActive: true,
  },

  // ==========================================
  // 2. BANNER - BELOW_SLIDER (5 isActive: true)
  // ==========================================
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Samsung Galaxy S25+",
    imagePath: "banners/banner-1.jpg",
    linkUrl: "/category/galaxy-s-series",
    order: 1,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Galaxy Tab S11 Ultra",
    imagePath: "banners/banner-2.jpg",
    linkUrl: "/category/samsung",
    order: 2,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "iPad Pro M4 Series",
    imagePath: "banners/banner-3.jpg",
    linkUrl: "/category/apple-iphone",
    order: 3,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "iPhone 14 Series Có Sẵn Hàng",
    imagePath: "banners/banner-4.jpg",
    linkUrl: "/category/iphone-14-series",
    order: 4,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "iPhone 15 Pro Titanium",
    imagePath: "banners/banner-5.jpg",
    linkUrl: "/category/iphone-15-series",
    order: 5,
    isActive: true,
  },

  // ==========================================
  // 2. BANNER - HOME_SECTION_1 (5 isActive: true)
  // ==========================================
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "iPhone 17 Pro Max Sắp Ra Mắt",
    imagePath: "banners/banner-6.png",
    linkUrl: "/category/iphone-17-series",
    order: 1,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "MacBook Mover Maker",
    imagePath: "banners/banner-7.png",
    linkUrl: "/category/apple-macbook",
    order: 2,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Black Friday Sale Off 40%",
    imagePath: "banners/banner-8.png",
    linkUrl: "/category/apple-iphone",
    order: 3,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Sale Giữa Tháng Ngập Tràn Ưu Đãi",
    imagePath: "banners/banner-9.png",
    linkUrl: "/category/phu-kien",
    order: 4,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Đặt Trước iPhone 17 Pro",
    imagePath: "banners/banner-10.jpg",
    linkUrl: "/category/iphone-17-series",
    order: 5,
    isActive: true,
  },

  // ==========================================
  // 3. XU HUONG - HOME_SECTION_2 (7 isActive: true)
  // ==========================================
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Earphone 1",
  //   imagePath: "banners/test-banner.webp",
  //   order: 1,
  //   isActive: true,
  // },
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Earphone 2",
  //   imagePath: "banners/test-banner.webp",
  //   order: 2,
  //   isActive: true,
  // },
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Earphone 3",
  //   imagePath: "banners/test-banner.webp",
  //   order: 3,
  //   isActive: true,
  // },
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Earphone 4",
  //   imagePath: "banners/test-banner.webp",
  //   order: 4,
  //   isActive: true,
  // },
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Phone 1",
  //   imagePath: "banners/test-banner.webp",
  //   order: 5,
  //   isActive: true,
  // },
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Phone 2",
  //   imagePath: "banners/test-banner.webp",
  //   order: 6,
  //   isActive: true,
  // },
  // {
  //   type: "BANNER",
  //   position: "HOME_SECTION_2",
  //   title: "Xu hướng Phone 3",
  //   imagePath: "banners/test-banner.webp",
  //   order: 7,
  //   isActive: true,
  // },
];
