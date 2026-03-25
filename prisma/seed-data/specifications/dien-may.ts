import type { SeedSpecificationGroupInput } from "./types";

// ============================================================
// MÁY GIẶT (may-giat)
// Sub: may-giat-cua-truoc, may-giat-cua-tren, may-giat-say
// ============================================================
export const mayGiatSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "launch_date", name: "Thời điểm ra mắt", unit: null, icon: "calendar" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-giat",
    name: "Thông số giặt",
    icon: "washing-machine",
    sortOrder: 2,
    specifications: [
      {
        key: "wash_capacity",
        name: "Khối lượng giặt tối đa",
        unit: "kg",
        icon: "weight",
        isFilterable: true,
        filterType: "RANGE", // Dưới 7kg, 7-9kg, Trên 9kg...
      },
      {
        key: "wash_door_type",
        name: "Loại cửa",
        unit: null,
        icon: "door",
        isFilterable: true,
        filterType: "ENUM", // Cửa trước, Cửa trên
      },
      { key: "wash_spin_speed", name: "Tốc độ vắt tối đa", unit: "vòng/phút", icon: "rotate-cw" },
      { key: "wash_motor_type", name: "Loại động cơ", unit: null, icon: "cpu" }, // Inverter, không Inverter
      {
        key: "wash_inverter",
        name: "Công nghệ Inverter",
        unit: null,
        icon: "zap",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
    ],
  },
  {
    key: "chuc-nang-giat",
    name: "Chức năng & Chương trình giặt",
    icon: "settings",
    sortOrder: 3,
    specifications: [
      { key: "wash_programs", name: "Số chương trình giặt", unit: null, icon: "list" },
      { key: "wash_special_features", name: "Tính năng đặc biệt", unit: null, icon: "star" }, // Giặt nước nóng, Sấy hơi...
      { key: "wash_steam", name: "Chức năng giặt hơi nước", unit: null, icon: "wind" },
      { key: "wash_self_clean", name: "Tự vệ sinh lồng giặt", unit: null, icon: "shield" },
      { key: "wash_quick_wash", name: "Giặt nhanh", unit: "phút", icon: "timer" },
    ],
  },
  {
    key: "say-may-giat",
    name: "Thông số sấy (nếu có)",
    icon: "wind",
    sortOrder: 4,
    specifications: [
      { key: "wash_dry_capacity", name: "Khối lượng sấy tối đa", unit: "kg", icon: "weight" },
      { key: "wash_dry_type", name: "Công nghệ sấy", unit: null, icon: "wind" },
    ],
  },
  {
    key: "ket-noi-may-giat",
    name: "Kết nối",
    icon: "wifi",
    sortOrder: 5,
    specifications: [
      {
        key: "wash_wifi",
        name: "Điều khiển qua Wifi / App",
        unit: null,
        icon: "wifi",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
    ],
  },
  {
    key: "thiet-ke-may-giat",
    name: "Thiết kế & Kích thước",
    icon: "maximize",
    sortOrder: 6,
    specifications: [
      { key: "wash_dimensions", name: "Kích thước (R x S x C)", unit: "mm", icon: "maximize" },
      { key: "wash_weight", name: "Trọng lượng", unit: "kg", icon: "weight" },
      { key: "wash_color", name: "Màu sắc", unit: null, icon: "palette" },
    ],
  },
  {
    key: "tieu-thu-dien-may-giat",
    name: "Tiêu thụ điện",
    icon: "zap",
    sortOrder: 7,
    specifications: [
      { key: "wash_power_consumption", name: "Công suất tiêu thụ điện", unit: "W", icon: "zap" },
      { key: "wash_energy_rating", name: "Chuẩn tiết kiệm điện", unit: null, icon: "leaf" },
    ],
  },
] as const;

