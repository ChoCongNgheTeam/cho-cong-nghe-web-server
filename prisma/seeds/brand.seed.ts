import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

const brandData = [
  // Điện thoại & Tablet
  {
    name: "Apple",
    description: "iPhone, iPad, MacBook và hệ sinh thái cao cấp",
    imagePath: "brands/apple.webp",
    categoryGroup: "Điện thoại",
  },
  {
    name: "Samsung",
    description: "Galaxy S, Z Fold/Flip, A, M series và thiết bị gia dụng",
    imagePath: "brands/samsung.webp",
    categoryGroup: "Điện thoại",
  },
  {
    name: "Xiaomi",
    description: "Redmi, Poco, Xiaomi series - giá tốt, cấu hình mạnh",
    imagePath: "brands/xiaomi.webp",
    categoryGroup: "Điện thoại",
  },
  {
    name: "OPPO",
    description: "Reno, Find, A series - camera đẹp, thiết kế thời thượng",
    imagePath: "brands/oppo.webp",
    categoryGroup: "Điện thoại",
  },

  // Laptop & MacBook
  {
    name: "Apple MacBook",
    description: "MacBook Air, MacBook Pro - M series chip mạnh mẽ",
    imagePath: "brands/apple-macbook.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Asus",
    description: "ZenBook, VivoBook, ROG, TUF Gaming",
    imagePath: "brands/asus.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Lenovo",
    description: "ThinkPad, Legion, Yoga, LOQ, IdeaPad",
    imagePath: "brands/lenovo.webp",
    categoryGroup: "Laptop",
  },
  {
    name: "Acer",
    description: "Predator, Nitro, Swift, Aspire",
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

  // Điện máy - Gia dụng
  {
    name: "Samsung",
    description: "Tivi QLED, tủ lạnh, máy giặt, điều hòa",
    imagePath: "brands/samsung.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "LG",
    description: "Tivi OLED/QNED, tủ lạnh, máy giặt, điều hòa",
    imagePath: "brands/lg.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "TCL",
    description: "Tivi Google TV, QLED giá tốt",
    imagePath: "brands/tcl.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Panasonic",
    description: "Điều hòa, tủ lạnh, máy giặt",
    imagePath: "brands/panasonic.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Electrolux",
    description: "Máy giặt, tủ lạnh, điều hòa",
    imagePath: "brands/electrolux.webp",
    categoryGroup: "Điện máy",
  },
  {
    name: "Toshiba",
    description: "Tủ lạnh, máy giặt, điều hòa",
    imagePath: "brands/toshiba.webp",
    categoryGroup: "Điện máy",
  },

  // Âm thanh & Gaming Gear
  {
    name: "Sony",
    description: "Tai nghe, loa, âm thanh chất lượng cao",
    imagePath: "brands/sony.webp",
    categoryGroup: "Âm thanh",
  },
  {
    name: "JBL",
    description: "Loa Bluetooth, tai nghe, loa karaoke",
    imagePath: "brands/jbl.webp",
    categoryGroup: "Âm thanh",
  },
  {
    name: "Anker",
    description: "Loa Soundcore, tai nghe, sạc dự phòng",
    imagePath: "brands/anker.webp",
    categoryGroup: "Âm thanh",
  },
  {
    name: "Logitech",
    description: "Chuột, bàn phím, tai nghe gaming, webcam",
    imagePath: "brands/logitech.webp",
    categoryGroup: "Gaming Gear",
  },
  {
    name: "Razer",
    description: "Chuột, bàn phím, tai nghe, laptop gaming",
    imagePath: "brands/razer.webp",
    categoryGroup: "Gaming Gear",
  },

  // Phụ kiện chung
  {
    name: "Baseus",
    description: "Sạc, cáp, ốp lưng, sạc dự phòng",
    imagePath: "brands/baseus.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Anker",
    description: "Sạc dự phòng, sạc nhanh, cáp chất lượng cao",
    imagePath: "brands/anker.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Ugreen",
    description: "Hub, cáp, sạc, phụ kiện laptop & điện thoại",
    imagePath: "brands/ugreen.webp",
    categoryGroup: "Phụ kiện",
  },
  {
    name: "Xiaomi",
    description: "Phụ kiện Mi, Redmi, sạc, ốp, tai nghe",
    imagePath: "brands/xiaomi.webp",
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
        // Nếu bảng brands có thêm field categoryGroup thì thêm dòng này
        // categoryGroup: data.categoryGroup,
      },
      create: {
        name: data.name,
        slug,
        description: data.description,
        imagePath: data.imagePath,
        // categoryGroup: data.categoryGroup, // nếu có field này
      },
    });

    brands.push(brand);
  }

  console.log(`Seeded ${brands.length} brands successfully!`);
  return brands;
}
