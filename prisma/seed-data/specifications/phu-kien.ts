import type { SeedSpecificationGroupInput } from "./types";

// ============================================================
// TAI NGHE (tai-nghe-nhet-tai, tai-nghe-chup-tai, tai-nghe-khong-day)
// Dùng chung cho tất cả sub của Âm thanh > Tai nghe
// ============================================================
export const taiNgheSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-tai-nghe",
    name: "Thông số tai nghe",
    icon: "headphones",
    sortOrder: 2,
    specifications: [
      {
        key: "headphone_type",
        name: "Kiểu tai nghe",
        unit: null,
        icon: "headphones",
        isFilterable: true,
        filterType: "ENUM", // Nhét tai (IEM), Chụp tai (Over-ear), On-ear
      },
      {
        key: "headphone_connect_type",
        name: "Loại kết nối",
        unit: null,
        icon: "bluetooth",
        isFilterable: true,
        filterType: "ENUM", // Có dây, Bluetooth, True Wireless (TWS)
      },
      { key: "headphone_driver", name: "Driver (Củ loa)", unit: "mm", icon: "speaker" },
      { key: "headphone_frequency", name: "Dải tần số", unit: "Hz", icon: "activity" },
      { key: "headphone_impedance", name: "Trở kháng", unit: "Ohm", icon: "zap" },
      { key: "headphone_sensitivity", name: "Độ nhạy", unit: "dB", icon: "volume-2" },
    ],
  },
  {
    key: "tinh-nang-tai-nghe",
    name: "Tính năng",
    icon: "settings",
    sortOrder: 3,
    specifications: [
      {
        key: "headphone_anc",
        name: "Chống ồn chủ động (ANC)",
        unit: null,
        icon: "volume-x",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
      { key: "headphone_transparency", name: "Chế độ xuyên âm", unit: null, icon: "ear" },
      { key: "headphone_mic", name: "Microphone", unit: null, icon: "mic" },
      { key: "headphone_codec", name: "Codec hỗ trợ", unit: null, icon: "music" }, // SBC, AAC, aptX, LDAC...
      { key: "headphone_water_resistance", name: "Kháng nước / Bụi", unit: null, icon: "droplets" }, // IPX4, IPX5...
    ],
  },
  {
    key: "pin-tai-nghe",
    name: "Pin & Sạc",
    icon: "battery-charging",
    sortOrder: 4,
    specifications: [
      { key: "headphone_battery_life", name: "Thời lượng pin", unit: "giờ", icon: "battery-full" },
      { key: "headphone_case_battery", name: "Pin hộp sạc (TWS)", unit: "giờ", icon: "battery-charging" },
      { key: "headphone_charge_time", name: "Thời gian sạc đầy", unit: "giờ", icon: "zap" },
      { key: "headphone_charge_port", name: "Cổng sạc", unit: null, icon: "plug" }, // USB-C, Lightning...
    ],
  },
  {
    key: "thiet-ke-tai-nghe",
    name: "Thiết kế",
    icon: "maximize",
    sortOrder: 5,
    specifications: [
      { key: "headphone_weight", name: "Trọng lượng", unit: "g", icon: "weight" },
      { key: "headphone_color", name: "Màu sắc", unit: null, icon: "palette" },
      { key: "headphone_in_the_box", name: "Phụ kiện trong hộp", unit: null, icon: "box" },
    ],
  },
] as const;