// ============================================================
// MÁY LẠNH / ĐIỀU HÒA (may-lanh-dieu-hoa)
// Sub: 1 chiều, 2 chiều, Inverter → không cần override riêng
// ============================================================
export const mayLanhSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "launch_date", name: "Thời điểm ra mắt", unit: null, icon: "calendar" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-lanh",
    name: "Thông số làm lạnh",
    icon: "thermometer",
    sortOrder: 2,
    specifications: [
      {
        key: "ac_capacity_btu",
        name: "Công suất làm lạnh",
        unit: "BTU",
        icon: "thermometer",
        isFilterable: true,
        filterType: "ENUM", // 9000, 12000, 18000, 24000 BTU...
      },
      { key: "ac_capacity_hp", name: "Công suất (HP)", unit: "HP", icon: "zap" },
      {
        key: "ac_type",
        name: "Loại điều hòa",
        unit: null,
        icon: "settings",
        isFilterable: true,
        filterType: "ENUM", // 1 chiều, 2 chiều
      },
      {
        key: "ac_inverter",
        name: "Công nghệ Inverter",
        unit: null,
        icon: "zap",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
      { key: "ac_refrigerant", name: "Môi chất lạnh (Gas)", unit: null, icon: "wind" }, // R32, R410A...
      { key: "ac_room_size", name: "Diện tích phòng phù hợp", unit: "m²", icon: "maximize" },
    ],
  },
  {
    key: "tinh-nang-dieu-hoa",
    name: "Tính năng",
    icon: "settings",
    sortOrder: 3,
    specifications: [
      { key: "ac_heating", name: "Chế độ sưởi ấm", unit: null, icon: "sun" },
      { key: "ac_dehumidify", name: "Chế độ hút ẩm", unit: null, icon: "droplets" },
      { key: "ac_air_filter", name: "Lọc không khí", unit: null, icon: "wind" },
      { key: "ac_self_clean", name: "Tự làm sạch", unit: null, icon: "shield" },
      { key: "ac_sleep_mode", name: "Chế độ ngủ", unit: null, icon: "moon" },
      {
        key: "ac_wifi",
        name: "Điều khiển qua Wifi / App",
        unit: null,
        icon: "wifi",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
    ],
  },
  {
    key: "thiet-ke-dieu-hoa",
    name: "Thiết kế & Kích thước",
    icon: "maximize",
    sortOrder: 4,
    specifications: [
      { key: "ac_indoor_dimensions", name: "Kích thước dàn lạnh", unit: "mm", icon: "maximize" },
      { key: "ac_outdoor_dimensions", name: "Kích thước dàn nóng", unit: "mm", icon: "maximize" },
      { key: "ac_indoor_weight", name: "Trọng lượng dàn lạnh", unit: "kg", icon: "weight" },
      { key: "ac_outdoor_weight", name: "Trọng lượng dàn nóng", unit: "kg", icon: "weight" },
      { key: "ac_color", name: "Màu sắc", unit: null, icon: "palette" },
    ],
  },
  {
    key: "tieu-thu-dieu-hoa",
    name: "Tiêu thụ điện",
    icon: "zap",
    sortOrder: 5,
    specifications: [
      { key: "ac_power_consumption_cool", name: "Điện năng tiêu thụ (làm lạnh)", unit: "W", icon: "zap" },
      { key: "ac_energy_rating", name: "Chuẩn tiết kiệm điện", unit: null, icon: "leaf" },
    ],
  },
] as const;

// ============================================================
// TỦ LẠNH (tu-lanh)
// Sub: Inverter, nhiều cửa, side-by-side, mini
// ============================================================
export const tuLanhSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "launch_date", name: "Thời điểm ra mắt", unit: null, icon: "calendar" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-tu-lanh",
    name: "Thông số tủ lạnh",
    icon: "thermometer",
    sortOrder: 2,
    specifications: [
      {
        key: "fridge_capacity",
        name: "Dung tích tổng",
        unit: "lít",
        icon: "database",
        isFilterable: true,
        filterType: "RANGE", // Dưới 150L, 150-300L, 300-500L, Trên 500L...
      },
      { key: "fridge_fridge_capacity", name: "Dung tích ngăn mát", unit: "lít", icon: "thermometer" },
      { key: "fridge_freezer_capacity", name: "Dung tích ngăn đá", unit: "lít", icon: "snowflake" },
      {
        key: "fridge_door_type",
        name: "Kiểu cửa",
        unit: null,
        icon: "door",
        isFilterable: true,
        filterType: "ENUM", // 1 cửa, 2 cửa, 3 cửa, 4 cửa, Side by Side, French Door...
      },
      {
        key: "fridge_inverter",
        name: "Công nghệ Inverter",
        unit: null,
        icon: "zap",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
      { key: "fridge_refrigerant", name: "Môi chất lạnh (Gas)", unit: null, icon: "wind" },
    ],
  },
  {
    key: "tinh-nang-tu-lanh",
    name: "Tính năng",
    icon: "settings",
    sortOrder: 3,
    specifications: [
      { key: "fridge_no_frost", name: "Công nghệ làm lạnh", unit: null, icon: "snowflake" }, // No-frost, Multi Air Flow...
      { key: "fridge_temp_zone", name: "Vùng nhiệt độ", unit: null, icon: "thermometer" }, // Multi-temp zone...
      { key: "fridge_water_dispenser", name: "Ngăn lấy nước / đá ngoài", unit: null, icon: "droplets" },
      { key: "fridge_deodorizer", name: "Khử mùi", unit: null, icon: "wind" },
      {
        key: "fridge_wifi",
        name: "Điều khiển qua Wifi / App",
        unit: null,
        icon: "wifi",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
    ],
  },
  {
    key: "thiet-ke-tu-lanh",
    name: "Thiết kế & Kích thước",
    icon: "maximize",
    sortOrder: 4,
    specifications: [
      { key: "fridge_dimensions", name: "Kích thước (R x S x C)", unit: "mm", icon: "maximize" },
      { key: "fridge_weight", name: "Trọng lượng", unit: "kg", icon: "weight" },
      { key: "fridge_color", name: "Màu sắc", unit: null, icon: "palette" },
    ],
  },
  {
    key: "tieu-thu-tu-lanh",
    name: "Tiêu thụ điện",
    icon: "zap",
    sortOrder: 5,
    specifications: [
      { key: "fridge_power_consumption", name: "Điện năng tiêu thụ", unit: "kWh/năm", icon: "zap" },
      { key: "fridge_energy_rating", name: "Chuẩn tiết kiệm điện", unit: null, icon: "leaf" },
    ],
  },
] as const;

