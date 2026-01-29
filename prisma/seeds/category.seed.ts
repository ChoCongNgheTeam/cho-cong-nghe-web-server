import { PrismaClient } from "@prisma/client";
import { seedCategoryGroup } from "prisma/seeds/seed-category-helper";
import {
  phoneCategoryData,
  laptopCategoryData,
  dienMayCategoryData,
  phuKienCategoryData,
} from "../seed-data/categories";

export async function seedCategories(prisma: PrismaClient) {
  console.log("🌱 Seeding categories...");

  const allCreated = [];

  // Seed categories group

  const phoneCategories = await seedCategoryGroup(prisma, phoneCategoryData, "Điện thoại");
  allCreated.push(...phoneCategories);

  const laptopCategories = await seedCategoryGroup(prisma, laptopCategoryData, "Laptop");
  allCreated.push(...laptopCategories);

  const dienmayCategories = await seedCategoryGroup(prisma, dienMayCategoryData, "Điện máy");
  allCreated.push(...dienmayCategories);

  const phuKienCategories = await seedCategoryGroup(prisma, phuKienCategoryData, "Phụ kiện");
  allCreated.push(...phuKienCategories);

  console.log(`\n✨ Tổng cộng đã tạo ${allCreated.length} categories\n`);
  return allCreated;
}