// ============================================================
// LOA (loa-bluetooth, loa-karaoke, loa-vi-tinh)
// ============================================================
export const loaSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-loa",
    name: "Thông số loa",
    icon: "speaker",
    sortOrder: 2,
    specifications: [
      {
        key: "speaker_type",
        name: "Kiểu loa",
        unit: null,
        icon: "speaker",
        isFilterable: true,
        filterType: "ENUM", // Bluetooth, Vi tính 2.0/2.1, Karaoke, Soundbar...
      },
      { key: "speaker_power", name: "Công suất", unit: "W", icon: "zap" },
      { key: "speaker_frequency", name: "Dải tần số", unit: "Hz", icon: "activity" },
      { key: "speaker_driver_count", name: "Số loa / Cấu hình", unit: null, icon: "speaker" }, // 2.0, 2.1, 5.1...
    ],
  },
  {
    key: "ket-noi-loa",
    name: "Kết nối",
    icon: "bluetooth",
    sortOrder: 3,
    specifications: [
      {
        key: "speaker_connect_type",
        name: "Loại kết nối",
        unit: null,
        icon: "bluetooth",
        isFilterable: true,
        filterType: "ENUM", // Bluetooth, 3.5mm, USB, Optical...
      },
      { key: "speaker_bluetooth_version", name: "Phiên bản Bluetooth", unit: null, icon: "bluetooth" },
      { key: "speaker_aux_input", name: "Cổng AUX / 3.5mm", unit: null, icon: "headphones" },
      { key: "speaker_usb_input", name: "Cổng USB (đọc USB/thẻ nhớ)", unit: null, icon: "usb" },
    ],
  },
  {
    key: "pin-loa",
    name: "Pin & Sạc",
    icon: "battery-charging",
    sortOrder: 4,
    specifications: [
      { key: "speaker_battery_life", name: "Thời lượng pin", unit: "giờ", icon: "battery-full" },
      { key: "speaker_charge_port", name: "Cổng sạc", unit: null, icon: "plug" },
    ],
  },
  {
    key: "tinh-nang-loa",
    name: "Tính năng",
    icon: "settings",
    sortOrder: 5,
    specifications: [
      { key: "speaker_water_resistance", name: "Kháng nước / Bụi", unit: null, icon: "droplets" },
      {
        key: "speaker_special_features",
        name: "Tính năng đặc biệt",
        unit: null,
        icon: "star",
        isFilterable: true,
        filterType: "ENUM", // TWS Pair, Karaoke, Voice Assistant...
      },
      { key: "speaker_weight", name: "Trọng lượng", unit: "kg", icon: "weight" },
      { key: "speaker_color", name: "Màu sắc", unit: null, icon: "palette" },
    ],
  },
] as const;

// ============================================================
// GAMING GEAR - Chuột (chuot)
// ============================================================
export const chuotGamingSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-chuot",
    name: "Thông số chuột",
    icon: "mouse",
    sortOrder: 2,
    specifications: [
      {
        key: "mouse_connect_type",
        name: "Loại kết nối",
        unit: null,
        icon: "bluetooth",
        isFilterable: true,
        filterType: "ENUM", // Có dây, Không dây 2.4GHz, Bluetooth, Combo
      },
      { key: "mouse_sensor", name: "Cảm biến", unit: null, icon: "cpu" }, // PixArt PAW3395, Optical...
      { key: "mouse_dpi", name: "DPI tối đa", unit: "DPI", icon: "maximize" },
      { key: "mouse_buttons", name: "Số nút bấm", unit: null, icon: "mouse" },
      { key: "mouse_polling_rate", name: "Polling Rate", unit: "Hz", icon: "refresh" },
      { key: "mouse_weight", name: "Trọng lượng", unit: "g", icon: "weight" },
    ],
  },
  {
    key: "den-chuot",
    name: "Đèn LED / RGB",
    icon: "lightbulb",
    sortOrder: 3,
    specifications: [
      {
        key: "mouse_rgb",
        name: "Đèn LED / RGB",
        unit: null,
        icon: "lightbulb",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
    ],
  },
  {
    key: "pin-chuot",
    name: "Pin (chuột không dây)",
    icon: "battery-charging",
    sortOrder: 4,
    specifications: [
      { key: "mouse_battery_life", name: "Thời lượng pin", unit: "giờ", icon: "battery-full" },
      { key: "mouse_charge_port", name: "Cổng sạc", unit: null, icon: "plug" },
    ],
  },
] as const;

