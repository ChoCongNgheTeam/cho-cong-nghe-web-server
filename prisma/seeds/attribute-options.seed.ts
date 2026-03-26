import { PrismaClient } from "@prisma/client";

/**
 * ATTRIBUTE SYSTEM - MAPPING THEO CATEGORY
 * ==========================================
 *
 * ĐIỆN THOẠI (iPhone, Samsung, OPPO, Xiaomi)
 *   → color, storage, ram
 *
 * LAPTOP (MacBook)
 *   → ram, storage, gpu
 *
 * LAPTOP KHÁC (Asus, Dell, HP, Lenovo, Acer)
 *   → ram, storage
 *   (GPU, CPU là specification cố định, không phải variant)
 *
 * TIVI
 *   → size  (43", 50", 55", 65", 75", 85")
 *   Lưu ý: Mỗi model code khác nhau (QA55Q60D vs QA65Q60D) → thường là
 *   2 product riêng. Nếu cùng model code chỉ khác inch → dùng variant size.
 *
 * MÁY LẠNH / ĐIỀU HÒA
 *   → capacity_cooling  (1HP, 1.5HP, 2HP, 2.5HP)
 *   Lưu ý: Comfee CFS-13VGP vs CFS-18VGP là 2 model code khác nhau
 *   → 2 product riêng, KHÔNG dùng variant.
 *   Còn Mijia "Pro Eco Star" 1HP vs 1.5HP cùng dòng → 1 product, 2 variants.
 *
 * MÁY GIẶT
 *   → capacity_washing  (7kg, 8kg, 9kg, 10kg, 11kg, 12kg)
 *
 * TỦ LẠNH
 *   → capacity_fridge  (200L, 253L, 300L, 350L, 400L, 500L, 600L)
 *
 * TAI NGHE / EARPODS
 *   → color, connection  (USB-C, Lightning, Wireless/Bluetooth)
 *
 * PHỤ KIỆN DI ĐỘNG (Sạc, Cáp...)
 *   → connection  (USB-C, Lightning, Micro-USB...)
 *
 * ==========================================
 * NGUYÊN TẮC PHÂN BIỆT VARIANT vs PRODUCT RIÊNG:
 *   - Cùng model code (tên dòng), chỉ khác 1 thông số → VARIANT
 *   - Khác model code hoàn toàn (VD: CFS-13VGP vs CFS-18VGP) → PRODUCT RIÊNG
 * ==========================================
 */

const attributeOptionsData: Record<
  string,
  {
    name: string;
    options: { value: string; label: string }[];
  }
