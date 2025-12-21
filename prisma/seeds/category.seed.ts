import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "./utils";

const prisma = new PrismaClient();

const categoryData = [
  {
    name: "Điện thoại",
    slug: "dien-thoai",
    description: "Điện thoại cơ bản",
    categoryImage: "./images/categories/dien-thoai.png",
  },
  { name: "Laptop", slug: "laptop" },
  { name: "Phụ kiện", slug: "phu-kien" },
  { name: "Tai nghe", slug: "tai-nghe", parentName: "Phụ kiện" },
  { name: "iPhone", slug: "iphone", parentName: "Điện thoại" },
  { name: "Galaxy", slug: "galaxy", parentName: "Điện thoại" },
];

export async function seedCategories() {
  console.log("Seeding categories...");

  const created: any[] = [];

  // Tạo root categories trước
  for (const cat of categoryData.filter((c) => !c.parentName)) {
    const slug = cat.slug || (await generateUniqueSlug(prisma.categories, cat.name));
    const category = await prisma.categories.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug,
        description: cat.description,
        categoryImage: cat.categoryImage,
      },
    });
    created.push(category);
  }

  // Tạo children (cần parent đã tồn tại)
  for (const cat of categoryData.filter((c) => c.parentName)) {
    const parent = await prisma.categories.findUnique({ where: { name: cat.parentName! } });
    if (!parent) throw new Error(`Parent category ${cat.parentName} không tồn tại`);

    const slug = cat.slug || (await generateUniqueSlug(prisma.categories, cat.name));
    const category = await prisma.categories.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug,
        description: cat.description,
        categoryImage: cat.categoryImage,
        parentId: parent.id,
      },
    });
    created.push(category);
  }

  console.log(`🚶‍➡️    Đã tạo ${created.length} categories`);
  return created;
}
