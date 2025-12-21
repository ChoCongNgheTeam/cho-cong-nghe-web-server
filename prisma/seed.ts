import { PrismaClient } from "@prisma/client";
import {
  seedBrands,
  seedCategories,
  seedAttributes,
  seedHighlights,
  seedPaymentMethods,
  seedUsers,
  seedProducts,
  seedVariants,
  seedUserAddresses,
  seedVouchers,
} from "./seeds";

const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu seeding dữ liệu...");

  const brands = await seedBrands();
  const categories = await seedCategories();
  const attributes = await seedAttributes();
  const highlights = await seedHighlights();
  await seedPaymentMethods();
  const users = await seedUsers();
  await seedVouchers();
  await seedUserAddresses({ users });

  const products = await seedProducts({ brands, categories, highlights });
  await seedVariants({ products, attributes });

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