> = {
  // ------------------------------------------------------------------
  // DÙNG CHO: Điện thoại, Laptop, Tai nghe có màu sắc
  // ------------------------------------------------------------------
  color: {
    name: "Màu sắc",
    options: [
      { value: "black", label: "Đen" },
      { value: "white", label: "Trắng" },
      { value: "red", label: "Đỏ" },
      { value: "pink", label: "Hồng" },
      { value: "blue", label: "Xanh dương" },
      { value: "light-blue", label: "Xanh nhạt" },
      { value: "sky-blue", label: "Xanh Sky Blue" },
      { value: "cobalt", label: "Tím Cobalt" },
      { value: "green", label: "Xanh lá" },
      { value: "alpine-green", label: "Xanh rêu" },
      { value: "gray", label: "Xám" },
      { value: "orange", label: "Cam" },
      { value: "yellow", label: "Vàng" },
      { value: "silver", label: "Bạc" },
      { value: "gold", label: "Vàng Gold" },
      { value: "purple", label: "Tím" },
      { value: "titan-black", label: "Titan đen" },
      { value: "titan-white", label: "Titan trắng" },
      { value: "titan-natural", label: "Titan tự nhiên" },
      { value: "titan-desert", label: "Titan sa mạc" },
      { value: "orean", label: "Xanh Orean" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Điện thoại, Laptop, MacBook
  // ------------------------------------------------------------------
  storage: {
    name: "Bộ nhớ trong",
    options: [
      { value: "64gb", label: "64GB" },
      { value: "128gb", label: "128GB" },
      { value: "256gb", label: "256GB" },
      { value: "512gb", label: "512GB" },
      { value: "1tb", label: "1TB" },
      { value: "2tb", label: "2TB" },
      { value: "4tb", label: "4TB" },
      { value: "8tb", label: "8TB" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Điện thoại Android (Samsung, OPPO, Xiaomi), Laptop
  // (iPhone KHÔNG có RAM option - RAM là specification cố định)
  // ------------------------------------------------------------------
  ram: {
    name: "RAM",
    options: [
      { value: "4gb", label: "4GB" },
      { value: "6gb", label: "6GB" },
      { value: "8gb", label: "8GB" },
      { value: "12gb", label: "12GB" },
      { value: "16gb", label: "16GB" },
      { value: "18gb", label: "18GB" },
      { value: "24gb", label: "24GB" },
      { value: "32gb", label: "32GB" },
      { value: "36gb", label: "36GB" },
      { value: "48gb", label: "48GB" },
      { value: "64gb", label: "64GB" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: MacBook (GPU core count là variant selector)
  // Laptop khác: GPU thường là specification cố định, không phải variant
  // ------------------------------------------------------------------
  gpu: {
    name: "GPU",
    options: [
      { value: "7core", label: "7-core GPU" },
      { value: "8core", label: "8-core GPU" },
      { value: "10core", label: "10-core GPU" },
      { value: "16core", label: "16-core GPU" },
      { value: "18core", label: "18-core GPU" },
      { value: "20core", label: "20-core GPU" },
      { value: "30core", label: "30-core GPU" },
      { value: "32core", label: "32-core GPU" },
      { value: "38core", label: "38-core GPU" },
      { value: "40core", label: "40-core GPU" },
    ],
  },

  cpu: {
    name: "CPU",
    options: [
      { value: "8core", label: "8-core CPU" },
      { value: "10core", label: "10-core CPU" },
      { value: "12core", label: "12-core CPU" },
      { value: "14core", label: "14-core CPU" },
      { value: "16core", label: "16-core CPU" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Tivi
  // Lưu ý: Chỉ dùng khi cùng model code khác inch (VD: Q60D 43"/55"/65")
  // Nếu model code khác nhau hoàn toàn → tạo product riêng
  // ------------------------------------------------------------------
  size: {
    name: "Kích thước màn hình",
    options: [
      { value: "32-inch", label: "32 inch" },
      { value: "43-inch", label: "43 inch" },
      { value: "50-inch", label: "50 inch" },
      { value: "55-inch", label: "55 inch" },
      { value: "65-inch", label: "65 inch" },
      { value: "75-inch", label: "75 inch" },
      { value: "85-inch", label: "85 inch" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Máy lạnh / Điều hòa
  // Khi nào dùng: cùng dòng sản phẩm (VD: Mijia Pro Eco Star) chỉ khác HP
  // Khi nào KHÔNG dùng: model code khác nhau → product riêng
  //   VD: Comfee CFS-13VGP (1.5HP) và CFS-18VGP (2HP) → 2 product riêng
  // ------------------------------------------------------------------
  capacity_cooling: {
    name: "Công suất làm lạnh",
    options: [
      { value: "1hp", label: "1 HP (~9.000 BTU)" },
      { value: "1-5hp", label: "1.5 HP (~12.000 BTU)" },
      { value: "2hp", label: "2 HP (~18.000 BTU)" },
      { value: "2-5hp", label: "2.5 HP (~24.000 BTU)" },
      { value: "3hp", label: "3 HP (~28.000 BTU)" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Máy giặt
  // ------------------------------------------------------------------
  capacity_washing: {
    name: "Khối lượng giặt",
    options: [
      { value: "7kg", label: "7 kg" },
      { value: "8kg", label: "8 kg" },
      { value: "9kg", label: "9 kg" },
      { value: "10kg", label: "10 kg" },
      { value: "11kg", label: "11 kg" },
      { value: "12kg", label: "12 kg" },
      { value: "14kg", label: "14 kg" },
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Tủ lạnh
  // ------------------------------------------------------------------
  capacity_fridge: {
    name: "Dung tích tủ lạnh",
    options: [
      { value: "100l", label: "100 lít" },
      { value: "150l", label: "150 lít" },
      { value: "200l", label: "200 lít" },
      { value: "230l", label: "230 lít" },
      { value: "236l", label: "236 lít" }, // Thêm mới từ Samsung RT22
      { value: "253l", label: "253 lít" },
      { value: "255l", label: "255 lít" }, // Thêm mới từ Panasonic NR-BV280
      { value: "300l", label: "300 lít" },
      { value: "350l", label: "350 lít" },
      { value: "400l", label: "400 lít" },
      { value: "401l", label: "401 lít" }, // Thêm mới từ Sharp SJ-FX52
      { value: "430l", label: "430 lít" }, // Thêm mới từ Casper RM-520
      { value: "500l", label: "500 lít" },
      { value: "600l", label: "600 lít" },
      { value: "635l", label: "635 lít" }, // Thêm mới từ LG GR-D257
      { value: "648l", label: "648 lít" }, // Thêm mới từ Samsung RS64
    ],
  },

  // ------------------------------------------------------------------
  // DÙNG CHO: Tai nghe có dây (EarPods), Sạc, Cáp, Phụ kiện
  // ------------------------------------------------------------------
  connection: {
    name: "Cổng kết nối",
    options: [
      { value: "usb-c", label: "USB-C" },
      { value: "lightning", label: "Lightning" },
      { value: "micro-usb", label: "Micro-USB" },
      { value: "3-5mm", label: "3.5mm Jack" },
      { value: "wireless", label: "Không dây (Bluetooth)" },
    ],
  },
};

export async function seedAttributesAndOptions(prisma: PrismaClient) {
  console.log("🌱 Seeding attributes & options...");

  for (const [code, data] of Object.entries(attributeOptionsData)) {
    const attribute = await prisma.attributes.upsert({
      where: { code },
      update: { name: data.name },
      create: { code, name: data.name },
    });

    for (const opt of data.options) {
      await prisma.attributes_options.upsert({
        where: {
          attributeId_value: {
            attributeId: attribute.id,
            value: opt.value,
          },
        },
        update: { label: opt.label },
        create: {
          attributeId: attribute.id,
          value: opt.value,
          label: opt.label,
        },
      });
    }

    console.log(`  ✅ [${code}] → ${data.options.length} options`);
  }

  console.log("✅ Seeded attributes & options\n");
}
