export interface ProductSpecificationSeed {
  productSlug: string;
  specifications: Array<{
    key: string;
    value: string;
  }>;
}

export const productSpecificationsData: ProductSpecificationSeed[] = [
  // ================================================================
  // IPHONE
  // ================================================================
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
      { key: "water_resistance", value: "IP68" },
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
      { key: "battery_life", value: "19" },
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
      { key: "warranty_period", value: "12" },
      { key: "usage_guide", value: "Để nơi khô ráo, nhẹ tay, dễ vỡ. Xem trong sách hướng dẫn sử dụng" },

      // --- Thiết kế & Trọng lượng ---
      { key: "dimensions", value: "146.7 x 71.5 x 7.8" },
      { key: "weight", value: "172" },
      { key: "water_resistance", value: "IP68" },
      { key: "material", value: "Khung nhôm, mặt lưng kính" },

      // --- Bộ xử lý ---
      { key: "cpu_version", value: "Apple A15 Bionic" },
      { key: "cpu_type", value: "6-core" },
      { key: "cpu_cores", value: "6" },
      { key: "cpu_speed", value: "3.22" },

      // --- RAM & Lưu trữ ---
      { key: "ram_capacity", value: "6" },
      { key: "ram_type", value: "LPDDR4X" },
      { key: "rom_capacity", value: "128" },
      { key: "external_storage", value: "Không" },

      // --- Màn hình ---
      { key: "screen_size", value: "6.1" },
      { key: "screen_tech", value: "OLED" },
      { key: "screen_standard", value: "Super Retina XDR" },
      { key: "screen_resolution", value: "2532 x 1170" },
      { key: "screen_color", value: "16 Triệu" },
      { key: "refresh_rate", value: "60" },
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "pixel_density", value: "460" },
      { key: "max_brightness", value: "1200" },
      { key: "contrast_ratio", value: "2.000.000:1" },

      // --- Đồ họa ---
      { key: "gpu_chip", value: "Apple GPU 5 nhân" },

      // --- Camera sau ---
      { key: "rear_camera_count", value: "2" },
      { key: "rear_cam_1", value: "12.0 MP (Wide)" },
      { key: "rear_cam_2", value: "12.0 MP (Ultra Wide)" },
      { key: "rear_cam_3", value: "Không có" },
      { key: "rear_video_record", value: "4K@60fps, 4K@30fps, 4K@24fps, 1080p@60fps, 1080p@30fps" },
      { key: "rear_cam_features", value: "Chống rung OIS, HDR, Ban đêm (Night Mode), Chụp chân dung, Toàn cảnh (Panorama)" },

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
      { key: "network_support", value: "5G" },
      { key: "charging_port", value: "Lightning" },
      { key: "wifi_version", value: "802.11 ax" },
      { key: "gps_tech", value: "BEIDOU, GALILEO, GLONASS, GPS, QZSS" },
      { key: "bluetooth_version", value: "v5.3" },
      { key: "other_connect", value: "NFC" },

      // --- Thông tin pin & sạc ---
      { key: "battery_type", value: "Lithium-ion" },
      { key: "battery_capacity", value: "3279" },
      { key: "battery_life", value: "20" },
      { key: "charger_in_box", value: "Không (Chỉ có cáp)" },
      { key: "battery_more_info", value: "Sạc nhanh, Sạc không dây MagSafe" },

      // --- Hệ điều hành ---
      { key: "os_name", value: "iOS" },
      { key: "os_version", value: "iOS 16" },

      // --- Tiện ích & Phụ kiện ---
      { key: "led_notification", value: "Không" },
      { key: "special_features", value: "Phát hiện va chạm, SOS khẩn cấp qua vệ tinh" },
      { key: "in_the_box", value: "Cáp, Sách HDSD, Que lấy SIM" },
    ],
  },

  // highlights: cpu_type | rom_capacity | rear_cam_1
  {
    productSlug: "iphone-15",
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "128" },
      { key: "rear_cam_1", value: "48.0 MP (Main), f/1.6" },
    ],
  },
  {
    productSlug: "iphone-16",
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "128" },
      { key: "rear_cam_1", value: "48.0 MP (Main), f/1.6" },
    ],
  },
  {
    productSlug: "iphone-16-plus",
    // highlights: cpu_type | rom_capacity | battery_capacity
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "128" },
      { key: "battery_capacity", value: "4685" },
    ],
  },
  {
    productSlug: "iphone-16-pro-max",
    // highlights: cpu_type | rom_capacity | rear_cam_1
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "256" },
      { key: "rear_cam_1", value: "48.0 MP (Main), f/1.78" },
    ],
  },
  {
    productSlug: "iphone-17",
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "128" },
      { key: "rear_cam_1", value: "48.0 MP (Main), f/1.6" },
    ],
  },
  {
    productSlug: "iphone-17-pro",
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "256" },
      { key: "rear_cam_1", value: "48.0 MP (Main), f/1.78" },
    ],
  },
  {
    productSlug: "iphone-17-pro-max",
    specifications: [
      { key: "cpu_type", value: "6-core CPU (2P + 4E)" },
      { key: "rom_capacity", value: "256" },
      { key: "rear_cam_1", value: "48.0 MP (Main), f/1.78" },
    ],
  },

  // ================================================================
  // MACBOOK — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_storage_capacity / laptop_gpu_model
  // ================================================================
  {
    productSlug: "macbook-air-13-m2",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M2" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "256" },
    ],
  },
  {
    productSlug: "macbook-air-13-m3",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M3" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "256" },
    ],
  },
  {
    productSlug: "macbook-air-13-m5",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M5" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "macbook-air-15-m3",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M3" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "macbook-air-15-m5",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M5" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m4",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M4" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_gpu_model", value: "Apple M4 GPU 10-core" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m4-pro",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M4 Pro" },
      { key: "laptop_ram_capacity", value: "24" },
      { key: "laptop_gpu_model", value: "Apple M4 Pro GPU 20-core" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m4-max",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M4 Max" },
      { key: "laptop_ram_capacity", value: "36" },
      { key: "laptop_gpu_model", value: "Apple M4 Max GPU 32-core" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m5-pro",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M5 Pro" },
      { key: "laptop_ram_capacity", value: "24" },
      { key: "laptop_gpu_model", value: "Apple M5 Pro GPU 20-core" },
    ],
  },
  {
    productSlug: "macbook-pro-14-m5-max",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M5 Max" },
      { key: "laptop_ram_capacity", value: "36" },
      { key: "laptop_gpu_model", value: "Apple M5 Max GPU 32-core" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m4-pro",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M4 Pro" },
      { key: "laptop_ram_capacity", value: "24" },
      { key: "laptop_gpu_model", value: "Apple M4 Pro GPU 20-core" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m4-max",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M4 Max" },
      { key: "laptop_ram_capacity", value: "36" },
      { key: "laptop_gpu_model", value: "Apple M4 Max GPU 32-core" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m5-pro",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M5 Pro" },
      { key: "laptop_ram_capacity", value: "24" },
      { key: "laptop_gpu_model", value: "Apple M5 Pro GPU 20-core" },
    ],
  },
  {
    productSlug: "macbook-pro-16-m5-max",
    specifications: [
      { key: "laptop_cpu_version", value: "Apple M5 Max" },
      { key: "laptop_ram_capacity", value: "36" },
      { key: "laptop_gpu_model", value: "Apple M5 Max GPU 32-core" },
    ],
  },

  // ================================================================
  // SAMSUNG GALAXY AI / S
  // highlights: cpu_type | ram_capacity | rear_cam_1
  // ================================================================
  {
    productSlug: "galaxy-s25-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Elite for Galaxy" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Wide), f/1.8" },
    ],
  },
  {
    productSlug: "galaxy-s25-plus-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Elite for Galaxy" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Wide), f/1.8" },
    ],
  },
  {
    productSlug: "galaxy-s25-ultra-5g",
    specifications: [
      { key: "screen_glass", value: "Corning Gorilla Armor" },
      { key: "cpu_type", value: "Snapdragon 8 Elite for Galaxy" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "200.0 MP (Wide), f/1.7" },
    ],
  },
  {
    productSlug: "galaxy-s25-edge-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "cpu_type", value: "Snapdragon 8 Elite for Galaxy" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "200.0 MP (Wide), f/1.7" },
    ],
  },
  {
    productSlug: "galaxy-s25-fe-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "cpu_type", value: "Exynos 2500" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "50.0 MP (Wide), f/1.8" },
    ],
  },
  {
    productSlug: "galaxy-s24-fe-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "cpu_type", value: "Exynos 2400e" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "50.0 MP (Wide), f/1.8" },
    ],
  },
  {
    productSlug: "galaxy-s24-ultra-5g",
    specifications: [
      { key: "screen_glass", value: "Corning Gorilla Armor" },
      { key: "cpu_type", value: "Snapdragon 8 Gen 3 for Galaxy" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "200.0 MP (Wide), f/1.7" },
    ],
  },

  // Galaxy AI mid-range — highlights: cpu_type | ram_capacity | battery_capacity
  {
    productSlug: "galaxy-a26-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "cpu_type", value: "Exynos 1380" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a36-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "cpu_type", value: "Snapdragon 6 Gen 3" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a56-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "cpu_type", value: "Exynos 1580" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5000" },
    ],
  },

  // Galaxy Z — highlights: cpu_type | fold_main_screen_size | ram_capacity
  {
    productSlug: "galaxy-z-fold6-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "cpu_type", value: "Snapdragon 8 Gen 3 for Galaxy" },
      { key: "fold_main_screen_size", value: "7.6" },
      { key: "ram_capacity", value: "12" },
    ],
  },
  {
    productSlug: "galaxy-z-fold7-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "cpu_type", value: "Snapdragon 8 Elite for Galaxy" },
      { key: "fold_main_screen_size", value: "7.9" },
      { key: "ram_capacity", value: "12" },
    ],
  },
  // Galaxy Z Flip — highlights: cpu_type | fold_cover_screen_size | battery_capacity
  {
    productSlug: "galaxy-z-flip7-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 3" },
      { key: "cpu_type", value: "Snapdragon 8 Elite for Galaxy" },
      { key: "fold_cover_screen_size", value: "3.9" },
      { key: "battery_capacity", value: "4000" },
    ],
  },

  // Galaxy A Series — highlights: cpu_type | ram_capacity | battery_capacity
  {
    productSlug: "galaxy-a06",
    specifications: [
      { key: "cpu_type", value: "Exynos 850" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a06-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6100+" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a07",
    specifications: [
      { key: "cpu_type", value: "Exynos 850" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a07-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 700" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a16",
    specifications: [
      { key: "cpu_type", value: "Helio G99" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a16-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6300" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a17",
    specifications: [
      { key: "cpu_type", value: "Helio G99" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-a17-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6300" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "galaxy-m55-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 7 Gen 1" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "6000" },
    ],
  },
  {
    productSlug: "galaxy-xcover7-pro-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6100+" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "4050" },
    ],
  },

  // ================================================================
  // XIAOMI / REDMI / POCO
  // ================================================================
  // highlights: cpu_type | ram_capacity | rear_cam_1
  {
    productSlug: "xiaomi-15-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Elite" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.6" },
    ],
  },
  {
    productSlug: "xiaomi-15-ultra-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Elite" },
      { key: "ram_capacity", value: "16" },
      { key: "rear_cam_1", value: "200.0 MP (Main), f/1.63" },
    ],
  },
  {
    productSlug: "xiaomi-15t-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 9300+" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.7" },
    ],
  },
  {
    productSlug: "xiaomi-15t-pro-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Gen 3" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.7" },
    ],
  },

  // highlights: cpu_type | ram_capacity | battery_capacity
  {
    productSlug: "redmi-note-14",
    specifications: [
      { key: "cpu_type", value: "Helio G99-Ultra" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "5500" },
    ],
  },
  {
    productSlug: "redmi-note-14-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "cpu_type", value: "Snapdragon 4 Gen 2" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5500" },
    ],
  },
  {
    productSlug: "redmi-note-14-pro-plus-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus 2" },
      { key: "cpu_type", value: "Dimensity 9200+" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "6000" },
    ],
  },
  {
    productSlug: "redmi-note-15",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "cpu_type", value: "Helio G100-Ultra" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "5500" },
    ],
  },
  {
    productSlug: "redmi-note-15-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "cpu_type", value: "Snapdragon 4 Gen 2" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "5500" },
    ],
  },
  {
    productSlug: "redmi-note-15-pro",
    specifications: [
      { key: "cpu_type", value: "Helio G100-Ultra" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5500" },
    ],
  },
  {
    productSlug: "redmi-note-15-pro-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus" },
      { key: "cpu_type", value: "Dimensity 7300-Ultra" },
      { key: "ram_capacity", value: "12" },
      { key: "battery_capacity", value: "5500" },
    ],
  },
  {
    productSlug: "redmi-13x",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "cpu_type", value: "Snapdragon 4 Gen 2" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5030" },
    ],
  },
  {
    productSlug: "redmi-14c",
    specifications: [
      { key: "screen_glass", value: "Tempered Glass" },
      { key: "cpu_type", value: "Helio G81-Ultra" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5160" },
    ],
  },
  {
    productSlug: "redmi-15-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "cpu_type", value: "Snapdragon 4 Gen 2" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5030" },
    ],
  },
  {
    productSlug: "poco-c71",
    specifications: [
      { key: "screen_glass", value: "Tempered Glass" },
      { key: "cpu_type", value: "Helio G81-Ultra" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5160" },
    ],
  },
  {
    productSlug: "poco-m6-pro",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "cpu_type", value: "Helio G99-Ultra" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "poco-m7-pro-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 3" },
      { key: "cpu_type", value: "Dimensity 7025-Ultra" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5110" },
    ],
  },
  {
    productSlug: "poco-x7-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass 5" },
      { key: "cpu_type", value: "Dimensity 7300-Ultra" },
      { key: "ram_capacity", value: "12" },
      { key: "battery_capacity", value: "5110" },
    ],
  },
  // highlights: cpu_type | ram_capacity | rear_cam_1
  {
    productSlug: "poco-f8-pro-5g",
    specifications: [
      { key: "screen_glass", value: "Gorilla Glass Victus" },
      { key: "cpu_type", value: "Snapdragon 8 Gen 3" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.6" },
    ],
  },

  // ================================================================
  // OPPO
  // ================================================================
  // A Series — highlights: cpu_type | ram_capacity | battery_capacity
  {
    productSlug: "oppo-a18",
    specifications: [
      { key: "cpu_type", value: "Helio G85" },
      { key: "ram_capacity", value: "4" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "oppo-a3",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6300" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "5100" },
    ],
  },
  {
    productSlug: "oppo-a58",
    specifications: [
      { key: "cpu_type", value: "Helio G85" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "5000" },
    ],
  },
  {
    productSlug: "oppo-a5i",
    specifications: [
      { key: "cpu_type", value: "Helio G91-Ultra" },
      { key: "ram_capacity", value: "6" },
      { key: "battery_capacity", value: "5100" },
    ],
  },
  {
    productSlug: "oppo-a5i-pro",
    specifications: [
      { key: "cpu_type", value: "Helio G91-Ultra" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5100" },
    ],
  },
  {
    productSlug: "oppo-a6-pro",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 695" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5100" },
    ],
  },
  {
    productSlug: "oppo-a6t",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6300" },
      { key: "ram_capacity", value: "8" },
      { key: "battery_capacity", value: "5100" },
    ],
  },

  // Reno Series — highlights: cpu_type | ram_capacity | rear_cam_1
  {
    productSlug: "oppo-reno11-f-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6080" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "64.0 MP (Main), f/1.7" },
    ],
  },
  {
    productSlug: "oppo-reno12-f-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6300" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.8" },
    ],
  },
  {
    productSlug: "oppo-reno13-f-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 6300" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.8" },
    ],
  },
  {
    productSlug: "oppo-reno14-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 8350" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.8" },
    ],
  },
  {
    productSlug: "oppo-reno14-f-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 7300" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.8" },
    ],
  },
  {
    productSlug: "oppo-reno15-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 8350" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.8" },
    ],
  },
  {
    productSlug: "oppo-reno15-f-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 7300" },
      { key: "ram_capacity", value: "8" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.8" },
    ],
  },

  // Find Series
  {
    productSlug: "oppo-find-n3-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Gen 2" },
      { key: "fold_main_screen_size", value: "7.82" },
      { key: "ram_capacity", value: "12" },
    ],
  },
  {
    productSlug: "oppo-find-n5-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Elite" },
      { key: "fold_main_screen_size", value: "8.12" },
      { key: "ram_capacity", value: "16" },
    ],
  },
  {
    productSlug: "oppo-find-x9-5g",
    specifications: [
      { key: "cpu_type", value: "Dimensity 9400" },
      { key: "ram_capacity", value: "12" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.6" },
    ],
  },
  {
    productSlug: "oppo-find-x9-pro-5g",
    specifications: [
      { key: "cpu_type", value: "Snapdragon 8 Elite" },
      { key: "ram_capacity", value: "16" },
      { key: "rear_cam_1", value: "50.0 MP (Main), f/1.6" },
    ],
  },

  // ================================================================
  // ASUS LAPTOPS
  // ================================================================
  // Non-gaming — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_screen_tech
  {
    productSlug: "asus-vivobook-15-x1504",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1235U" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_screen_tech", value: "IPS" },
    ],
  },
  {
    productSlug: "asus-vivobook-go-14-e1404",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i3-N305" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_screen_tech", value: "IPS" },
    ],
  },
  {
    productSlug: "asus-zenbook-14-oled-ux3405",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 5 125H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "OLED" },
    ],
  },
  {
    productSlug: "asus-zenbook-s-13-oled-ux5304",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 7 155U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "OLED" },
    ],
  },

  // Gaming — highlights: laptop_cpu_version | laptop_gpu_model | laptop_refresh_rate
  {
    productSlug: "asus-rog-strix-g16-g614",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i9-14900HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4080" },
      { key: "laptop_refresh_rate", value: "240" },
    ],
  },
  {
    productSlug: "asus-rog-zephyrus-g14-ga403",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 9 8945HS" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4090" },
      { key: "laptop_refresh_rate", value: "165" },
    ],
  },
  {
    productSlug: "asus-tuf-gaming-a15-fa506",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 7 7745HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4060" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "asus-tuf-gaming-f15-fx507",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-13620H" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4060" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "asus-v16-gaming-v161",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-13420H" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 3050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },

  // ================================================================
  // LENOVO
  // ================================================================
  // IdeaPad / V-series — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_storage_capacity
  {
    productSlug: "lenovo-ideapad-1-15amn7",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 5 7520U" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "lenovo-ideapad-slim-3-15iau7",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1235U" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "lenovo-ideapad-slim-5-14iml9",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 5 125H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "lenovo-v15-g4-irn",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-13420H" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },

  // Yoga — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_screen_tech
  {
    productSlug: "lenovo-yoga-7-14itp8",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-1355U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "IPS Touch" },
    ],
  },
  {
    productSlug: "lenovo-yoga-slim-7-14imh9",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 7 155H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "OLED" },
    ],
  },
  {
    productSlug: "lenovo-yoga-book-9-13iru8",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-1355U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "OLED" },
    ],
  },

  // ThinkBook / ThinkPad — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_battery_life
  {
    productSlug: "lenovo-thinkbook-14-g6-abp",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 5 7530U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },
  {
    productSlug: "lenovo-thinkbook-16-g6-irl",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-13420H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },
  {
    productSlug: "lenovo-thinkpad-e14-gen-5",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-1355U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "14" },
    ],
  },
  {
    productSlug: "lenovo-thinkpad-l13-gen-4",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1335U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },
  {
    productSlug: "lenovo-thinkpad-x1-carbon-gen-12",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 7 165U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "15" },
    ],
  },

  // Legion / LOQ Gaming — highlights: laptop_cpu_version | laptop_gpu_model | laptop_refresh_rate
  {
    productSlug: "lenovo-legion-5-16irx9",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-14650HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4060" },
      { key: "laptop_refresh_rate", value: "165" },
    ],
  },
  {
    productSlug: "lenovo-legion-pro-7-16irx9h",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i9-14900HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4080" },
      { key: "laptop_refresh_rate", value: "240" },
    ],
  },
  {
    productSlug: "lenovo-legion-slim-5-16aph8",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 7 7745HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4060" },
      { key: "laptop_refresh_rate", value: "165" },
    ],
  },
  {
    productSlug: "lenovo-loq-15iax9e",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-12450HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 3050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "lenovo-loq-15irp9",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-13420H" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },

  // ================================================================
  // ACER
  // ================================================================
  // Aspire non-gaming — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_storage_capacity
  {
    productSlug: "acer-aspire-3-a315",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i3-N305" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "acer-aspire-5-a515",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1335U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },

  // Gaming — highlights: laptop_cpu_version | laptop_gpu_model | laptop_refresh_rate
  {
    productSlug: "acer-aspire-7-gaming-a715",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 5 7535HS" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "acer-nitro-5-tiger-an515",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-12500H" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 3050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "acer-nitro-v-15-anv15",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-13420H" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "acer-predator-helios-neo-16-phn16",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-13700HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4070" },
      { key: "laptop_refresh_rate", value: "165" },
    ],
  },

  // Swift — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_battery_life
  {
    productSlug: "acer-swift-go-14-sfg14",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 5 125U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },

  // ================================================================
  // DELL
  // ================================================================
  // Inspiron / Vostro — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_storage_capacity
  {
    productSlug: "dell-inspiron-14-5440",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1335U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "dell-inspiron-16-5640",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-1355U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "dell-vostro-15-3530",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1335U" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },

  // XPS — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_screen_tech
  {
    productSlug: "dell-xps-13-9340",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 7 165H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "OLED" },
    ],
  },
  {
    productSlug: "dell-xps-14-9440",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 7 155H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_screen_tech", value: "OLED" },
    ],
  },

  // Latitude / Precision — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_battery_life
  {
    productSlug: "dell-latitude-3440",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1335U" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },
  {
    productSlug: "dell-latitude-7440",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-1365U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "14" },
    ],
  },
  {
    productSlug: "dell-precision-16-5680",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i7-13700H" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },

  // ================================================================
  // HP
  // ================================================================
  // Standard — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_storage_capacity
  {
    productSlug: "hp-15s-fq5111tu",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1235U" },
      { key: "laptop_ram_capacity", value: "8" },
      { key: "laptop_storage_capacity", value: "512" },
    ],
  },
  {
    productSlug: "hp-victus-15-fa1139tx",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-13420H" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4050" },
      { key: "laptop_refresh_rate", value: "144" },
    ],
  },

  // Envy / Omnibook — highlights: laptop_cpu_version | laptop_ram_capacity | laptop_battery_life
  {
    productSlug: "hp-envy-x360-14-fa0045au",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 5 7530U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },
  {
    productSlug: "hp-omnibook-x-14-fe0053au",
    specifications: [
      { key: "laptop_cpu_version", value: "Snapdragon X Elite" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "17" },
    ],
  },
  {
    productSlug: "hp-omnibook-ultra-flip-14",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core Ultra 7 155U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "13" },
    ],
  },
  {
    productSlug: "hp-probook-450-g10",
    specifications: [
      { key: "laptop_cpu_version", value: "Intel Core i5-1335U" },
      { key: "laptop_ram_capacity", value: "16" },
      { key: "laptop_battery_life", value: "12" },
    ],
  },

  // Gaming — highlights: laptop_cpu_version | laptop_gpu_model | laptop_refresh_rate
  {
    productSlug: "hp-omen-16-xf0071ax",
    specifications: [
      { key: "laptop_cpu_version", value: "AMD Ryzen 7 7745HX" },
      { key: "laptop_gpu_model", value: "NVIDIA GeForce RTX 4070" },
      { key: "laptop_refresh_rate", value: "165" },
    ],
  },

  // ================================================================
  // TIVI — highlights: tivi_screen_size | tivi_screen_tech | tivi_refresh_rate
  // ================================================================
  {
    productSlug: "samsung-crystal-4k-50au7700",
    specifications: [
      { key: "tivi_screen_size", value: "50" },
      { key: "tivi_screen_tech", value: "Crystal UHD" },
      { key: "tivi_refresh_rate", value: "60" },
    ],
  },
  {
    productSlug: "samsung-qled-4k-65q70c",
    specifications: [
      { key: "tivi_screen_size", value: "65" },
      { key: "tivi_screen_tech", value: "QLED" },
      { key: "tivi_refresh_rate", value: "120" },
    ],
  },
  {
    productSlug: "sony-4k-google-tv-55x75k",
    specifications: [
      { key: "tivi_screen_size", value: "55" },
      { key: "tivi_screen_tech", value: "LED 4K" },
      { key: "tivi_refresh_rate", value: "60" },
    ],
  },
  {
    productSlug: "tcl-qled-4k-55c645",
    specifications: [
      { key: "tivi_screen_size", value: "55" },
      { key: "tivi_screen_tech", value: "QLED" },
      { key: "tivi_refresh_rate", value: "144" },
    ],
  },
  {
    productSlug: "xiaomi-google-tv-a-pro-55",
    specifications: [
      { key: "tivi_screen_size", value: "55" },
      { key: "tivi_screen_tech", value: "LED 4K" },
      { key: "tivi_refresh_rate", value: "60" },
    ],
  },
  {
    productSlug: "coocaa-google-tv-70y72",
    specifications: [
      { key: "tivi_screen_size", value: "70" },
      { key: "tivi_screen_tech", value: "LED 4K" },
      { key: "tivi_refresh_rate", value: "60" },
    ],
  },

  // ================================================================
  // MÁY GIẶT — highlights: wash_capacity | wash_motor_type | wash_spin_speed
  // ================================================================
  {
    productSlug: "electrolux-inverter-11kg-ewf1142bewa",
    specifications: [
      { key: "wash_capacity", value: "11" },
      { key: "wash_motor_type", value: "Inverter" },
      { key: "wash_spin_speed", value: "1200" },
    ],
  },
  {
    productSlug: "lg-inverter-9kg-fv1409s4w",
    specifications: [
      { key: "wash_capacity", value: "9" },
      { key: "wash_motor_type", value: "Inverter Direct Drive" },
      { key: "wash_spin_speed", value: "1400" },
    ],
  },
  {
    productSlug: "lg-giat-say-10.5kg-fv1450h2b",
    specifications: [
      { key: "wash_capacity", value: "10.5" },
      { key: "wash_motor_type", value: "Inverter Direct Drive" },
      { key: "wash_spin_speed", value: "1400" },
    ],
  },
  {
    productSlug: "samsung-ai-inverter-10kg-ww10tp44ds",
    specifications: [
      { key: "wash_capacity", value: "10" },
      { key: "wash_motor_type", value: "Digital Inverter" },
      { key: "wash_spin_speed", value: "1400" },
    ],
  },
  {
    productSlug: "samsung-giat-say-14kg-wd14tp44dsx",
    specifications: [
      { key: "wash_capacity", value: "14" },
      { key: "wash_motor_type", value: "Digital Inverter" },
      { key: "wash_spin_speed", value: "1400" },
    ],
  },
  {
    productSlug: "panasonic-inverter-8.5kg-na-fd85x1lrv",
    specifications: [
      { key: "wash_capacity", value: "8.5" },
      { key: "wash_motor_type", value: "Inverter" },
      { key: "wash_spin_speed", value: "1200" },
    ],
  },
  {
    productSlug: "aqua-12kg-aqw-fw120gt-bk",
    specifications: [
      { key: "wash_capacity", value: "12" },
      { key: "wash_motor_type", value: "Inverter" },
      { key: "wash_spin_speed", value: "1200" },
    ],
  },
  {
    productSlug: "toshiba-7kg-aw-k800av",
    specifications: [
      { key: "wash_capacity", value: "7" },
      { key: "wash_motor_type", value: "Standard" },
      { key: "wash_spin_speed", value: "700" },
    ],
  },

  // ================================================================
  // MÁY LẠNH / ĐIỀU HÒA — highlights: ac_capacity_hp | ac_inverter | ac_room_size
  // ================================================================
  {
    productSlug: "casper-inverter-tc-09is33",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "daikin-1-chieu-atf25uv1v",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "daikin-2-chieu-inverter-f25vavmv",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "panasonic-1-chieu-n9zkh-8",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "panasonic-2-chieu-inverter-yz9wkh-8",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "samsung-inverter-ar10cyh",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "casper-inverter-1-5hp-gc-12ib36",
    specifications: [
      { key: "ac_capacity_hp", value: "1.5" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "15 - 20" },
    ],
  },
  {
    productSlug: "casper-inverter-1-5hp-gc-12is35",
    specifications: [
      { key: "ac_capacity_hp", value: "1.5" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "15 - 20" },
    ],
  },
  {
    productSlug: "casper-inverter-1hp-tc-09is35",
    specifications: [
      { key: "ac_capacity_hp", value: "1" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "10 - 15" },
    ],
  },
  {
    productSlug: "comfee-inverter-1-5hp-cfs-13vgp",
    specifications: [
      { key: "ac_capacity_hp", value: "1.5" },
      { key: "ac_inverter", value: "Có" },
      { key: "ac_room_size", value: "15 - 20" },
    ],
  },

  // ================================================================
  // TỦ LẠNH — highlights: fridge_capacity | fridge_inverter | fridge_no_frost
  // ================================================================
  {
    productSlug: "samsung-inverter-236l-rt22farbdsa",
    specifications: [
      { key: "fridge_capacity", value: "236" },
      { key: "fridge_inverter", value: "Digital Inverter" },
      { key: "fridge_no_frost", value: "Làm lạnh gián tiếp (No Frost)" },
    ],
  },
  {
    productSlug: "panasonic-inverter-255l-nr-bv280qs",
    specifications: [
      { key: "fridge_capacity", value: "255" },
      { key: "fridge_inverter", value: "Inverter" },
      { key: "fridge_no_frost", value: "Làm lạnh gián tiếp (No Frost)" },
    ],
  },
  {
    productSlug: "sharp-inverter-401l-sj-fx52gp-bk",
    specifications: [
      { key: "fridge_capacity", value: "401" },
      { key: "fridge_inverter", value: "Inverter" },
      { key: "fridge_no_frost", value: "Làm lạnh gián tiếp (No Frost)" },
    ],
  },
  {
    productSlug: "lg-side-by-side-635l-gr-d257js",
    specifications: [
      { key: "fridge_capacity", value: "635" },
      { key: "fridge_inverter", value: "Linear Inverter" },
      { key: "fridge_no_frost", value: "Làm lạnh gián tiếp (No Frost)" },
    ],
  },
  {
    productSlug: "samsung-side-by-side-648l-rs64r5301b4",
    specifications: [
      { key: "fridge_capacity", value: "648" },
      { key: "fridge_inverter", value: "Digital Inverter" },
      { key: "fridge_no_frost", value: "Làm lạnh gián tiếp (No Frost)" },
    ],
  },
  {
    productSlug: "casper-multi-door-430l-rm-520vt",
    specifications: [
      { key: "fridge_capacity", value: "430" },
      { key: "fridge_inverter", value: "Inverter" },
      { key: "fridge_no_frost", value: "Làm lạnh gián tiếp (No Frost)" },
    ],
  },

  // ================================================================
  // TỦ ĐÔNG — highlights: fridge_capacity | fridge_freezer_capacity | fridge_no_frost
  // ================================================================
  {
    productSlug: "alaska-dung-210l-if-21",
    specifications: [
      { key: "fridge_capacity", value: "210" },
      { key: "fridge_freezer_capacity", value: "210" },
      { key: "fridge_no_frost", value: "Làm lạnh trực tiếp" },
    ],
  },
  {
    productSlug: "hoa-phat-dung-106l-hcf-106s1n",
    specifications: [
      { key: "fridge_capacity", value: "106" },
      { key: "fridge_freezer_capacity", value: "106" },
      { key: "fridge_no_frost", value: "Làm lạnh trực tiếp" },
    ],
  },
  {
    productSlug: "kangaroo-1-ngan-dong-140l-kg168nc1",
    specifications: [
      { key: "fridge_capacity", value: "140" },
      { key: "fridge_freezer_capacity", value: "140" },
      { key: "fridge_no_frost", value: "Làm lạnh trực tiếp" },
    ],
  },
  {
    productSlug: "sanaky-1-ngan-dong-100l-vh-1599hy",
    specifications: [
      { key: "fridge_capacity", value: "100" },
      { key: "fridge_freezer_capacity", value: "100" },
      { key: "fridge_no_frost", value: "Làm lạnh trực tiếp" },
    ],
  },
  {
    productSlug: "sanaky-2-ngan-280l-vh-2899w3",
    specifications: [
      { key: "fridge_capacity", value: "280" },
      { key: "fridge_freezer_capacity", value: "210" },
      { key: "fridge_no_frost", value: "Làm lạnh trực tiếp" },
    ],
  },
  {
    productSlug: "sunhouse-2-ngan-250l-shr-f2272w2",
    specifications: [
      { key: "fridge_capacity", value: "250" },
      { key: "fridge_freezer_capacity", value: "190" },
      { key: "fridge_no_frost", value: "Làm lạnh trực tiếp" },
    ],
  },

  // ================================================================
  // MÁY SẤY — highlights: wash_capacity | wash_dry_type | wash_power_consumption / wash_energy_rating
  // ================================================================
  {
    productSlug: "electrolux-thong-hoi-8.5kg-eds854n3sb",
    specifications: [
      { key: "wash_capacity", value: "8.5" },
      { key: "wash_dry_type", value: "Thông hơi" },
      { key: "wash_power_consumption", value: "2400" },
    ],
  },
  {
    productSlug: "casper-thong-hoi-7.2kg-td-72vwd",
    specifications: [
      { key: "wash_capacity", value: "7.2" },
      { key: "wash_dry_type", value: "Thông hơi" },
      { key: "wash_power_consumption", value: "2200" },
    ],
  },
  {
    productSlug: "lg-ngung-tu-8kg-fc1408s4w2",
    specifications: [
      { key: "wash_capacity", value: "8" },
      { key: "wash_dry_type", value: "Ngưng tụ" },
      { key: "wash_power_consumption", value: "1900" },
    ],
  },
  {
    productSlug: "candy-ngung-tu-9kg-cso-c9te-s",
    specifications: [
      { key: "wash_capacity", value: "9" },
      { key: "wash_dry_type", value: "Ngưng tụ" },
      { key: "wash_power_consumption", value: "2100" },
    ],
  },
  {
    productSlug: "lg-heatpump-9kg-dvhp09b",
    specifications: [
      { key: "wash_capacity", value: "9" },
      { key: "wash_dry_type", value: "Bơm nhiệt (Heat Pump)" },
      { key: "wash_energy_rating", value: "A++" },
    ],
  },
  {
    productSlug: "samsung-heatpump-9kg-dv90ta240ae",
    specifications: [
      { key: "wash_capacity", value: "9" },
      { key: "wash_dry_type", value: "Bơm nhiệt (Heat Pump)" },
      { key: "wash_energy_rating", value: "A++" },
    ],
  },

  // ================================================================
  // AUDIO / TAI NGHE / LOA
  // ================================================================
  {
    productSlug: "apple-airpods-pro-2-usb-c",
    specifications: [
      { key: "battery_capacity", value: "30" },
      { key: "bluetooth_version", value: "v5.3" },
      { key: "water_resistance", value: "IP54" },
    ],
  },
  {
    productSlug: "samsung-galaxy-buds-3-pro",
    specifications: [
      { key: "battery_capacity", value: "53" },
      { key: "bluetooth_version", value: "v5.4" },
      { key: "water_resistance", value: "IPX7" },
    ],
  },
  {
    productSlug: "apple-airpods-pro-3-2025",
    specifications: [
      { key: "battery_capacity", value: "35" },
      { key: "bluetooth_version", value: "v5.3" },
      { key: "water_resistance", value: "IP54" },
    ],
  },
  {
    productSlug: "sony-wh-1000xm5",
    specifications: [
      { key: "battery_capacity", value: "1000" },
      { key: "bluetooth_version", value: "v5.2" },
      { key: "battery_life", value: "30" },
    ],
  },
  {
    productSlug: "marshall-major-v",
    specifications: [
      { key: "battery_capacity", value: "800" },
      { key: "bluetooth_version", value: "v5.2" },
      { key: "battery_life", value: "80" },
    ],
  },
  {
    productSlug: "razer-blackshark-v2-pro",
    specifications: [
      { key: "battery_capacity", value: "1000" },
      { key: "bluetooth_version", value: "v5.2" },
      { key: "battery_life", value: "35" },
    ],
  },
  {
    productSlug: "jbl-charge-5",
    specifications: [
      { key: "battery_capacity", value: "7500" },
      { key: "bluetooth_version", value: "v5.1" },
      { key: "water_resistance", value: "IP67" },
    ],
  },
  {
    productSlug: "marshall-emberton-ii",
    specifications: [
      { key: "battery_capacity", value: "2600" },
      { key: "bluetooth_version", value: "v5.1" },
      { key: "water_resistance", value: "IPX7" },
    ],
  },
  {
    productSlug: "logitech-g560-lightsync-speakers",
    specifications: [
      { key: "battery_capacity", value: "0" },
      { key: "bluetooth_version", value: "v5.0" },
      { key: "water_resistance", value: "Không" },
    ],
  },
  {
    productSlug: "microlab-x2-2.1",
    specifications: [
      { key: "battery_capacity", value: "0" },
      { key: "bluetooth_version", value: "Không" },
      { key: "water_resistance", value: "Không" },
    ],
  },
  {
    productSlug: "dalton-ts-12g450x",
    specifications: [
      { key: "battery_capacity", value: "0" },
      { key: "bluetooth_version", value: "v5.0" },
      { key: "water_resistance", value: "Không" },
    ],
  },
  {
    productSlug: "sony-ier-h500a-3.5mm",
    specifications: [
      { key: "material", value: "Nhựa cao cấp" },
      { key: "charging_port", value: "3.5mm Jack" },
      { key: "bluetooth_version", value: "Không (có dây)" },
    ],
  },
  {
    productSlug: "apple-earpods-usb-c-2023",
    specifications: [
      { key: "charging_port", value: "USB-C" },
      { key: "material", value: "Nhựa" },
      { key: "battery_life", value: "Không (có dây)" },
    ],
  },
  {
    productSlug: "apple-earpods-lightning-mwty3za",
    specifications: [
      { key: "charging_port", value: "Lightning" },
      { key: "material", value: "Nhựa" },
      { key: "battery_life", value: "Không (có dây)" },
    ],
  },
  {
    productSlug: "apple-earpods-lightning-mmtn2za",
    specifications: [
      { key: "charging_port", value: "Lightning" },
      { key: "material", value: "Nhựa" },
      { key: "battery_life", value: "Không (có dây)" },
    ],
  },

  // ================================================================
  // GAMING GEAR
  // ================================================================
  {
    productSlug: "logitech-g-pro-x-superlight-2",
    specifications: [
      { key: "bluetooth_version", value: "LIGHTSPEED 2.4GHz" },
      { key: "battery_life", value: "95" },
      { key: "weight", value: "60" },
    ],
  },
  {
    productSlug: "razer-deathadder-v3-pro",
    specifications: [
      { key: "bluetooth_version", value: "HyperSpeed 2.4GHz" },
      { key: "battery_life", value: "90" },
      { key: "weight", value: "64" },
    ],
  },
  {
    productSlug: "asus-rog-falchion-rx-low-profile",
    specifications: [
      { key: "charging_port", value: "USB-C" },
      { key: "bluetooth_version", value: "v5.0" },
      { key: "battery_life", value: "40" },
    ],
  },
  {
    productSlug: "corsair-k70-rgb-tkl",
    specifications: [
      { key: "charging_port", value: "USB-A" },
      { key: "bluetooth_version", value: "Không" },
      { key: "battery_life", value: "Không (có dây)" },
    ],
  },
  {
    productSlug: "nintendo-switch-oled",
    specifications: [
      { key: "screen_size", value: "7.0" },
      { key: "rom_capacity", value: "64" },
      { key: "battery_life", value: "9" },
    ],
  },
  {
    productSlug: "sony-playstation-5-slim",
    specifications: [
      { key: "screen_size", value: "Không (kết nối TV)" },
      { key: "rom_capacity", value: "1024" },
      { key: "battery_life", value: "Không (cắm điện)" },
    ],
  },

  // ================================================================
  // PHỤ KIỆN DI ĐỘNG
  // ================================================================
  {
    productSlug: "apple-adapter-usb-c-20w",
    specifications: [
      { key: "battery_capacity", value: "0" },
      { key: "charging_port", value: "USB-C" },
      { key: "weight", value: "45" },
    ],
  },
  {
    productSlug: "sac-du-phong-maggo-anker-10000mah",
    specifications: [
      { key: "battery_capacity", value: "10000" },
      { key: "charging_port", value: "USB-C, USB-A" },
      { key: "weight", value: "180" },
    ],
  },
  {
    productSlug: "sac-du-phong-samsung-10000mah-25w",
    specifications: [
      { key: "battery_capacity", value: "10000" },
      { key: "charging_port", value: "USB-C, USB-A" },
      { key: "weight", value: "200" },
    ],
  },
  {
    productSlug: "apple-pencil-pro",
    specifications: [
      { key: "bluetooth_version", value: "v5.0" },
      { key: "battery_life", value: "Không rõ" },
      { key: "water_resistance", value: "Không" },
    ],
  },
  {
    productSlug: "cap-usb-c-to-lightning-apple-1m",
    specifications: [
      { key: "material", value: "Dây dù, đầu nhôm" },
      { key: "dimensions", value: "1000" },
      { key: "water_resistance", value: "Không" },
    ],
  },
  {
    productSlug: "op-lung-iphone-15-pro-max-magsafe-silicone",
    specifications: [
      { key: "material", value: "Silicone cao cấp" },
      { key: "dimensions", value: "Vừa iPhone 15 Pro Max" },
      { key: "water_resistance", value: "Không" },
    ],
  },
  {
    productSlug: "mieng-dan-kinh-cuong-luc-iphone-15-pro-max-miking",
    specifications: [
      { key: "material", value: "Kính cường lực 9H" },
      { key: "dimensions", value: "Vừa iPhone 15 Pro Max" },
      { key: "water_resistance", value: "Không" },
    ],
  },

  // ================================================================
  // PHỤ KIỆN LAPTOP
  // ================================================================
  {
    productSlug: "chuot-logitech-mx-master-3s",
    specifications: [
      { key: "bluetooth_version", value: "v5.1" },
      { key: "battery_life", value: "70" },
      { key: "charging_port", value: "USB-C" },
    ],
  },
  {
    productSlug: "ban-phim-logitech-mx-keys-s",
    specifications: [
      { key: "bluetooth_version", value: "v5.1" },
      { key: "battery_life", value: "10" },
      { key: "charging_port", value: "USB-C" },
    ],
  },
  {
    productSlug: "hub-chuyen-doi-anker-5-in-1-usb-c",
    specifications: [
      { key: "charging_port", value: "USB-C, USB-A x3, HDMI" },
      { key: "weight", value: "68" },
      { key: "dimensions", value: "110 x 38 x 14" },
    ],
  },
  {
    productSlug: "webcam-logitech-c922-pro",
    specifications: [
      { key: "charging_port", value: "USB-A" },
      { key: "bluetooth_version", value: "Không" },
      { key: "weight", value: "162" },
    ],
  },
  {
    productSlug: "balo-laptop-targus-15.6-inch",
    specifications: [
      { key: "material", value: "Polyester cao cấp" },
      { key: "dimensions", value: "48 x 33 x 20" },
      { key: "weight", value: "800" },
    ],
  },
  {
    productSlug: "gia-do-laptop-hyperwork-l01",
    specifications: [
      { key: "material", value: "Nhôm hợp kim" },
      { key: "dimensions", value: "260 x 48 x 25" },
      { key: "weight", value: "420" },
    ],
  },
  {
    productSlug: "mieng-lot-chuot-logitech-desk-mat",
    specifications: [
      { key: "material", value: "Vải microfiber, đế cao su" },
      { key: "dimensions", value: "700 x 300 x 2" },
      { key: "weight", value: "400" },
    ],
  },
  {
    productSlug: "phu-ban-phim-macbook-jcpal",
    specifications: [
      { key: "material", value: "Silicon mỏng" },
      { key: "dimensions", value: "Phù hợp MacBook Pro/Air" },
      { key: "weight", value: "25" },
    ],
  },
  {
    productSlug: "but-trinh-chieu-logitech-r500s",
    specifications: [
      { key: "bluetooth_version", value: "v5.0" },
      { key: "battery_life", value: "12" },
      { key: "weight", value: "56" },
    ],
  },
];