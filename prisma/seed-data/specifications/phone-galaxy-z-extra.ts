import type { SeedSpecificationGroupInput } from "./types";

/**
 * Override cho Galaxy Z Series (galaxy-z-series) — điện thoại gập
 * Thêm vào spec chung của "dien-thoai"
 */
export const galaxyZExtraSpecGroups: SeedSpecificationGroupInput[] = [
  {
    key: "man-hinh-gap",
    name: "Màn hình gập",
    icon: "smartphone",
    sortOrder: 14,
    specifications: [
      { key: "fold_main_screen_size", name: "Kích thước màn hình chính (mở)", unit: "inch", icon: "screen" },
      { key: "fold_cover_screen_size", name: "Kích thước màn hình phụ (đóng)", unit: "inch", icon: "screen-small" },
      { key: "fold_cover_screen_tech", name: "Công nghệ màn hình phụ", unit: null, icon: "monitor" },
      { key: "fold_crease", name: "Nếp gấp (Crease)", unit: null, icon: "fold" },
    ],
  },
  {
    key: "co-che-gap",
    name: "Cơ chế gập",
    icon: "rotate-cw",
    sortOrder: 15,
    specifications: [
      { key: "fold_hinge_type", name: "Loại bản lề", unit: null, icon: "hinge" }, // Flex Hinge, Flex Mode...
      { key: "fold_flex_mode", name: "Flex Mode (góc gập tự do)", unit: null, icon: "sliders" },
      { key: "fold_durability", name: "Độ bền bản lề", unit: "lần", icon: "shield-check" }, // VD: 200,000 lần gập
    ],
  },
] as const;
