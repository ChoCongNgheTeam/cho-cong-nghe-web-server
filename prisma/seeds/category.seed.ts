import { PrismaClient } from "@prisma/client";
import { seedCategoryGroup } from "prisma/seeds/seed-category-helper";
import {
  phoneCategoryData,
  laptopCategoryData,
  dienMayCategoryData,
  phuKienCategoryData,
  congNgheThietBiSoData,
  chamSocNhaCuaSucKhoeData,
  thietBiGiaDinhData,
  thietBiNhaBepData,
  ketNoiTienIchGiaiTriData,
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

  const congNgheThietBiSoCategories = await seedCategoryGroup(
    prisma,
    congNgheThietBiSoData,
    "Công nghệ & thiết bị số",
  );

  allCreated.push(...congNgheThietBiSoCategories);

  const chamSocNhaCuaSucKhoeCategories = await seedCategoryGroup(
    prisma,
    chamSocNhaCuaSucKhoeData,
    "Chăm sóc nhà cửa & sức khỏe",
  );

  allCreated.push(...chamSocNhaCuaSucKhoeCategories);

  const thietBiGiaDinhCategories = await seedCategoryGroup(
    prisma,
    thietBiGiaDinhData,
    "Thiết bị gia đình",
  );
  allCreated.push(...thietBiGiaDinhCategories);

  const thietBiNhaBepCategories = await seedCategoryGroup(
    prisma,
    thietBiNhaBepData,
    "Thiết bị nhà bếp",
  );
  allCreated.push(...thietBiNhaBepCategories);

  const ketNoiTienIchGiaiTriCategories = await seedCategoryGroup(
    prisma,
    ketNoiTienIchGiaiTriData,
    "Kết nối, tiện ích & giải trí",
  );
  allCreated.push(...ketNoiTienIchGiaiTriCategories);

  console.log(`\n✨ Tổng cộng đã tạo ${allCreated.length} categories\n`);
  return allCreated;
}
