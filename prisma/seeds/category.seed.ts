import { PrismaClient } from "@prisma/client";
import { seedCategoryGroup } from "@/utils/seed-category-helper";
import {
  phoneCategoryData,
  laptopCategoryData,
  dienMayCategoryData,
  phuKienCategoryData,
  congNgheThietBiSoData,
} from "../seed-data/categories";

const prisma = new PrismaClient();

export async function seedCategories() {
  console.log("🌱 Seeding categories...");

  const allCreated = [];

  // Seed từng nhóm
  const phoneCategories = await seedCategoryGroup(prisma, phoneCategoryData, "Điện thoại");
  allCreated.push(...phoneCategories);

  const laptopCategories = await seedCategoryGroup(prisma, laptopCategoryData, "Laptop");
  allCreated.push(...laptopCategories);

  const dienmayCategories = await seedCategoryGroup(prisma, dienMayCategoryData, "Điện máy");
  allCreated.push(...dienmayCategories);

  const phuKienCategories = await seedCategoryGroup(prisma, phuKienCategoryData, "Phụ kiện");
  allCreated.push(...phuKienCategories);

  const congNgheThietBiSoCategories = await seedCategoryGroup(
    prisma,
    congNgheThietBiSoData,
    "Công nghệ & thiết bị số"
  );
  allCreated.push(...congNgheThietBiSoCategories);

  console.log(`\n✨ Tổng cộng đã tạo ${allCreated.length} categories\n`);
  return allCreated;
}
