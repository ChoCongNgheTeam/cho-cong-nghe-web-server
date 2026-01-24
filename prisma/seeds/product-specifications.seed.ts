import { PrismaClient } from "@prisma/client";
import { productSpecificationsData } from "../seed-data/product-specifications";

const prisma = new PrismaClient();

export async function seedProductSpecifications() {
  console.log("🌱 Seeding product specifications...");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const item of productSpecificationsData) {
    // Tìm product theo slug
    const product = await prisma.products.findUnique({
      where: { slug: item.productSlug },
      select: { id: true, name: true },
    });

    if (!product) {
      console.warn(`⚠️ Product không tồn tại: ${item.productSlug} → bỏ qua`);
      totalSkipped += item.specifications.length;
      continue;
    }

    console.log(`  Processing: ${product.name} (${item.specifications.length} specifications)`);

    for (const [index, specItem] of item.specifications.entries()) {
      // Tìm specification theo key (giả định key là unique)
      const specification = await prisma.specifications.findUnique({
        where: { key: specItem.key },
        select: { id: true, key: true },
      });

      if (!specification) {
        console.warn(`    ⚠️ Specification key không tồn tại: ${specItem.key} → bỏ qua`);
        totalSkipped++;
        continue;
      }

      try {
        await prisma.product_specifications.upsert({
          where: {
            productId_specificationId: {
              productId: product.id,
              specificationId: specification.id,
            },
          },
          update: {
            value: specItem.value,
            sortOrder: index,
            isHighlight: false, // bạn có thể thêm logic highlight sau
          },
          create: {
            productId: product.id,
            specificationId: specification.id,
            value: specItem.value,
            sortOrder: index,
            isHighlight: false,
          },
        });

        totalCreated++;
        console.log(`    → Upserted: ${specItem.key} = ${specItem.value}`);
      } catch (err) {
        console.error(`    Lỗi khi upsert ${specItem.key} cho ${product.name}:`, err);
        totalSkipped++;
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🚀 Hoàn thành seeding specifications`);
  console.log(`   - Created / Updated: ${totalCreated}`);
  console.log(`   - Skipped: ${totalSkipped}`);
  console.log("=".repeat(50) + "\n");

  return { created: totalCreated, skipped: totalSkipped };
}

// Nếu bạn chạy trực tiếp file này (ví dụ: ts-node seed-product-specifications.ts)
if (require.main === module) {
  seedProductSpecifications()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
