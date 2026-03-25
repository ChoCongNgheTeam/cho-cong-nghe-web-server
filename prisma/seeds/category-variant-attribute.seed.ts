import { PrismaClient, categories } from "@prisma/client";

/**
 * CATEGORY → ATTRIBUTE MAPPING
 * ============================================================
 *
 * NGUYÊN TẮC:
 *   - Slug phải khớp chính xác với slug trong DB
 *   - Con KHÔNG tự động kế thừa cha — mỗi category được map tường minh
 *   - Nếu một category không có trong map → không có variant attribute
 *
 * NHÓM ĐIỆN THOẠI
 *   iPhone (tất cả series)     → color, storage          (RAM cố định)
 *   Android (Samsung/OPPO/Xiaomi) → color, ram, storage
 *
 * NHÓM LAPTOP
 *   MacBook (tất cả dòng)      → color, ram, storage, gpu
 *   Laptop khác (Asus/Dell/HP/Lenovo/Acer) → ram, storage
 *
 * NHÓM TIVI                   → size
 * NHÓM MÁY GIẶT               → capacity_washing
 * NHÓM MÁY LẠNH               → capacity_cooling
 * NHÓM TỦ LẠNH                → capacity_fridge
 *
 * NHÓM ÂM THANH / GAMING GEAR → color
 * NHÓM PHỤ KIỆN DI ĐỘNG       → connection  (Sạc, Cáp)
 *                              → color       (Ốp lưng, Bao da...)
 * ============================================================
 */

