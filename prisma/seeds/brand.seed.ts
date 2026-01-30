import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

const brandData = [
  {
    name: "Apple",
    description: "Đẳng cấp công nghệ, hệ điều hành tối ưu",
    imagePath: "brands/apple.webp",
  },
  {
    name: "Benco",
    description: "Điện thoại phổ thông, độ bền cao",
    imagePath: "brands/benco.webp",
  },
  {
    name: "Honor",
    description: "Thiết kế thời thượng, hiệu năng mạnh mẽ",
    imagePath: "brands/honor.webp",
  },
  {
    name: "Inoi",
    description: "Thương hiệu mới nổi, giá thành hợp lý",
    imagePath: "brands/inoi.webp",
  },
  {
    name: "Itel",
    description: "Smartphone giá rẻ cho mọi đối tượng",
    imagePath: "brands/itel.webp",
  },
  {
    name: "Masstel",
    description: "Thương hiệu Việt, chất lượng ổn định",
    imagePath: "brands/masstel.webp",
  },
  {
    name: "Mobell",
    description: "Điện thoại bình dân, dễ dàng sử dụng",
    imagePath: "brands/mobell.webp",
  },
  {
    name: "Nokia",
    description: "Biểu tượng độ bền, kết nối tin cậy",
    imagePath: "brands/nokia.webp",
  },
  {
    name: "OPPO",
    description: "Chuyên gia selfie, sạc nhanh dẫn đầu",
    imagePath: "brands/oppo.webp",
  },
  {
    name: "Realme",
    description: "Sức trẻ đột phá, cấu hình vượt tầm giá",
    imagePath: "brands/realme.webp",
  },
  {
    name: "Red Magic",
    description: "Gaming phone đỉnh cao, tản nhiệt cực tốt",
    imagePath: "brands/redmagic.webp",
  },
  {
    name: "Samsung",
    description: "Màn hình đỉnh cao, dẫn đầu xu hướng gập",
    imagePath: "brands/samsung.webp",
  },
  {
    name: "TCL",
    description: "Công nghệ hiển thị vượt trội từ tập đoàn đa quốc gia",
    imagePath: "brands/tcl.webp",
  },
  {
    name: "Tecno",
    description: "Thiết kế độc đáo, camera ấn tượng",
    imagePath: "brands/tecno.webp",
  },
  {
    name: "Viettel",
    description: "Sản phẩm viễn thông từ nhà mạng hàng đầu Việt Nam",
    imagePath: "brands/viettel.webp",
  },
  {
    name: "Vivo",
    description: "Âm thanh Hi-Fi, dẫn đầu công nghệ chụp ảnh",
    imagePath: "brands/vivo.webp",
  },
  {
    name: "Xiaomi",
    description: "Hệ sinh thái thông minh, cấu hình mạnh mẽ",
    imagePath: "brands/xiaomi.webp",
  },
  {
    name: "ZTE",
    description: "Tiên phong công nghệ 5G và camera ẩn dưới màn hình",
    imagePath: "brands/zte.webp",
  },
  {
    name: "Casper",
    description: "Casper",
    imagePath: "brands/casper.webp",
  },
  {
    name: "Comfee",
    description: "Comfee",
    imagePath: "brands/comfee.webp",
  },
  {
    name: "Sharp",
    description: "Sharp",
    imagePath: "brands/sharp.webp",
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
      create: { ...data, slug },
    });

    brands.push(brand);
  }

  console.log(`Seeded ${brands.length} brands`);
  return brands;
}
