import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "./generate-unique-slug";

interface CategorySeedData {
  name: string;
  description?: string;
  categoryImage?: string;
  parentName?: string;
}

export async function seedCategoryGroup(
  prisma: PrismaClient,
  categoryData: CategorySeedData[],
  groupName?: string
) {
  if (groupName) {
    console.log(`  📦 Seeding ${groupName}...`);
  }

  const created: any[] = [];

  // Tạo root categories trước
  const rootCategories = categoryData.filter((c) => !c.parentName);
  for (const cat of rootCategories) {
    const siblingCount = await prisma.categories.count({
      where: { parentId: null },
    });

    const slug = await generateUniqueSlug(prisma.categories, cat.name);
    const category = await prisma.categories.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug,
        description: cat.description,
        categoryImage: cat.categoryImage,
        position: siblingCount,
      },
    });
    created.push(category);
  }

  // Tạo children - có thể có nhiều cấp
  const childCategories = categoryData.filter((c) => c.parentName);

  // Lặp cho đến khi tạo hết tất cả children (support multi-level)
  let remainingChildren = [...childCategories];
  let previousCount = remainingChildren.length;

  while (remainingChildren.length > 0) {
    const processedInThisRound: CategorySeedData[] = [];

    for (const cat of remainingChildren) {
      const parent = await prisma.categories.findUnique({
        where: { name: cat.parentName! },
      });

      // Nếu parent chưa tồn tại, skip qua và sẽ xử lý ở vòng lặp sau
      if (!parent) continue;

      const siblingCount = await prisma.categories.count({
        where: { parentId: parent.id },
      });

      const slug = await generateUniqueSlug(prisma.categories, cat.name);
      const category = await prisma.categories.upsert({
        where: { name: cat.name },
        update: {},
        create: {
          name: cat.name,
          slug,
          description: cat.description,
          categoryImage: cat.categoryImage,
          parentId: parent.id,
          position: siblingCount,
        },
      });
      created.push(category);
      processedInThisRound.push(cat);
    }

    // Remove processed items
    remainingChildren = remainingChildren.filter((c) => !processedInThisRound.includes(c));

    // Tránh infinite loop nếu có parent không tồn tại
    if (remainingChildren.length === previousCount) {
      const missingParents = remainingChildren.map((c) => c.parentName).join(", ");
      throw new Error(`Cannot create categories. Missing parents: ${missingParents}`);
    }
    previousCount = remainingChildren.length;
  }

  if (groupName) {
    console.log(`    ✅ Created ${created.length} categories for ${groupName}`);
  }

  return created;
}