// ============================================================
// GAMING GEAR - Bàn phím (ban-phim)
// ============================================================
export const banPhimGamingSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-ban-phim",
    name: "Thông số bàn phím",
    icon: "keyboard",
    sortOrder: 2,
    specifications: [
      {
        key: "keyboard_layout",
        name: "Layout",
        unit: null,
        icon: "keyboard",
        isFilterable: true,
        filterType: "ENUM", // Full-size, TKL (87%), 75%, 65%, 60%...
      },
      {
        key: "keyboard_switch_type",
        name: "Loại switch",
        unit: null,
        icon: "keyboard",
        isFilterable: true,
        filterType: "ENUM", // Membrane, Mechanical, Optical, Analog...
      },
      { key: "keyboard_switch_model", name: "Switch cụ thể", unit: null, icon: "cpu" }, // Cherry MX Red, Gateron Yellow...
      {
        key: "keyboard_connect_type",
        name: "Loại kết nối",
        unit: null,
        icon: "bluetooth",
        isFilterable: true,
        filterType: "ENUM", // Có dây, Bluetooth, 2.4GHz, Combo
      },
      { key: "keyboard_anti_ghosting", name: "N-Key Rollover / Anti-ghosting", unit: null, icon: "shield" },
    ],
  },
  {
    key: "den-ban-phim",
    name: "Đèn LED / RGB",
    icon: "lightbulb",
    sortOrder: 3,
    specifications: [
      {
        key: "keyboard_rgb",
        name: "Đèn LED / RGB",
        unit: null,
        icon: "lightbulb",
        isFilterable: true,
        filterType: "ENUM", // Không, Single color, RGB...
      },
    ],
  },
  {
    key: "pin-ban-phim",
    name: "Pin (bàn phím không dây)",
    icon: "battery-charging",
    sortOrder: 4,
    specifications: [
      { key: "keyboard_battery_life", name: "Thời lượng pin", unit: "giờ", icon: "battery-full" },
      { key: "keyboard_charge_port", name: "Cổng sạc", unit: null, icon: "plug" },
    ],
  },
  {
    key: "thiet-ke-ban-phim",
    name: "Thiết kế",
    icon: "maximize",
    sortOrder: 5,
    specifications: [
      { key: "keyboard_dimensions", name: "Kích thước", unit: "mm", icon: "maximize" },
      { key: "keyboard_weight", name: "Trọng lượng", unit: "g", icon: "weight" },
      { key: "keyboard_color", name: "Màu sắc", unit: null, icon: "palette" },
    ],
  },
] as const;

// ============================================================
// PHỤ KIỆN DI ĐỘNG (phu-kien-di-dong) — đơn giản
// Sub: sac-cap, sac-du-phong, bao-da-op-lung, mieng-dan, but-cam-ung
// ============================================================
export const phuKienDiDongSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-phu-kien",
    name: "Thông số sản phẩm",
    icon: "package",
    sortOrder: 2,
    specifications: [
      {
        key: "accessory_compatible_device",
        name: "Tương thích với",
        unit: null,
        icon: "smartphone",
        isFilterable: true,
        filterType: "ENUM", // iPhone, Samsung, Universal...
      },
      { key: "accessory_material", name: "Chất liệu", unit: null, icon: "layers" },
      { key: "accessory_color", name: "Màu sắc", unit: null, icon: "palette" },
      { key: "accessory_special_features", name: "Tính năng đặc biệt", unit: null, icon: "star" },
      { key: "accessory_in_the_box", name: "Phụ kiện trong hộp", unit: null, icon: "box" },
    ],
  },
] as const;

// ============================================================
// PHỤ KIỆN LAPTOP (phu-kien-laptop) — đơn giản
// Sub: chuot-2, ban-phim-2, balo, webcam, gia-do, hub...
// ============================================================
export const phuKienLaptopSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-phu-kien-laptop",
    name: "Thông số sản phẩm",
    icon: "package",
    sortOrder: 2,
    specifications: [
      {
        key: "laptop_acc_compatible",
        name: "Tương thích với",
        unit: null,
        icon: "laptop",
        isFilterable: true,
        filterType: "ENUM", // MacBook, Windows Laptop, Universal...
      },
      { key: "laptop_acc_connect", name: "Kết nối", unit: null, icon: "link" }, // USB-C, USB-A, Bluetooth...
      { key: "laptop_acc_material", name: "Chất liệu", unit: null, icon: "layers" },
      { key: "laptop_acc_color", name: "Màu sắc", unit: null, icon: "palette" },
      { key: "laptop_acc_features", name: "Tính năng đặc biệt", unit: null, icon: "star" },
      { key: "laptop_acc_in_the_box", name: "Phụ kiện trong hộp", unit: null, icon: "box" },
    ],
  },
] as const;
