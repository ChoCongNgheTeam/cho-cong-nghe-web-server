import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

const prisma = new PrismaClient();

const brandData = [
  {
    name: "Apple",
    description: "Thiết bị công nghệ cao cấp",
    brandImage: "./images/brands/apple.png",
  },
  {
    name: "Samsung",
    description: "Điện thoại và thiết bị Hàn Quốc",
    brandImage: "./images/brands/samsung.png",
  },
  {
    name: "Xiaomi",
    description: "Giá rẻ, hiệu năng cao",
    brandImage: "./images/brands/xiaomi.png",
  },
  {
    name: "Sony",
    description: "Âm thanh và hình ảnh chất lượng",
    brandImage: "./images/brands/sony.png",
  },
];

export async function seedBrands() {
  console.log("Seeding brands...");

  const brands = [];
  for (const data of brandData) {
    const slug = await generateUniqueSlug(prisma.brands, data.name);
    const brand = await prisma.brands.upsert({
      where: { name: data.name },
      update: {},
      create: { ...data, slug },
    });
    brands.push(brand);
  }

  console.log(`🚶‍➡️    Đã tạo ${brands.length} brands`);
  return brands;
}
