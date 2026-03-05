export interface ProductSpecificationSeed {
  productSlug: string;
  specifications: Array<{
    key: string;
    value: string;
  }>;
}

export const productSpecificationsData: ProductSpecificationSeed[] = [
  {
    productSlug: "iphone-13",
    specifications: [
      // --- Thông tin hàng hóa ---
      { key: "origin", value: "Trung Quốc" },
      { key: "launch_date", value: "01/2022" },
      { key: "warranty_period", value: "12" },
      { key: "usage_guide", value: "Để nơi khô ráo, nhẹ tay, dễ vỡ. Xem thêm trong sách HDSD." },

      // --- Thiết kế & Trọng lượng ---
      { key: "dimensions", value: "71.5 x 7.4 x 146.7" },
      { key: "weight", value: "164" },
      { key: "water_resistance", value: "IP68" }, // Mặc định iPhone 13 đạt chuẩn này
      { key: "material", value: "Khung nhôm, mặt lưng kính, Ceramic Shield" },

      // --- Bộ xử lý ---
      { key: "cpu_version", value: "Apple A15 Bionic" },
      { key: "cpu_type", value: "6-core CPU" },
      { key: "cpu_cores", value: "6" },
      { key: "cpu_speed", value: "3.22" },

      // --- RAM & Lưu trữ ---
      { key: "ram_capacity", value: "4" },
      { key: "ram_type", value: "LPDDR4X" },
      { key: "rom_capacity", value: "128" },
      { key: "external_storage", value: "Không" },

      // --- Màn hình ---
      { key: "screen_size", value: "6.1" },
      { key: "screen_tech", value: "OLED" },
      { key: "screen_standard", value: "Super Retina XDR" },
      { key: "screen_resolution", value: "2532 x 1170" },
      { key: "screen_color", value: "16 Triệu màu, P3 color gamut" },
      { key: "refresh_rate", value: "60" },
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "pixel_density", value: "460" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "contrast_ratio", value: "2.000.000:1" },

      // --- Đồ họa ---
      { key: "gpu_chip", value: "Apple GPU 4 nhân" },

      // --- Camera sau ---
      { key: "rear_camera_count", value: "2" },
      { key: "rear_cam_1", value: "12.0 MP (Wide), f/1.6" },
      { key: "rear_cam_2", value: "12.0 MP (Ultra Wide), f/2.4" },
      { key: "rear_cam_3", value: "Không hỗ trợ" },
      { key: "rear_video_record", value: "4K@24/30/60fps, 1080p@30/60/120/240fps, HDR Dolby Vision" },
      {
        key: "rear_cam_features",
        value: "Ban đêm (Night Mode), Chống rung quang học (OIS), Cinematic Mode, Deep Fusion, Smart HDR 4, Xóa phông",
      },

      // --- Camera Selfie ---
      { key: "selfie_camera_count", value: "1" },
      { key: "selfie_cam_1", value: "12.0 MP, f/2.2" },
      { key: "selfie_video_record", value: "4K@24/25/30/60fps, 1080p@30/60/120fps" },
      { key: "selfie_cam_features", value: "Xoá phông, Tự động lấy nét (AF), Nhận diện khuôn mặt, HDR, Night Mode" },

      // --- Cảm biến & Bảo mật ---
      { key: "sensors", value: "Face ID, Áp kế, Gia tốc kế, Tiệm cận, Con quay hồi chuyển, Ánh sáng" },
      { key: "security", value: "Mở khóa khuôn mặt (Face ID), Mật mã" },

      // --- Giao tiếp và kết nối ---
      { key: "sim_type", value: "1 Nano SIM & 1 eSIM" },
      { key: "sim_slots", value: "1" },
      { key: "network_support", value: "5G" },
      { key: "charging_port", value: "Lightning" },
      { key: "wifi_version", value: "Wi-Fi 6 (802.11 ax)" },
      { key: "gps_tech", value: "GPS, GLONASS, Galileo, QZSS, BeiDou" },
      { key: "bluetooth_version", value: "v5.0" },
      { key: "other_connect", value: "NFC, AirDrop" },

      // --- Thông tin pin & sạc ---
      { key: "battery_type", value: "Lithium-ion" },
      { key: "battery_capacity", value: "3225" },
      { key: "battery_life", value: "19" }, // Thời gian xem video tối đa
      { key: "charger_in_box", value: "Không (Chỉ có cáp)" },
      { key: "battery_more_info", value: "Sạc nhanh 20W, Sạc không dây MagSafe 15W, Sạc không dây Qi 7.5W" },

      // --- Hệ điều hành ---
      { key: "os_name", value: "iOS" },
      { key: "os_version", value: "iOS 15" },

      // --- Tiện ích & Phụ kiện ---
      { key: "led_notification", value: "Không" },
      { key: "special_features", value: "Kháng nước IP68, Apple Pay, Cinematic Mode" },
      { key: "in_the_box", value: "Máy, Cáp USB-C to Lightning, Sách HDSD, Que lấy SIM" },
    ],
  },
  {
    productSlug: "iphone-14",
    specifications: [
      // --- Thông tin hàng hóa ---
      { key: "origin", value: "Trung Quốc" },
      { key: "launch_date", value: "09/2022" },
      { key: "warranty_period", value: "12" }, // Filter: 12 tháng
      { key: "usage_guide", value: "Để nơi khô ráo, nhẹ tay, dễ vỡ. Xem trong sách hướng dẫn sử dụng" },

      // --- Thiết kế & Trọng lượng ---
      { key: "dimensions", value: "146.7 x 71.5 x 7.8" }, // Bỏ "mm"
      { key: "weight", value: "172" }, // Bỏ "g" để sau này có thể lọc cân nặng
      { key: "water_resistance", value: "IP68" },
      { key: "material", value: "Khung nhôm, mặt lưng kính" }, // Tự động mapping từ đặc tính iPhone 14

      // --- Bộ xử lý ---
      { key: "cpu_version", value: "Apple A15 Bionic" },
      { key: "cpu_type", value: "6-core" },
      { key: "cpu_cores", value: "6" },
      { key: "cpu_speed", value: "3.22" }, // Bỏ "GHz"

      // --- RAM & Lưu trữ ---
      { key: "ram_capacity", value: "6" }, // Filter: ENUM "6"
      { key: "ram_type", value: "LPDDR4X" },
      { key: "rom_capacity", value: "128" },
      { key: "external_storage", value: "Không" }, // Filter: ENUM "Không"

      // --- Màn hình ---
      { key: "screen_size", value: "6.1" }, // Filter: RANGE 6.1
      { key: "screen_tech", value: "OLED" },
      { key: "screen_standard", value: "Super Retina XDR" }, // Filter: ENUM
      { key: "screen_resolution", value: "2532 x 1170" },
      { key: "screen_color", value: "16 Triệu" },
      { key: "refresh_rate", value: "60" }, // Filter: ENUM "60"
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "pixel_density", value: "460" },
      { key: "max_brightness", value: "1200" }, // Filter: RANGE 1200
      { key: "contrast_ratio", value: "2.000.000:1" },

      // --- Đồ họa ---
      { key: "gpu_chip", value: "Apple GPU 5 nhân" },

      // --- Camera sau ---
      { key: "rear_camera_count", value: "2" },
      { key: "rear_cam_1", value: "12.0 MP (Wide)" },
      { key: "rear_cam_2", value: "12.0 MP (Ultra Wide)" },
      { key: "rear_cam_3", value: "Không có" },
      {
        key: "rear_video_record",
        value: "4K@60fps, 4K@30fps, 4K@24fps, 1080p@60fps, 1080p@30fps, 1080p@25fps, 720p@30fps",
      },
      {
        key: "rear_cam_features",
        value: "Chống rung OIS, HDR, Ban đêm (Night Mode), Chụp chân dung, Toàn cảnh (Panorama)",
      }, // Gộp các tính năng phổ biến để Filter ENUM

      // --- Camera Selfie ---
      { key: "selfie_camera_count", value: "1" },
      { key: "selfie_cam_1", value: "12.0 MP" },
      { key: "selfie_video_record", value: "4K, FullHD, HD" },
      { key: "selfie_cam_features", value: "Nhận diện khuôn mặt, HDR, Chụp chân dung" },

      // --- Cảm biến & Bảo mật ---
      { key: "sensors", value: "Cảm biến tiệm cận, Gia tốc kế, Con quay hồi chuyển, Áp kế" },
      { key: "security", value: "Mở khóa khuôn mặt, Mở khóa bằng mật mã" },

      // --- Giao tiếp và kết nối ---
      { key: "sim_type", value: "1 eSIM, 1 Nano SIM" },
      { key: "sim_slots", value: "1" },
      { key: "network_support", value: "5G" }, // Filter: ENUM "5G"
      { key: "charging_port", value: "Lightning" },
      { key: "wifi_version", value: "802.11 ax" },
      { key: "gps_tech", value: "BEIDOU, GALILEO, GLONASS, GPS, QZSS" },
      { key: "bluetooth_version", value: "v5.3" }, // Apple nâng cấp BT trên iP14
      { key: "other_connect", value: "NFC" }, // Filter: ENUM "NFC"

      // --- Thông tin pin & sạc ---
      { key: "battery_type", value: "Lithium-ion" },
      { key: "battery_capacity", value: "3279" }, // Filter: RANGE 3279
      { key: "battery_life", value: "20" },
      { key: "charger_in_box", value: "Không (Chỉ có cáp)" },
      { key: "battery_more_info", value: "Sạc nhanh, Sạc không dây MagSafe" },

      // --- Hệ điều hành ---
      { key: "os_name", value: "iOS" }, // Filter: ENUM "iOS"
      { key: "os_version", value: "iOS 16" },

      // --- Tiện ích & Phụ kiện ---
      { key: "led_notification", value: "Không" },
      { key: "special_features", value: "Phát hiện va chạm, SOS khẩn cấp qua vệ tinh" },
      { key: "in_the_box", value: "Cáp, Sách HDSD, Que lấy SIM" },
    ],
  },

  {
    productSlug: "iphone-15",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "iphone-16",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "iphone-16-pro",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "iphone-16-plus",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "iphone-16-pro-max",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "iphone-17",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "iphone-17-pro",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "iphone-17-pro-max",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "macbook-air-13-m4-2025-10cpu-8gpu-16gb-256gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "macbook-air-13-m2-2024-8cpu-8gpu-16gb-256gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "macbook-air-13-m4-2025-10cpu-10gpu-16gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  {
    productSlug: "macbook-air-13-m4-2025-10cpu-10gpu-24gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-air-13-m4-2025-10cpu-10gpu-24gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-air-15-m4-2025-10cpu-10gpu-16gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-air-15-m4-2025-10cpu-10gpu-16gb-256gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-air-15-inch-m2-2023-8cpu-10gpu-8gb-512gb-sac-70w",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m4-pro-2024-12cpu-16gpu-24gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m4-pro-2024-14cpu-20gpu-24gb-1tb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-14-2023-m3-pro-12-cpu-18-gpu-18gb-1tb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m4-max-2024-14cpu-32gpu-36gb-1tb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m5-2025-10cpu-10gpu-16gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m5-2025-10cpu-10gpu-24gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m4-pro-2024-14cpu-20gpu-24gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m4-pro-2024-14cpu-20gpu-48gb-512gb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m4-max-2024-14cpu-32gpu-36gb-1tb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m4-max-2024-16cpu-40gpu-48gb-1tb",
    specifications: [
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  /* --- SAMSUNG SERIES --- */
  {
    productSlug: "samsung-galaxy-z-fold7-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "max_brightness", value: "2600" },
      { key: "selfie_camera_count", value: "2" },
    ],
  },
  {
    productSlug: "samsung-galaxy-z-flip7-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "max_brightness", value: "2600" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-a56-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-a36-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s25-ultra-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Corning Gorilla Armor" },
      { key: "max_brightness", value: "3000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s25-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "max_brightness", value: "2400" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s25-plus-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "max_brightness", value: "2400" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s25-fe-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "max_brightness", value: "1900" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-a26-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "800" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-z-fold6-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "max_brightness", value: "2600" },
      { key: "selfie_camera_count", value: "2" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s24-fe-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "max_brightness", value: "1900" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s25-edge-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "max_brightness", value: "2500" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "samsung-galaxy-s24-ultra-5g",
    specifications: [
      { key: "screen_glass", value: "Corning Gorilla Armor" },
      { key: "max_brightness", value: "2600" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  /* --- XIAOMI SERIES --- */
  {
    productSlug: "xiaomi-poco-f8-pro-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus" },
      { key: "max_brightness", value: "4000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-poco-x7-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "max_brightness", value: "1800" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-poco-m7-pro-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "1300" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-poco-m6-pro-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "max_brightness", value: "1300" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-poco-c71-4gb",
    specifications: [
      { key: "screen_glass", value: "Tempered Glass" },
      { key: "max_brightness", value: "600" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-note-15-pro-5g-12gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus" },
      { key: "max_brightness", value: "2000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-note-15-5g-6gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-note-15-6gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-note-14-pro-plus-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "max_brightness", value: "3000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-note-14-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-note-14-6gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-15-5g-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "1000" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-14c-4gb",
    specifications: [
      { key: "screen_glass", value: "Tempered Glass" },
      { key: "max_brightness", value: "600" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },
  {
    productSlug: "xiaomi-redmi-13x-8gb",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "max_brightness", value: "800" },
      { key: "selfie_camera_count", value: "1" },
    ],
  },

  /* --- AIR CONDITIONERS --- */
  {
    productSlug: "comfee-inverter-1-5-hp-cfs-13vgp",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
  {
    productSlug: "casper-inverter-1-5-hp-gc-12ib36",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
  {
    productSlug: "casper-inverter-1-hp-tc-09is35",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
  {
    productSlug: "casper-inverter-1-5-hp-gc-12is35",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },

  /* --- ACCESSORIES --- */
  {
    productSlug: "tai-nghe-co-day-apple-earpods-usb-c-2023-myqy3za-a",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
  {
    productSlug: "tai-nghe-co-day-apple-earpods-lightning-mwty3za-a",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
  {
    productSlug: "tai-nghe-co-day-apple-earpods-lightning-mmtn2za-a",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
  {
    productSlug: "tai-nghe-apple-airpods-pro-3-2025-usb-c",
    specifications: [
      { key: "screen_glass", value: "None" },
      { key: "max_brightness", value: "None" },
      { key: "selfie_camera_count", value: "0" },
    ],
  },
];