// ============================================================
// MÁY SẤY (may-say)
// Sub: sấy thông hơi, ngưng tụ, bơm nhiệt
// ============================================================
export const maySaySpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "launch_date", name: "Thời điểm ra mắt", unit: null, icon: "calendar" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-say",
    name: "Thông số sấy",
    icon: "wind",
    sortOrder: 2,
    specifications: [
      {
        key: "dryer_capacity",
        name: "Khối lượng sấy tối đa",
        unit: "kg",
        icon: "weight",
        isFilterable: true,
        filterType: "RANGE",
      },
      {
        key: "dryer_type",
        name: "Công nghệ sấy",
        unit: null,
        icon: "wind",
        isFilterable: true,
        filterType: "ENUM", // Sấy thông hơi, Sấy ngưng tụ, Sấy bơm nhiệt
      },
      {
        key: "dryer_inverter",
        name: "Công nghệ Inverter",
        unit: null,
        icon: "zap",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
      { key: "dryer_programs", name: "Số chương trình sấy", unit: null, icon: "list" },
    ],
  },
  {
    key: "thiet-ke-may-say",
    name: "Thiết kế & Kích thước",
    icon: "maximize",
    sortOrder: 3,
    specifications: [
      { key: "dryer_dimensions", name: "Kích thước (R x S x C)", unit: "mm", icon: "maximize" },
      { key: "dryer_weight", name: "Trọng lượng", unit: "kg", icon: "weight" },
    ],
  },
  {
    key: "tieu-thu-may-say",
    name: "Tiêu thụ điện",
    icon: "zap",
    sortOrder: 4,
    specifications: [
      { key: "dryer_power_consumption", name: "Điện năng tiêu thụ", unit: "W", icon: "zap" },
      { key: "dryer_energy_rating", name: "Chuẩn tiết kiệm điện", unit: null, icon: "leaf" },
    ],
  },
] as const;

// ============================================================
// TỦ ĐÔNG (tu-dong)
// ============================================================
export const tuDongSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "launch_date", name: "Thời điểm ra mắt", unit: null, icon: "calendar" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
    ],
  },
  {
    key: "thong-so-tu-dong",
    name: "Thông số tủ đông",
    icon: "snowflake",
    sortOrder: 2,
    specifications: [
      {
        key: "freezer_capacity",
        name: "Dung tích",
        unit: "lít",
        icon: "database",
        isFilterable: true,
        filterType: "RANGE",
      },
      {
        key: "freezer_type",
        name: "Kiểu tủ",
        unit: null,
        icon: "database",
        isFilterable: true,
        filterType: "ENUM", // Tủ đứng, Tủ nằm (chest)
      },
      { key: "freezer_temp_range", name: "Nhiệt độ hoạt động", unit: "°C", icon: "thermometer" },
      {
        key: "freezer_inverter",
        name: "Công nghệ Inverter",
        unit: null,
        icon: "zap",
        isFilterable: true,
        filterType: "BOOLEAN",
      },
    ],
  },
  {
    key: "thiet-ke-tu-dong",
    name: "Thiết kế & Kích thước",
    icon: "maximize",
    sortOrder: 3,
    specifications: [
      { key: "freezer_dimensions", name: "Kích thước", unit: "mm", icon: "maximize" },
      { key: "freezer_weight", name: "Trọng lượng", unit: "kg", icon: "weight" },
      { key: "freezer_color", name: "Màu sắc", unit: null, icon: "palette" },
    ],
  },
  {
    key: "tieu-thu-tu-dong",
    name: "Tiêu thụ điện",
    icon: "zap",
    sortOrder: 4,
    specifications: [{ key: "freezer_power_consumption", name: "Điện năng tiêu thụ", unit: "kWh/ngày", icon: "zap" }],
  },
] as const;
