import type { SeedSpecificationGroupInput } from "./types";

/**
 * Spec cho Tivi (category cha: tivi)
 * Các sub: tivi-qled, tivi-4k, google-tv → không cần override riêng
 */
export const tiviSpecificationGroups: SeedSpecificationGroupInput[] = [
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
    key: "man-hinh-tivi",
    name: "Màn hình",
    icon: "tv",
    sortOrder: 2,
    specifications: [
      {
        key: "tivi_screen_size",
        name: "Kích thước màn hình",
        unit: "inch",
        icon: "tv",
        isFilterable: true,
        filterType: "ENUM", // 32", 40", 43", 50", 55", 65", 75", 85"...
      },
      {
        key: "tivi_screen_tech",
        name: "Công nghệ màn hình",
        unit: null,
        icon: "monitor",
        isFilterable: true,
        filterType: "ENUM", // OLED, QLED, NanoCell, LED, MINI LED...
      },
      {
        key: "tivi_resolution",
        name: "Độ phân giải",
        unit: null,
        icon: "grid",
        isFilterable: true,
        filterType: "ENUM", // 4K UHD, Full HD, 8K...
      },
      {
        key: "tivi_refresh_rate",
        name: "Tần số quét",
        unit: "Hz",
        icon: "refresh",
        isFilterable: true,
        filterType: "ENUM", // 60Hz, 120Hz...
      },
      { key: "tivi_hdr", name: "Chuẩn HDR hỗ trợ", unit: null, icon: "sun" }, // HDR10+, Dolby Vision...
      { key: "tivi_brightness", name: "Độ sáng tối đa", unit: "nits", icon: "sun" },
      { key: "tivi_color", name: "Dải màu / Độ phủ màu", unit: null, icon: "palette" },
    ],
  },
  {
    key: "bo-xu-ly-tivi",
    name: "Bộ xử lý",
    icon: "cpu",
    sortOrder: 3,
    specifications: [
      { key: "tivi_cpu", name: "Bộ xử lý", unit: null, icon: "cpu" },
      { key: "tivi_ram", name: "RAM", unit: "GB", icon: "ram" },
      { key: "tivi_rom", name: "Bộ nhớ trong", unit: "GB", icon: "storage" },
    ],
  },
  {
    key: "am-thanh-tivi",
    name: "Âm thanh",
    icon: "volume-2",
    sortOrder: 4,
    specifications: [
      { key: "tivi_audio_power", name: "Công suất loa", unit: "W", icon: "speaker" },
      { key: "tivi_audio_tech", name: "Công nghệ âm thanh", unit: null, icon: "music" }, // Dolby Atmos, DTS...
      { key: "tivi_speaker_count", name: "Số loa", unit: null, icon: "speaker" },
    ],
  },
  {
    key: "he-dieu-hanh-tivi",
    name: "Hệ điều hành",
    icon: "smartphone",
    sortOrder: 5,
    specifications: [
      {
        key: "tivi_os",
        name: "Hệ điều hành Smart TV",
        unit: null,
        icon: "os",
        isFilterable: true,
        filterType: "ENUM", // Google TV, Tizen, webOS, Android TV...
      },
      { key: "tivi_os_version", name: "Phiên bản hệ điều hành", unit: null, icon: "os-version" },
      { key: "tivi_voice_assistant", name: "Trợ lý giọng nói", unit: null, icon: "mic" }, // Google Assistant, Alexa, Bixby...
    ],
  },
  {
    key: "ket-noi-tivi",
    name: "Kết nối",
    icon: "wifi",
    sortOrder: 6,
    specifications: [
      { key: "tivi_hdmi_ports", name: "Cổng HDMI", unit: null, icon: "hdmi" },
      { key: "tivi_usb_ports", name: "Cổng USB", unit: null, icon: "usb" },
      { key: "tivi_wifi", name: "Wifi", unit: null, icon: "wifi" },
      { key: "tivi_bluetooth", name: "Bluetooth", unit: null, icon: "bluetooth" },
      { key: "tivi_other_ports", name: "Cổng khác", unit: null, icon: "link" }, // Optical, LAN, AV...
    ],
  },
  {
    key: "thiet-ke-tivi",
    name: "Thiết kế",
    icon: "maximize",
    sortOrder: 7,
    specifications: [
      { key: "tivi_dimensions_with_stand", name: "Kích thước (có chân)", unit: "mm", icon: "maximize" },
      { key: "tivi_dimensions_without_stand", name: "Kích thước (không chân)", unit: "mm", icon: "maximize" },
      { key: "tivi_weight_with_stand", name: "Trọng lượng (có chân)", unit: "kg", icon: "weight" },
      { key: "tivi_weight_without_stand", name: "Trọng lượng (không chân)", unit: "kg", icon: "weight" },
      { key: "tivi_vesa", name: "Chuẩn treo tường VESA", unit: null, icon: "anchor" },
    ],
  },
  {
    key: "tien-ich-tivi",
    name: "Tiện ích",
    icon: "plus-square",
    sortOrder: 8,
    specifications: [
      {
        key: "tivi_special_features",
        name: "Tính năng đặc biệt",
        unit: null,
        icon: "star",
        isFilterable: true,
        filterType: "ENUM", // AI Upscaling, Game Mode, Sports Mode...
      },
      { key: "tivi_in_the_box", name: "Phụ kiện trong hộp", unit: null, icon: "box" },
      { key: "tivi_power_consumption", name: "Công suất tiêu thụ điện", unit: "W", icon: "zap" },
    ],
  },
] as const;
