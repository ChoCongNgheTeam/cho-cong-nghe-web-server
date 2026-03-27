import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

/**
 * BRAND DATA
 * ============================================================
 * Mỗi brand chỉ có 1 record duy nhất trong DB (upsert theo name).
 * categoryGroup chỉ dùng để phân loại khi đọc code, không lưu DB.
 *
 * NHÓM             BRAND
 * ─────────────────────────────────────────────────────────────
 * Điện thoại       Apple, Samsung, Xiaomi, OPPO
 * Laptop           Apple MacBook, Asus, Lenovo, Acer, Dell, HP
 * Tivi             Samsung, LG, TCL, Sony, Hisense, Skyworth
 * Điều hòa         Daikin, Mitsubishi Electric, Panasonic,
 *                  Midea, Gree, Carrier, Comfee, LG, Samsung
 * Máy giặt         Samsung, LG, Panasonic, Electrolux,
 *                  Aqua, Midea, Toshiba, Whirlpool, Comfee
 * Tủ lạnh          Samsung, LG, Panasonic, Electrolux,
 *                  Toshiba, Aqua, Midea, Beko, Whirlpool
 * Âm thanh         Sony, JBL, Anker (Soundcore), Bose,
 *                  Samsung, Xiaomi
 * Gaming Gear      Logitech, Razer, SteelSeries, HyperX, Asus ROG
 * Phụ kiện         Baseus, Anker, Ugreen, Belkin, Apple, Xiaomi
 * ============================================================
 */

