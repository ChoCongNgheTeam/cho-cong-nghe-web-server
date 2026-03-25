import { PrismaClient } from "@prisma/client";
import { productSpecificationsData } from "../seed-data/product-specifications";

export async function seedProductSpecifications(prisma: PrismaClient) {
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

    console.log(`Processing: ${product.name} (${item.specifications.length} specifications)`);

    for (const [index, specItem] of item.specifications.entries()) {
      // Tìm specification theo key (giả định key là unique)
      const specification = await prisma.specifications.findUnique({
        where: { key: specItem.key },
        select: { id: true, key: true },
      });

      if (!specification) {
        console.warn(`⚠️ Specification key không tồn tại: ${specItem.key} → bỏ qua`);
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
          update: {},
          create: {
            productId: product.id,
            specificationId: specification.id,
            value: specItem.value,
            sortOrder: index,
            isHighlight: false,
          },
        });

        totalCreated++;
        console.log(`Seeded ${specItem.key} = ${specItem.value}`);
      } catch (err) {
        console.error(`⚠️ Error upsert ${specItem.key} cho ${product.name}:`, err);
        totalSkipped++;
      }
    }
  }

  // console.log(`🚀 Successfully seeded specifications`);
  // console.log(`   - Created / Updated: ${totalCreated}`);
  // console.log(`   - Skipped: ${totalSkipped}`);

  return { created: totalCreated, skipped: totalSkipped };
}
