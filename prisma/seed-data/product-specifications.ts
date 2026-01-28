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

      // --- Thiết kế & Trọng lượng ---
      { key: "dimensions", value: "71.5 x 7.4 x 146.7" },
      { key: "weight", value: "164" },
      { key: "water_resistance", value: "IP68" },
      { key: "material", value: "Mặt lưng: Kính, Viền: Nhôm nguyên khối" },

      // --- Bộ xử lý ---
      { key: "cpu_version", value: "Apple A15 Bionic" },
      { key: "cpu_type", value: "6-Core" },
      { key: "cpu_cores", value: "6" },

      // --- RAM ---
      { key: "ram_capacity", value: "4" },

      // --- Màn hình ---
      { key: "screen_size", value: "6.1" },
      { key: "screen_tech", value: "OLED" },
      { key: "screen_standard", value: "Super Retina XDR" },
      { key: "screen_resolution", value: "2532 x 1170" },
      { key: "refresh_rate", value: "60" },
      { key: "screen_glass", value: "Phủ Ceramic (Ceramic Shield)" },
      { key: "pixel_density", value: "460" }, // Tính toán dựa trên độ phân giải và size
      { key: "max_brightness", value: "800 - 1200" },
      { key: "contrast_ratio", value: "2.000.000:1" },

      // --- Đồ họa ---
      { key: "gpu_chip", value: "Apple GPU 5 nhân" },

      // --- Lưu trữ ---
      { key: "rom_capacity", value: "128" },

      // --- Camera sau ---
      { key: "rear_camera_count", value: "2" },
      { key: "rear_cam_1", value: "Wide 12.0 MP" },
      { key: "rear_cam_2", value: "Ultra Wide 12.0 MP" },
      { key: "rear_cam_3", value: "Không hỗ trợ" },
      { key: "rear_video_record", value: "4K @60fps, 1080p @240fps (Slow Motion)" },
      {
        key: "rear_cam_features",
        value: "Night Mode, Cinematic Mode, OIS, Panorama, HDR, AF, Zoom kỹ thuật số",
      },

      // --- Camera Selfie ---
      { key: "selfie_camera_count", value: "1" },
      { key: "selfie_cam_1", value: "12.0 MP, ƒ/2.2" },
      { key: "selfie_video_record", value: "4K @60fps, 1080p @60fps" },
      { key: "selfie_cam_features", value: "FaceID, Retina Flash, Portrait Mode, HDR, Night Mode" },

      // --- Cảm biến ---
      {
        key: "sensors",
        value:
          "Gia tốc kế, Cảm biến tiệm cận, Con quay hồi chuyển, Khí áp kế, Cảm biến ánh sáng môi trường",
      },

      // --- Bảo mật ---
      { key: "security", value: "FaceID, Mật mã" },

      // --- Others ---
      { key: "led_notification", value: "Không" },
      {
        key: "special_features",
        value: "MagSafe, Chống nước IP68, Apple Intelligence (Hỗ trợ giới hạn)",
      },

      // --- Giao tiếp và kết nối ---
      { key: "sim_type", value: "1 eSIM và 1 nano SIM" },
      { key: "sim_slots", value: "1" },
      { key: "network_support", value: "5G" },
      { key: "charging_port", value: "Lightning" },
      { key: "wifi_version", value: "802.11 ax (Wifi 6)" },
      { key: "gps_tech", value: "GPS, GLONASS, GALILEO, QZSS, A-GPS" },
      { key: "bluetooth_version", value: "v5.0" },
      { key: "other_connect", value: "NFC" },

      // --- Thông tin pin & sạc ---
      { key: "battery_type", value: "Lithium-ion" },
      { key: "battery_life", value: "3225 mAh (Lên đến 19 giờ xem video)" },
      { key: "battery_more_info", value: "Sạc nhanh 20W, Sạc không dây MagSafe 15W, Sạc Qi 7.5W" },

      // --- Hệ điều hành ---
      { key: "os_name", value: "iOS" },
      { key: "os_version", value: "iOS 15" },

      // --- Phụ kiện ---
      { key: "in_the_box", value: "Cáp USB-C to Lightning, Sách HDSD, Que lấy SIM" },
    ],
  },
  {
    productSlug: "iphone-14",
    specifications: [
      // --- Thông tin hàng hóa ---
      { key: "origin", value: "Trung Quốc" },
      { key: "launch_date", value: "09/2022" },
      { key: "warranty_period", value: "12" },

      // --- Thiết kế & Trọng lượng ---
      { key: "dimensions", value: "146.7 x 71.5 x 7.8" },
      { key: "weight", value: "172" },
      { key: "water_resistance", value: "IP68" },
      { key: "material", value: "Mặt lưng: Kính, Viền: Nhôm nguyên khối" },

      // --- Bộ xử lý ---
      { key: "cpu_version", value: "Apple A15 Bionic" },
      { key: "cpu_type", value: "6-Core" },
      { key: "cpu_cores", value: "6" },

      // --- RAM ---
      { key: "ram_capacity", value: "6" },

      // --- Màn hình ---
      { key: "screen_size", value: "6.1" },
      { key: "screen_tech", value: "OLED" },
      { key: "screen_standard", value: "Super Retina XDR" },
      { key: "screen_resolution", value: "2532 x 1170" },
      { key: "refresh_rate", value: "60" },
      { key: "screen_glass", value: "Ceramic Shield" },
      { key: "pixel_density", value: "460" },
      { key: "max_brightness", value: "800 - 1200" },
      { key: "contrast_ratio", value: "2.000.000:1" },

      // --- Đồ họa ---
      { key: "gpu_chip", value: "Apple GPU 5 nhân" },

      // --- Lưu trữ ---
      { key: "rom_capacity", value: "128" },

      // --- Camera sau ---
      { key: "rear_camera_count", value: "2" },
      { key: "rear_cam_1", value: "Wide 12.0 MP, ƒ/1.5" },
      { key: "rear_cam_2", value: "Ultra Wide 12.0 MP, ƒ/2.4" },
      { key: "rear_cam_3", value: "Không hỗ trợ" },
      { key: "rear_video_record", value: "4K @60fps, 1080p @60fps, Cinematic Mode 4K HDR" },
      {
        key: "rear_cam_features",
        value: "Photonic Engine, Deep Fusion, Smart HDR 4, Night Mode, Action Mode, OIS",
      },

      // --- Camera Selfie ---
      { key: "selfie_camera_count", value: "1" },
      { key: "selfie_cam_1", value: "12.0 MP, ƒ/1.9" },
      { key: "selfie_video_record", value: "4K @60fps, Cinematic Mode 4K HDR" },
      {
        key: "selfie_cam_features",
        value: "Tự động lấy nét (AF), FaceID, Portrait Mode, Night Mode",
      },

      // --- Cảm biến ---
      {
        key: "sensors",
        value:
          "FaceID, Áp kế, Con quay hồi chuyển dải động cao, Gia tốc kế lực G cao, Tiệm cận, Ánh sáng môi trường kép",
      },

      // --- Bảo mật ---
      { key: "security", value: "Mở khóa khuôn mặt (FaceID), Mật mã" },

      // --- Others ---
      { key: "led_notification", value: "Không" },
      {
        key: "special_features",
        value: "Phát hiện va chạm (Crash Detection), Liên lạc khẩn cấp qua vệ tinh, MagSafe",
      },

      // --- Giao tiếp và kết nối ---
      { key: "sim_type", value: "1 eSIM và 1 Nano SIM" },
      { key: "sim_slots", value: "1" },
      { key: "network_support", value: "5G" },
      { key: "charging_port", value: "Lightning" },
      { key: "wifi_version", value: "Wifi 6 (802.11ax)" },
      { key: "gps_tech", value: "GPS, GLONASS, GALILEO, QZSS, BEIDOU" },
      { key: "bluetooth_version", value: "v5.3" },
      { key: "other_connect", value: "NFC" },

      // --- Thông tin pin & sạc ---
      { key: "battery_type", value: "Lithium-ion" },
      { key: "battery_life", value: "3279 mAh (Lên đến 20 giờ xem video)" },
      { key: "battery_more_info", value: "Sạc nhanh 20W, Sạc không dây MagSafe 15W, Sạc Qi 7.5W" },

      // --- Hệ điều hành ---
      { key: "os_name", value: "iOS" },
      { key: "os_version", value: "iOS 16" },

      // --- Phụ kiện ---
      { key: "in_the_box", value: "Cáp USB-C to Lightning, Sách HDSD, Que lấy SIM" },
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
];
