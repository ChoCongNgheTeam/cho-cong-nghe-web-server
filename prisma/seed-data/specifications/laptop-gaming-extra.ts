import type { SeedSpecificationGroupInput } from "./types";

/**
 * Override cho các category laptop gaming:
 * - asus-rog, asus-tuf-gaming
 * - lenovo-legion-gaming
 * - acer-predator, acer-nitro, acer-aspire-gaming
 * - dell-gaming-g-series
 *
 * Các key này sẽ THÊM VÀO spec chung của "laptop"
 * (category cha đã có toàn bộ spec laptop cơ bản)
 */
export const gamingLaptopExtraSpecGroups: SeedSpecificationGroupInput[] = [
  {
    key: "hieu-nang-gaming",
    name: "Hiệu năng Gaming",
    icon: "gamepad",
    sortOrder: 14, // sortOrder cao hơn để nằm sau spec laptop chung
    specifications: [
      {
        key: "laptop_gpu_tdp",
        name: "TDP GPU (Công suất GPU)",
        unit: "W",
        icon: "zap",
        isFilterable: true,
        filterType: "RANGE",
      },
      { key: "laptop_cooling_system", name: "Hệ thống tản nhiệt", unit: null, icon: "wind" }, // Số quạt, heatpipe...
      { key: "laptop_performance_mode", name: "Chế độ hiệu năng", unit: null, icon: "sliders" }, // Turbo, Silent, Balanced...
      { key: "laptop_mux_switch", name: "MUX Switch", unit: null, icon: "toggle" }, // Có/Không
    ],
  },
  {
    key: "man-hinh-gaming",
    name: "Màn hình Gaming",
    icon: "monitor",
    sortOrder: 15,
    specifications: [
      {
        key: "laptop_screen_response_time",
        name: "Thời gian phản hồi",
        unit: "ms",
        icon: "timer",
        isFilterable: true,
        filterType: "ENUM", // 1ms, 3ms, 5ms...
      },
      { key: "laptop_gsync_freesync", name: "G-Sync / FreeSync", unit: null, icon: "sync" },
    ],
  },
  {
    key: "am-thanh-gaming",
    name: "Âm thanh Gaming",
    icon: "volume-2",
    sortOrder: 16,
    specifications: [
      { key: "laptop_gaming_audio", name: "Công nghệ âm thanh Gaming", unit: null, icon: "headphones" }, // Dolby Atmos, DTS...
    ],
  },
  {
    key: "ban-phim-gaming",
    name: "Bàn phím Gaming",
    icon: "keyboard",
    sortOrder: 17,
    specifications: [
      {
        key: "laptop_keyboard_type",
        name: "Loại bàn phím",
        unit: null,
        icon: "keyboard",
        isFilterable: true,
        filterType: "ENUM", // Membrane, Mechanical, Optical...
      },
      { key: "laptop_keyboard_rgb", name: "Đèn nền bàn phím", unit: null, icon: "lightbulb" }, // RGB per-key, Zone RGB...
      { key: "laptop_keyboard_rollover", name: "Anti-ghosting / N-key Rollover", unit: null, icon: "keyboard" },
    ],
  },
] as const;
