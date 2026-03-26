import type { SeedSpecificationGroupInput } from "./types";

/**
 * Spec chung cho TẤT CẢ laptop (category cha: laptop)
 * Các category con gaming sẽ ghi đè thêm key riêng
 */
export const laptopSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [
      { key: "origin", name: "Xuất xứ", unit: null, icon: "globe" },
      { key: "launch_date", name: "Thời điểm ra mắt", unit: null, icon: "calendar" },
      { key: "warranty_period", name: "Thời gian bảo hành", unit: "tháng", icon: "shield-check" },
      { key: "usage_guide", name: "Hướng dẫn sử dụng/bảo quản", unit: null, icon: "book-open" },
    ],
  },
  {
    key: "thiet-ke-laptop",
    name: "Thiết kế & Trọng lượng",
    icon: "maximize",
    sortOrder: 2,
    specifications: [
      { key: "laptop_dimensions", name: "Kích thước", unit: "mm", icon: "maximize" },
      { key: "laptop_weight", name: "Trọng lượng", unit: "kg", icon: "weight" },
      { key: "laptop_material", name: "Chất liệu vỏ máy", unit: null, icon: "layers" },
      { key: "laptop_color", name: "Màu sắc", unit: null, icon: "palette" },
      {
        key: "laptop_form_factor",
        name: "Kiểu dáng",
        unit: null,
        icon: "laptop",
        isFilterable: true,
        filterType: "ENUM", // Laptop thường, 2-in-1, Ultrabook...
      },
    ],
  },
  {
    key: "man-hinh-laptop",
    name: "Màn hình",
    icon: "monitor",
    sortOrder: 3,
    specifications: [
      {
        key: "laptop_screen_size",
        name: "Kích thước màn hình",
        unit: "inch",
        icon: "screen",
        isFilterable: true,
        filterType: "ENUM", // 13", 14", 15.6", 16"...
      },
      { key: "laptop_screen_tech", name: "Công nghệ màn hình", unit: null, icon: "monitor" },
      { key: "laptop_screen_resolution", name: "Độ phân giải", unit: null, icon: "grid" },
      {
        key: "laptop_refresh_rate",
        name: "Tần số quét",
        unit: "Hz",
        icon: "refresh",
        isFilterable: true,
        filterType: "ENUM", // 60Hz, 90Hz, 120Hz, 144Hz, 165Hz...
      },
      { key: "laptop_screen_brightness", name: "Độ sáng tối đa", unit: "nits", icon: "sun" },
      { key: "laptop_color_gamut", name: "Độ phủ màu", unit: null, icon: "palette" },
      { key: "laptop_touch_screen", name: "Màn hình cảm ứng", unit: null, icon: "touch" },
    ],
  },
  {
    key: "bo-xu-ly-laptop",
    name: "Bộ xử lý (CPU)",
    icon: "cpu",
    sortOrder: 4,
    specifications: [
      {
        key: "laptop_cpu_brand",
        name: "Hãng CPU",
        unit: null,
        icon: "cpu",
        isFilterable: true,
        filterType: "ENUM", // Intel, AMD, Apple Silicon
      },
      { key: "laptop_cpu_version", name: "Phiên bản CPU", unit: null, icon: "cpu" },
      { key: "laptop_cpu_cores", name: "Số nhân / Số luồng", unit: null, icon: "cpu-chip" },
      { key: "laptop_cpu_speed", name: "Tốc độ tối đa", unit: "GHz", icon: "zap" },
      { key: "laptop_cpu_cache", name: "Cache CPU", unit: "MB", icon: "database" },
    ],
  },
  {
    key: "ram-laptop",
    name: "RAM",
    icon: "database",
    sortOrder: 5,
    specifications: [
      {
        key: "laptop_ram_capacity",
        name: "Dung lượng RAM",
        unit: "GB",
        icon: "ram",
        isFilterable: true,
        filterType: "ENUM", // 8GB, 16GB, 32GB, 64GB...
      },
      { key: "laptop_ram_type", name: "Loại RAM", unit: null, icon: "ram-fill" }, // DDR4, DDR5, LPDDR5X...
      { key: "laptop_ram_speed", name: "Tốc độ RAM", unit: "MHz", icon: "zap" },
      { key: "laptop_ram_upgradable", name: "Khả năng nâng cấp RAM", unit: null, icon: "upgrade" },
    ],
  },
  {
    key: "luu-tru-laptop",
    name: "Ổ cứng lưu trữ",
    icon: "hard-drive",
    sortOrder: 6,
    specifications: [
      {
        key: "laptop_storage_capacity",
        name: "Dung lượng",
        unit: "GB",
        icon: "hard-drive",
        isFilterable: true,
        filterType: "ENUM", // 256GB, 512GB, 1TB, 2TB...
      },
      { key: "laptop_storage_type", name: "Loại ổ cứng", unit: null, icon: "storage" }, // SSD NVMe, SSD SATA...
      { key: "laptop_storage_speed", name: "Tốc độ đọc/ghi", unit: null, icon: "zap" },
      { key: "laptop_storage_slots", name: "Số khe M.2", unit: null, icon: "slots" },
    ],
  },
  {
    key: "do-hoa-laptop",
    name: "Card đồ họa (GPU)",
    icon: "gpu",
    sortOrder: 7,
    specifications: [
      {
        key: "laptop_gpu_type",
        name: "Loại GPU",
        unit: null,
        icon: "gpu",
        isFilterable: true,
        filterType: "ENUM", // Onboard, Rời (Dedicated)
      },
      { key: "laptop_gpu_brand", name: "Hãng GPU", unit: null, icon: "gpu-brand" }, // NVIDIA, AMD, Intel, Apple
      { key: "laptop_gpu_model", name: "Model GPU", unit: null, icon: "gpu-model" },
      { key: "laptop_gpu_vram", name: "VRAM", unit: "GB", icon: "database" },
    ],
  },
  {
    key: "ket-noi-laptop",
    name: "Cổng giao tiếp & Kết nối",
    icon: "wifi",
    sortOrder: 8,
    specifications: [
      { key: "laptop_usb_ports", name: "Cổng USB", unit: null, icon: "usb" },
      { key: "laptop_usbc_ports", name: "Cổng USB-C / Thunderbolt", unit: null, icon: "usb-c" },
      { key: "laptop_hdmi", name: "Cổng HDMI", unit: null, icon: "hdmi" },
      { key: "laptop_sd_card", name: "Khe đọc thẻ nhớ", unit: null, icon: "sd-card" },
      { key: "laptop_audio_jack", name: "Jack audio 3.5mm", unit: null, icon: "headphones" },
      { key: "laptop_wifi", name: "Wifi", unit: null, icon: "wifi" },
      { key: "laptop_bluetooth", name: "Bluetooth", unit: null, icon: "bluetooth" },
      {
        key: "laptop_other_connect",
        name: "Kết nối khác",
        unit: null,
        icon: "link",
        isFilterable: true,
        filterType: "ENUM", // 4G/LTE, NFC...
      },
    ],
  },
  {
    key: "am-thanh-laptop",
    name: "Âm thanh",
    icon: "volume-2",
    sortOrder: 9,
    specifications: [
      { key: "laptop_speaker", name: "Loa", unit: null, icon: "speaker" },
      { key: "laptop_microphone", name: "Microphone", unit: null, icon: "mic" },
      { key: "laptop_audio_tech", name: "Công nghệ âm thanh", unit: null, icon: "music" },
    ],
  },
  {
    key: "webcam-laptop",
    name: "Camera & Bảo mật",
    icon: "camera",
    sortOrder: 10,
    specifications: [
      { key: "laptop_webcam", name: "Webcam", unit: null, icon: "camera" },
      { key: "laptop_security", name: "Bảo mật", unit: null, icon: "lock" }, // Vân tay, Face ID, TPM...
    ],
  },
  {
    key: "pin-laptop",
    name: "Pin & Sạc",
    icon: "battery-charging",
    sortOrder: 11,
    specifications: [
      {
        key: "laptop_battery_capacity",
        name: "Dung lượng pin",
        unit: "Whr",
        icon: "battery-full",
        isFilterable: true,
        filterType: "RANGE",
      },
      { key: "laptop_battery_life", name: "Thời gian sử dụng tối đa", unit: "giờ", icon: "battery-charging" },
      { key: "laptop_charger_watt", name: "Công suất sạc", unit: "W", icon: "zap" },
      { key: "laptop_charger_port", name: "Cổng sạc", unit: null, icon: "plug" }, // USB-C, DC...
    ],
  },
  {
    key: "he-dieu-hanh-laptop",
    name: "Hệ điều hành",
    icon: "laptop",
    sortOrder: 12,
    specifications: [
      {
        key: "laptop_os",
        name: "Hệ điều hành",
        unit: null,
        icon: "os",
        isFilterable: true,
        filterType: "ENUM", // Windows 11, macOS, Linux, No OS
      },
      { key: "laptop_os_version", name: "Phiên bản hệ điều hành", unit: null, icon: "os-version" },
    ],
  },
  {
    key: "tien-ich-laptop",
    name: "Tiện ích & Phụ kiện",
    icon: "plus-square",
    sortOrder: 13,
    specifications: [
      { key: "laptop_keyboard", name: "Bàn phím", unit: null, icon: "keyboard" }, // Backlit, RGB...
      { key: "laptop_special_features", name: "Tính năng đặc biệt", unit: null, icon: "star" },
      { key: "laptop_in_the_box", name: "Phụ kiện trong hộp", unit: null, icon: "box" },
    ],
  },
] as const;
