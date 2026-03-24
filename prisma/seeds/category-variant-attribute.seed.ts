import { PrismaClient, categories } from "@prisma/client";

const CATEGORY_ATTRIBUTE_OVERRIDE: Record<string, string[]> = {
  "dien-thoai": ["color", "storage"],
  "oppo-reno-series": ["storage"],
  tivi: ["color", "size"],
};

/**
 * Tìm attributeCodes của category
 * - Nếu category có override → dùng
 * - Không có → tìm cha
 */
async function resolveAttributeCodes(prisma: PrismaClient, category: categories): Promise<string[]> {
  let current: categories | null = category;

  while (current) {
    if (CATEGORY_ATTRIBUTE_OVERRIDE[current.slug]) {
      return CATEGORY_ATTRIBUTE_OVERRIDE[current.slug];
    }

    if (!current.parentId) break;

    current = await prisma.categories.findUnique({
      where: { id: current.parentId },
    });
  }

  return [];
}

export async function seedCategoryVariantAttributes(prisma: PrismaClient) {
  console.log("🌱 Seeding category_variant_attributes (inherit mode)...");

  // lấy toàn bộ category
  const categories = await prisma.categories.findMany();

  for (const category of categories) {
    // resolve attribute theo cây cha → con
    const attributeCodes = await resolveAttributeCodes(prisma, category);

    if (!attributeCodes.length) continue;

    // lấy attribute
    const attributes = await prisma.attributes.findMany({
      where: { code: { in: attributeCodes } },
    });

    for (const attr of attributes) {
      await prisma.category_variant_attributes.upsert({
        where: {
          categoryId_attributeId: {
            categoryId: category.id,
            attributeId: attr.id,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          attributeId: attr.id,
        },
      });
    }

    console.log(`${category.slug} → ${attributeCodes.join(", ")}`);
  }

  console.log(" category_variant_attributes seeded (inheritance OK)");
}