const brandData: {
  name: string;
  description: string;
  imagePath: string;
  categoryGroup: string;
}[] = [
  // ─────────────────────────────────────────────────────────
  // ĐIỆN THOẠI
  // ─────────────────────────────────────────────────────────
  {
    name: "Apple",
    description: "iPhone, iPad, MacBook và hệ sinh thái cao cấp của Apple",
    imagePath: "brands/apple.webp",
    categoryGroup: "Điện thoại",
  },
  {
    name: "Samsung",
    description: "Galaxy S/Z/A/M series, tivi QLED, tủ lạnh, máy giặt, điều hòa",
    imagePath: "brands/samsung.webp",
    categoryGroup: "Điện thoại",
  },
  {
    name: "Xiaomi",
    description: "Redmi, Poco, Xiaomi series - giá tốt, cấu hình mạnh; phụ kiện Mi",
    imagePath: "brands/xiaomi.webp",
    categoryGroup: "Điện thoại",
  },
  {
    name: "OPPO",
    description: "Reno, Find, A series - camera đẹp, thiết kế thời thượng",
    imagePath: "brands/oppo.webp",
    categoryGroup: "Điện thoại",
  },

  // ─────────────────────────────────────────────────────────
  // LAPTOP
  // ─────────────────────────────────────────────────────────
  {
    name: "Apple MacBook",
    description: "MacBook Air, MacBook Pro - chip M series mạnh mẽ",
    imagePath: "brands/apple-macbook.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Asus",
    description: "ZenBook, VivoBook, ROG, TUF Gaming - đa dạng phân khúc",
    imagePath: "brands/asus.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Lenovo",
    description: "ThinkPad, Legion, Yoga, LOQ, IdeaPad - bền bỉ, đa dụng",
    imagePath: "brands/lenovo.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Acer",
    description: "Predator, Nitro, Swift, Aspire - từ gaming đến văn phòng",
    imagePath: "brands/acer.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Dell",
    description: "XPS, Inspiron, Latitude, Gaming G Series",
    imagePath: "brands/dell.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "HP",
    description: "Pavilion, Envy, Victus, ProBook, dòng cơ bản",
    imagePath: "brands/hp.webp",
    categoryGroup: "Laptop",
  },

  // ─────────────────────────────────────────────────────────
  // TIVI
  // ─────────────────────────────────────────────────────────
  {
    name: "LG",
    description: "Tivi OLED/QNED, tủ lạnh, máy giặt, điều hòa",
    imagePath: "brands/lg.webp",
    categoryGroup: "Tivi",
  },
  {
    name: "TCL",
    description: "Tivi Google TV, QLED giá tốt",
    imagePath: "brands/tcl.webp",
    categoryGroup: "Tivi",
  },
  {
    name: "Sony",
    description: "Tivi BRAVIA, tai nghe, loa - chất lượng hình ảnh & âm thanh hàng đầu",
    imagePath: "brands/sony.webp",
    categoryGroup: "Tivi",
  },
  {
    name: "Hisense",
    description: "Tivi ULED, QLED giá tốt - phổ biến tại thị trường Việt Nam",
    imagePath: "brands/hisense.webp",
    categoryGroup: "Tivi",
  },
  {
    name: "Skyworth",
    description: "Tivi Google TV, OLED giá hợp lý",
    imagePath: "brands/skyworth.webp",
    categoryGroup: "Tivi",
  },

  // ─────────────────────────────────────────────────────────
  // ĐIỀU HÒA / MÁY LẠNH
  // ─────────────────────────────────────────────────────────
  {
    name: "Daikin",
    description: "Điều hòa inverter cao cấp, tiết kiệm điện hàng đầu Nhật Bản",
    imagePath: "brands/daikin.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Mitsubishi Electric",
    description: "Điều hòa, máy lạnh công nghiệp - thương hiệu Nhật Bản uy tín",
    imagePath: "brands/mitsubishi-electric.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Panasonic",
    description: "Điều hòa, tủ lạnh, máy giặt - thương hiệu Nhật Bản bền bỉ",
    imagePath: "brands/panasonic.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Midea",
    description: "Điều hòa, tủ lạnh, máy giặt giá tốt - thương hiệu toàn cầu",
    imagePath: "brands/midea.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Gree",
    description: "Điều hòa inverter, giải pháp làm mát hiệu quả",
    imagePath: "brands/gree.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Carrier",
    description: "Điều hòa dân dụng và thương mại - thương hiệu Mỹ lâu đời",
    imagePath: "brands/carrier.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Comfee",
    description: "Điều hòa, máy giặt giá tốt - thương hiệu con của Midea",
    imagePath: "brands/comfee.webp",
    categoryGroup: "Điện máy",
  },

  // ─────────────────────────────────────────────────────────
  // MÁY GIẶT / TỦ LẠNH
  // ─────────────────────────────────────────────────────────
  {
    name: "Electrolux",
    description: "Máy giặt, tủ lạnh, điều hòa - thương hiệu Thụy Điển",
    imagePath: "brands/electrolux.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Toshiba",
    description: "Tủ lạnh, máy giặt - thương hiệu Nhật Bản",
    imagePath: "brands/toshiba.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Aqua",
    description: "Tủ lạnh, máy giặt giá tốt - thương hiệu phổ biến tại Việt Nam",
    imagePath: "brands/aqua.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Whirlpool",
    description: "Máy giặt, tủ lạnh - thương hiệu Mỹ uy tín toàn cầu",
    imagePath: "brands/whirlpool.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Beko",
    description: "Tủ lạnh, máy giặt - thương hiệu châu Âu chất lượng cao",
    imagePath: "brands/beko.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Sanaky",
    description: "Thương hiệu hàng đầu về tủ đông, tủ mát tại Việt Nam",
    imagePath: "brands/sanaky.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Kangaroo",
    description: "Tủ đông, máy lọc nước - thương hiệu gia dụng hàng đầu Việt Nam",
    imagePath: "brands/kangaroo.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Sunhouse",
    description: "Gia dụng, tủ đông, điện mát - niềm tự hào thương hiệu Việt",
    imagePath: "brands/sunhouse.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Alaska",
    description: "Chuyên các dòng tủ đông, tủ mát chất lượng tiêu chuẩn Mỹ",
    imagePath: "brands/alaska.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Hòa Phát",
    description: "Tủ đông, tủ lạnh - thương hiệu quốc dân bền bỉ của người Việt",
    imagePath: "brands/hoa-phat.webp",
    categoryGroup: "Điện máy",
  },

  // ─────────────────────────────────────────────────────────
  // ÂM THANH
  // ─────────────────────────────────────────────────────────
  {
    name: "JBL",
    description: "Loa Bluetooth, tai nghe, loa karaoke - âm thanh sống động",
    imagePath: "brands/jbl.webp",
    categoryGroup: "Âm thanh",
  },
  {
    name: "Anker",
    description: "Loa Soundcore, tai nghe, sạc dự phòng, sạc nhanh, cáp chất lượng cao",
    imagePath: "brands/anker.webp",
    categoryGroup: "Âm thanh",
  },
  {
    name: "Bose",
    description: "Tai nghe chống ồn, loa cao cấp - chất lượng âm thanh đỉnh cao",
    imagePath: "brands/bose.webp",
    categoryGroup: "Âm thanh",
  },

  // ─────────────────────────────────────────────────────────
  // GAMING GEAR
  // ─────────────────────────────────────────────────────────
  {
    name: "Logitech",
    description: "Chuột, bàn phím, tai nghe gaming, webcam - số 1 thế giới",
    imagePath: "brands/logitech.webp",
    categoryGroup: "Gaming Gear",
  },
  {
    name: "Razer",
    description: "Chuột, bàn phím, tai nghe gaming cao cấp",
    imagePath: "brands/razer.webp",
    categoryGroup: "Gaming Gear",
  },
  {
    name: "SteelSeries",
    description: "Tai nghe, chuột, bàn phím gaming chuyên nghiệp",
    imagePath: "brands/steelseries.webp",
    categoryGroup: "Gaming Gear",
  },
  {
    name: "HyperX",
    description: "Tai nghe, bàn phím, chuột gaming - thương hiệu của HP",
    imagePath: "brands/hyperx.webp",
    categoryGroup: "Gaming Gear",
  },
  {
    name: "Asus ROG",
    description: "Thiết bị gaming cao cấp: chuột, bàn phím, tai nghe, màn hình",
    imagePath: "brands/asus-rog.webp",
    categoryGroup: "Gaming Gear",
  },

  // ─────────────────────────────────────────────────────────
  // PHỤ KIỆN
  // ─────────────────────────────────────────────────────────
  {
    name: "Baseus",
    description: "Sạc, cáp, ốp lưng, sạc dự phòng - phụ kiện giá tốt",
    imagePath: "brands/baseus.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Ugreen",
    description: "Hub chuyển đổi, cáp, sạc, phụ kiện laptop & điện thoại",
    imagePath: "brands/ugreen.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Belkin",
    description: "Sạc MagSafe, cáp, phụ kiện Apple chính hãng",
    imagePath: "brands/belkin.webp",
    categoryGroup: "Phụ kiện",
  },
  // ─────────────────────────────────────────────────────────
  // THIẾT BỊ ĐIỆN MÁY (Tivi, Máy lạnh, Tủ lạnh, Máy giặt)
  // ─────────────────────────────────────────────────────────
  {
    name: "Casper",
    description: "Máy lạnh, tủ lạnh, máy giặt sấy - thương hiệu Thái Lan bền bỉ",
    imagePath: "brands/casper.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Coocaa",
    description: "Tivi thông minh - thiết kế hiện đại, giá thành tối ưu",
    imagePath: "brands/coocaa.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Sharp",
    description: "Tủ lạnh, đồ gia dụng - công nghệ Nhật Bản tiên tiến",
    imagePath: "brands/sharp.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Candy",
    description: "Máy sấy, máy giặt - thương hiệu Ý với hơn 70 năm lịch sử",
    imagePath: "brands/candy.webp",
    categoryGroup: "Điện máy",
  },

  // ─────────────────────────────────────────────────────────
  // ÂM THANH & GIẢI TRÍ (Audio & Gaming)
  // ─────────────────────────────────────────────────────────
  {
    name: "Marshall",
    description: "Loa, tai nghe Bluetooth - âm thanh rock n roll biểu tượng",
    imagePath: "brands/marshall.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Microlab",
    description: "Hệ thống loa vi tính, âm thanh giải trí gia đình",
    imagePath: "brands/microlab.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Dalton",
    description: "Chuyên gia âm thanh, loa kéo Karaoke công suất lớn",
    imagePath: "brands/dalton.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Nintendo",
    description: "Máy chơi game cầm tay và phụ kiện gaming độc quyền",
    imagePath: "brands/nintendo.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Corsair",
    description: "Bàn phím, linh kiện máy tính chuyên dụng cho game thủ",
    imagePath: "brands/corsair.webp",
    categoryGroup: "Phụ kiện",
  },

  // ─────────────────────────────────────────────────────────
  // PHỤ KIỆN CÔNG NGHỆ (Accessories & Computer-acc)
  // ─────────────────────────────────────────────────────────
  {
    name: "Miking",
    description: "Miếng dán cường lực, bảo vệ màn hình điện thoại cao cấp",
    imagePath: "brands/miking.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Targus",
    description: "Balo, túi xách laptop - giải pháp bảo vệ máy tính từ Mỹ",
    imagePath: "brands/targus.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "HyperWork",
    description: "Giá đỡ, phụ kiện setup góc làm việc công thái học",
    imagePath: "brands/hyperwork.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "JCPAL",
    description: "Phụ kiện cao cấp cho MacBook: Phủ phím, dán bảo vệ",
    imagePath: "brands/jcpal.webp",
    categoryGroup: "Phụ kiện",
  },
];

export async function seedBrands(prisma: PrismaClient) {
  console.log("🌱 Seeding brands...");

  const brands = [];

  for (const data of brandData) {
    const slug = await generateUniqueSlug(prisma.brands, data.name);

    const brand = await prisma.brands.upsert({
      where: { name: data.name },
      update: {
        description: data.description,
        imagePath: data.imagePath,
      },
      create: {
        name: data.name,
        slug,
        description: data.description,
        imagePath: data.imagePath,
      },
    });

    brands.push(brand);
    console.log(`  ✅ ${data.name}`);
  }

  console.log(`✅ Seeded ${brands.length} brands successfully!\n`);
  return brands;
}
