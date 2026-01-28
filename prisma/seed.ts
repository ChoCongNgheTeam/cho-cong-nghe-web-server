import { PrismaClient } from "@prisma/client";
import {
  seedBrands,
  seedCategories,
  seedAttributeOptions,
  seedSpecifications,
  seedProductSpecifications,
  seedProductHighlights,
  seedPaymentMethods,
  seedUsers,
  seedProducts,
  seedVariants,
  seedProductColorImages,
  seedUserAddresses,
  seedVouchers,
  seedPromotions,
  seedBlogs,
  seedComments,
  seedImageMedia,
} from "./seeds";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Start seeding...");

  const brands = await seedBrands(prisma);

  const categories = await seedCategories(prisma);

  const users = await seedUsers(prisma);

  await seedUserAddresses(prisma, { users });

  console.log("Seeding attribute options and specifications...");

  await seedAttributeOptions(prisma);
  await seedSpecifications(prisma);

  const products = await seedProducts(prisma, {
    brands,
    categories,
  });

  (await seedProductSpecifications(prisma),
    await seedProductHighlights(prisma),
    await seedVariants(prisma, { products }),
    await seedProductColorImages(prisma, { products }),
    await Promise.all([
      seedPaymentMethods(prisma),
      seedVouchers(prisma),
      seedPromotions(prisma),
      seedBlogs(prisma),
      seedComments(prisma),
      seedImageMedia(prisma),
    ]));

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
