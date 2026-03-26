import { PrismaClient } from "@prisma/client";
import { specificationGroupsByCategory } from "../seed-data/specifications";

export async function seedSpecifications(prisma: PrismaClient) {
  console.log("🌱 Seeding Specifications & connects categories...");

  let totalSpecs = 0;
  let totalLinks = 0;

  for (const [categorySlug, groups] of Object.entries(specificationGroupsByCategory)) {
    console.log(`Processing category: ${categorySlug}`);

    const category = await prisma.categories.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      console.warn(`⚠️ Category slug "${categorySlug}" not found. Skipping...`);
      continue;
    }

    let groupOrder = 0;

    for (const groupData of groups) {
      groupOrder++;

      // Seed từng spec trong nhóm
      for (const [specIndex, specData] of groupData.specifications.entries()) {
        const spec = await prisma.specifications.upsert({
          where: { key: specData.key },
          update: {
            name: specData.name,
            group: groupData.name,
            unit: specData.unit ?? null,
            icon: specData.icon ?? null,
            isFilterable: specData.isFilterable ?? false,
            filterType: specData.filterType ?? null,
            isRequired: specData.isRequired ?? false,
            sortOrder: specData.sortOrder ?? specIndex,
          },
          create: {
            key: specData.key,
            name: specData.name,
            group: groupData.name,
            unit: specData.unit ?? null,
            icon: specData.icon ?? null,
            isFilterable: specData.isFilterable ?? false,
            filterType: specData.filterType ?? null,
            isRequired: specData.isRequired ?? false,
            sortOrder: specData.sortOrder ?? specIndex,
          },
        });

        totalSpecs++;

        // Liên kết spec với category qua pivot
        await prisma.category_specifications.upsert({
          where: {
            categoryId_specificationId: {
              categoryId: category.id,
              specificationId: spec.id,
            },
          },
          update: {
            groupName: groupData.name,
            isRequired: specData.isRequired ?? false,
            sortOrder: groupOrder,
          },
          create: {
            categoryId: category.id,
            specificationId: spec.id,
            groupName: groupData.name,
            isRequired: specData.isRequired ?? false,
            sortOrder: groupOrder,
          },
        });

        totalLinks++;
      }
    }
  }

  // console.log(`\n Seeded Specifications & connects categories`);
  // console.log(`- Tổng ${totalSpecs} specifications`);
  // console.log(`- Tổng ${totalLinks} liên kết category ↔ specification\n`);

  return { totalSpecs, totalLinks };
}
