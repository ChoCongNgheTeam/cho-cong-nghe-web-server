export interface ImageMediaSeed {
  type: "SLIDER" | "BANNER";
  position: "HOME_TOP" | "BELOW_SLIDER" | "HOME_SECTION_1" | "HOME_SECTION_2";
  title?: string;
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
    title: "Slider Laptop 1",
    imagePath: "sliders/slider-1.png",
    order: 1,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Laptop 2",
    imagePath: "sliders/slider-2.jpg",
    order: 2,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Phone 2",
    imagePath: "sliders/slider-3.png",
    order: 3,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Tablet 1",
    imagePath: "sliders/slider-4.png",
    order: 4,
    isActive: true,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Tablet 3",
    imagePath: "sliders/test-slider.jpg",
    order: 5,
    isActive: false,
  },
  // Remaining sliders (isActive: false)
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Laptop 6",
    imagePath: "sliders/slider-laptop-6.jpg",
    order: 6,
    isActive: false,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Phone 11",
    imagePath: "sliders/slider-phone-11.jpg",
    order: 7,
    isActive: false,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Phone 8",
    imagePath: "sliders/slider-phone-8.webp",
    order: 8,
    isActive: false,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Tablet 4",
    imagePath: "sliders/slider-tablet-4.jpg",
    order: 9,
    isActive: false,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Tablet 5",
    imagePath: "sliders/slider-tablet-5.jpg",
    order: 10,
    isActive: false,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Tablet 6",
    imagePath: "sliders/slider-tablet-6.jpg",
    order: 11,
    isActive: false,
  },
  {
    type: "SLIDER",
    position: "HOME_TOP",
    title: "Slider Tablet 7",
    imagePath: "sliders/slider-tablet-7.jpg",
    order: 12,
    isActive: false,
  },

  // ==========================================
  // 2. BANNER - BELOW_SLIDER (5 isActive: true)
  // ==========================================
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Banner Main 1",
    imagePath: "banners/banner-1.jpg",
    order: 1,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Banner Main 2",
    imagePath: "banners/banner-2.jpg",
    order: 2,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Banner Main 3",
    imagePath: "banners/banner-3.jpg",
    order: 3,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Banner Main 4",
    imagePath: "banners/banner-4.jpg",
    order: 4,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "BELOW_SLIDER",
    title: "Banner Main 5",
    imagePath: "banners/banner-5.jpg",
    order: 5,
    isActive: true,
  },

  // ==========================================
  // 2. BANNER - HOME_SECTION_1 (5 isActive: true)
  // ==========================================
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 6",
    imagePath: "banners/banner-6.png",
    order: 1,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 7",
    imagePath: "banners/banner-7.png",
    order: 2,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 8",
    imagePath: "banners/banner-8.png",
    order: 3,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 9",
    imagePath: "banners/banner-9.png",
    order: 4,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 10",
    imagePath: "banners/banner-10.png",
    order: 5,
    isActive: true,
  },
  // Remaining main banners (isActive: false)
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 11",
    imagePath: "banners/test-banner.webp",
    order: 6,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_1",
    title: "Banner Main 12",
    imagePath: "banners/banner-main-12.jpg",
    order: 7,
    isActive: false,
  },

  // ==========================================
  // 3. XU HUONG - HOME_SECTION_2 (7 isActive: true)
  // ==========================================
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Earphone 1",
    imagePath: "banners/test-banner.webp",
    order: 1,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Earphone 2",
    imagePath: "banners/test-banner.webp",
    order: 2,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Earphone 3",
    imagePath: "banners/test-banner.webp",
    order: 3,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Earphone 4",
    imagePath: "banners/test-banner.webp",
    order: 4,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 1",
    imagePath: "banners/test-banner.webp",
    order: 5,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 2",
    imagePath: "banners/test-banner.webp",
    order: 6,
    isActive: true,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 3",
    imagePath: "banners/test-banner.webp",
    order: 7,
    isActive: true,
  },
  // Remaining Xu Huong (isActive: false)
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 4",
    imagePath: "banners/test-banner.webp",
    order: 8,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 5",
    imagePath: "banners/xu-huong-phone-2026-5.jpg",
    order: 9,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 6",
    imagePath: "banners/xu-huong-phone-2026-6.jpg",
    order: 10,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 7",
    imagePath: "banners/xu-huong-phone-2026-7.jpg",
    order: 11,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 8",
    imagePath: "banners/xu-huong-phone-2026-8.jpg",
    order: 12,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 9",
    imagePath: "banners/xu-huong-phone-2026-9.jpg",
    order: 13,
    isActive: false,
  },
  {
    type: "BANNER",
    position: "HOME_SECTION_2",
    title: "Xu hướng Phone 10",
    imagePath: "banners/xu-huong-phone-2026-10.jpg",
    order: 14,
    isActive: false,
  },
];