const CATEGORY_ATTRIBUTE_MAP: Record<string, string[]> = {
  // -------------------------------------------------------
  // ĐIỆN THOẠI — iPhone
  // -------------------------------------------------------
  "iphone-17-series": ["color", "storage"],
  "iphone-16-series": ["color", "storage"],
  "iphone-15-series": ["color", "storage"],
  "iphone-14-series": ["color", "storage"],
  "iphone-13-series": ["color", "storage"],

  // -------------------------------------------------------
  // ĐIỆN THOẠI — Android Samsung
  // -------------------------------------------------------
  "galaxy-ai": ["color", "ram", "storage"],
  "galaxy-s-series": ["color", "ram", "storage"],
  "galaxy-z-series": ["color", "ram", "storage"],
  "galaxy-a-series": ["color", "ram", "storage"],
  "galaxy-m-series": ["color", "ram", "storage"],
  "galaxy-xcover": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // ĐIỆN THOẠI — Android OPPO
  // -------------------------------------------------------
  "oppo-reno-series": ["color", "ram", "storage"],
  "oppo-a-series": ["color", "ram", "storage"],
  "oppo-find-series": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // ĐIỆN THOẠI — Android Xiaomi
  // -------------------------------------------------------
  "poco-series": ["color", "ram", "storage"],
  "xiaomi-series": ["color", "ram", "storage"],
  "redmi-note-series": ["color", "ram", "storage"],
  "redmi-series": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // LAPTOP — MacBook
  // -------------------------------------------------------
  "macbook-air-13-inch": ["color", "ram", "storage", "gpu"],
  "macbook-air-15-inch": ["color", "ram", "storage", "gpu"],
  "macbook-pro-14-inch": ["color", "ram", "storage", "gpu"],
  "macbook-pro-16-inch": ["color", "ram", "storage", "gpu"],
  "macbook-m5-series": ["color", "ram", "storage", "gpu"],

  // -------------------------------------------------------
  // LAPTOP — Asus (Đã thêm color)
  // -------------------------------------------------------
  "asus-zenbook": ["color", "ram", "storage"],
  "asus-vivobook": ["color", "ram", "storage"],
  "asus-tuf-gaming": ["color", "ram", "storage"],
  "asus-rog": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // LAPTOP — Lenovo (Đã thêm color)
  // -------------------------------------------------------
  "lenovo-gaming-loq": ["color", "ram", "storage"],
  "lenovo-yoga": ["color", "ram", "storage"],
  "lenovo-legion-gaming": ["color", "ram", "storage"],
  "lenovo-thinkbook": ["color", "ram", "storage"],
  "lenovo-thinkpad": ["color", "ram", "storage"],
  "lenovo-ideapad": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // LAPTOP — Acer (Đã thêm color)
  // -------------------------------------------------------
  "acer-swift": ["color", "ram", "storage"],
  "acer-nitro": ["color", "ram", "storage"],
  "acer-aspire": ["color", "ram", "storage"],
  "acer-aspire-gaming": ["color", "ram", "storage"],
  "acer-predator": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // LAPTOP — Dell (Đã thêm color)
  // -------------------------------------------------------
  "dell-xps": ["color", "ram", "storage"],
  "dell-inspiron": ["color", "ram", "storage"],
  "dell-vostro": ["color", "ram", "storage"],
  "dell-latitude": ["color", "ram", "storage"],
  "dell-gaming-g-series": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // LAPTOP — HP (Đã thêm color)
  // -------------------------------------------------------
  "hp-14-15-14s-15s": ["color", "ram", "storage"],
  // "hp-co-ban": ["color", "ram", "storage"],
  // "hp-pavilion": ["color", "ram", "storage"],
  "hp-envy": ["color", "ram", "storage"],
  "hp-victus": ["color", "ram", "storage"],
  "hp-probook": ["color", "ram", "storage"],

  // -------------------------------------------------------
  // TIVI (Đã thêm color - thường là viền đen/bạc)
  // -------------------------------------------------------
  "tivi-qled": ["color", "size"],
  "tivi-4k": ["color", "size"],
  "google-tv": ["color", "size"],

  // -------------------------------------------------------
  // MÁY GIẶT (Đã thêm color)
  // -------------------------------------------------------
  "may-giat-cua-truoc": ["color", "capacity_washing"],
  "may-giat-cua-tren": ["color", "capacity_washing"],
  "may-giat-say": ["color", "capacity_washing"],

  // -------------------------------------------------------
  // MÁY LẠNH / ĐIỀU HÒA (Đã thêm color)
  // -------------------------------------------------------
  "may-lanh-dieu-hoa-1-chieu": ["color", "capacity_cooling"],
  "may-lanh-dieu-hoa-2-chieu": ["color", "capacity_cooling"],
  "may-lanh-dieu-hoa-inverter": ["color", "capacity_cooling"],

  // -------------------------------------------------------
  // TỦ LẠNH (Đã thêm color)
  // -------------------------------------------------------
  "tu-lanh-inverter": ["color", "capacity_fridge"],
  "tu-lanh-nhieu-cua": ["color", "capacity_fridge"],
  "side-by-side": ["color", "capacity_fridge"],
  mini: ["color", "capacity_fridge"],
  "tu-dong": ["color", "capacity_fridge"],

  // -------------------------------------------------------
  // ÂM THANH
  // -------------------------------------------------------
  "tai-nghe-nhet-tai": ["color"],
  "tai-nghe-chup-tai": ["color"],
  "tai-nghe-khong-day": ["color"],
  "loa-bluetooth": ["color"],
  "loa-karaoke": ["color"],
  "loa-vi-tinh": ["color"],

  // -------------------------------------------------------
  // GAMING GEAR
  // -------------------------------------------------------
  "tai-nghe": ["color"],
  loa: ["color"],
  "ban-phim": ["color"],
  chuot: ["color"],

  // -------------------------------------------------------
  // PHỤ KIỆN DI ĐỘNG (Đã thêm color vào sac-cap)
  // -------------------------------------------------------
  "sac-cap": ["color", "connection"],
  "sac-du-phong": ["color"],
  "bao-da-op-lung": ["color"],
  "mieng-dan-man-hinh": [],
  "but-cam-ung": ["color"],

  // -------------------------------------------------------
  // PHỤ KIỆN LAPTOP (Đã thêm color vào hub)
  // -------------------------------------------------------
  "chuot-2": ["color"],
  "ban-phim-2": ["color"],
  "hub-chuyen-doi": ["color", "connection"],
  "balo-tui-xach": ["color"],
  "but-trinh-chieu": ["color"],
  webcam: ["color"],
  "gia-do": ["color"],
  "mieng-lot-chuot": ["color"],
  "phu-ban-phim": ["color"],
};

export async function seedCategoryVariantAttributes(prisma: PrismaClient) {
  console.log("🌱 Seeding category_variant_attributes (explicit map mode)...");

  for (const [slug, attributeCodes] of Object.entries(CATEGORY_ATTRIBUTE_MAP)) {
    if (!attributeCodes.length) continue;

    const category = await prisma.categories.findUnique({ where: { slug } });
    if (!category) {
      console.warn(`  ⚠️  Category not found: "${slug}" — skipping`);
      continue;
    }

    const attributes = await prisma.attributes.findMany({
      where: { code: { in: attributeCodes } },
    });

    for (const attr of attributes) {
      await prisma.category_variant_attributes.upsert({
        where: {
          categoryId_attributeId: {
            categoryId: category.id,
            attributeId: attr.id,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          attributeId: attr.id,
        },
      });
    }

    console.log(`  ✅ ${slug} → [${attributeCodes.join(", ")}]`);
  }

  console.log("✅ category_variant_attributes seeded\n");
}
