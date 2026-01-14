import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProductSpecificationSeed {
  productSlug: string;
  specifications: {
    key: string;
    value: string;
  }[];
}

const productSpecificationsData: ProductSpecificationSeed[] = [
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
];

export async function seedProductSpecifications() {
  console.log("Seeding product specifications...");

  for (const item of productSpecificationsData) {
    const product = await prisma.products.findUnique({
      where: { slug: item.productSlug },
    });

    if (!product) {
      console.warn(`⚠ Product not found: ${item.productSlug}`);
      continue;
    }

    for (let i = 0; i < item.specifications.length; i++) {
      const specItem = item.specifications[i];

      const specification = await prisma.specifications.findUnique({
        where: { key: specItem.key },
      });

      if (!specification) {
        console.warn(`⚠ Specification not found: ${specItem.key}`);
        continue;
      }

      await prisma.product_specifications.upsert({
        where: {
          productId_specificationId: {
            productId: product.id,
            specificationId: specification.id,
          },
        },
        update: {
          value: specItem.value,
          sortOrder: i,
        },
        create: {
          productId: product.id,
          specificationId: specification.id,
          value: specItem.value,
          sortOrder: i,
        },
      });
    }
  }

  console.log("✅ Product specifications seeded");
}
