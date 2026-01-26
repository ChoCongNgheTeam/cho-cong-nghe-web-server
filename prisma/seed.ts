import { PrismaClient } from "@prisma/client";
import {
  seedBrands,
  seedCategories,
  seedAttributeOptions,
  seedSpecifications,
  seedProductSpecifications,
  seedProductHighlights,
  // seedReviews,
  seedPaymentMethods,
  seedUsers,
  seedProducts,
  seedVariants,
  seedProductColorImages,
  seedUserAddresses,
  seedVouchers,
  seedPromotions,
  seedBlogs,
} from "./seeds";

const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu seeding dữ liệu...");

  const brands = await seedBrands();
  const categories = await seedCategories();
  const attributes = await seedAttributeOptions();
  await seedSpecifications();
  await seedPaymentMethods();
  const users = await seedUsers();
  await seedVouchers();

  await seedPromotions();

  await seedUserAddresses({ users });

  const products = await seedProducts({
    brands,
    categories,
  });
  await seedProductSpecifications();
  await seedProductHighlights();
  await seedVariants({ products });
  await seedProductColorImages({ products });

  await seedBlogs();

  console.log("Seeding hoàn tất thành công!");
}

main()
  .catch((e) => {
    console.error("Lỗi khi seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
