import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

interface CategorySeedData {
  name: string;
  description?: string;
  imagePath?: string;
  parentName?: string;
  isFeatured?: boolean;
}

export async function seedCategoryGroup(prisma: PrismaClient, categoryData: CategorySeedData[], groupName?: string) {
  if (groupName) {
    console.log(` 🌱 Seeding ${groupName}`);
  }

  const created: any[] = [];
  // Map để track các category đã tạo trong nhóm này theo tên
  const categoryMap = new Map<string, any>();

  // Tạo root categories trước
  const rootCategories = categoryData.filter((c) => !c.parentName);
  for (const cat of rootCategories) {
    // Tìm theo name VÀ parentId (null cho root)
    const existing = await prisma.categories.findFirst({
      where: {
        name: cat.name,
        parentId: { equals: null }, // ✅ Đổi thành này
      },
    });

    let category;
    if (existing) {
      category = await prisma.categories.update({
        where: { id: existing.id },
        data: {
          description: cat.description,
          imagePath: cat.imagePath,
          isFeatured: cat.isFeatured,
        },
      });
    } else {
      const maxPosition = await prisma.categories.findFirst({
        where: { parentId: { equals: null } }, // ✅ Đổi thành này
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const nextPosition = (maxPosition?.position ?? -1) + 1;
      const slug = await generateUniqueSlug(prisma.categories, cat.name);

      category = await prisma.categories.create({
        data: {
          name: cat.name,
          slug,
          description: cat.description,
          imagePath: cat.imagePath,
          position: nextPosition,
          isFeatured: cat.isFeatured,
          // parentId sẽ tự động là null nếu không truyền
        },
      });
    }

    created.push(category);
    categoryMap.set(cat.name, category);
  }

  // Tạo children
  const childCategories = categoryData.filter((c) => c.parentName);
  let remainingChildren = [...childCategories];
  let previousCount = remainingChildren.length;

  while (remainingChildren.length > 0) {
    const processedInThisRound: CategorySeedData[] = [];

    for (const cat of remainingChildren) {
      // Tìm parent trong map của nhóm này trước
      let parent = categoryMap.get(cat.parentName!);

      // Nếu không có trong map, tìm trong DB
      if (!parent) {
        parent = await prisma.categories.findFirst({
          where: {
            name: cat.parentName!,
            parentId: { equals: null }, // ✅ Đổi thành này
          },
        });
      }

      if (!parent) continue;

      // Tìm theo name VÀ parentId
      const existing = await prisma.categories.findFirst({
        where: {
          name: cat.name,
          parentId: { equals: parent.id }, // ✅ Đổi thành này
        },
      });

      let category;
      if (existing) {
        category = await prisma.categories.update({
          where: { id: existing.id },
          data: {
            description: cat.description,
            imagePath: cat.imagePath,
            isFeatured: true,
          },
        });
      } else {
        const maxPosition = await prisma.categories.findFirst({
          where: { parentId: { equals: parent.id } }, // ✅ Đổi thành này
          orderBy: { position: "desc" },
          select: { position: true },
        });

        const nextPosition = (maxPosition?.position ?? -1) + 1;
        const slug = await generateUniqueSlug(prisma.categories, cat.name);

        category = await prisma.categories.create({
          data: {
            name: cat.name,
            slug,
            description: cat.description,
            imagePath: cat.imagePath,
            isFeatured: cat.isFeatured,
            parentId: parent.id,
            position: nextPosition,
          },
        });
      }

      created.push(category);
      categoryMap.set(cat.name, category);
      processedInThisRound.push(cat);
    }

    remainingChildren = remainingChildren.filter((c) => !processedInThisRound.includes(c));

    if (remainingChildren.length === previousCount) {
      const missingParents = remainingChildren.map((c) => c.parentName).join(", ");
      throw new Error(`Cannot create categories. Missing parents: ${missingParents}`);
    }
    previousCount = remainingChildren.length;
  }

  if (groupName) {
    console.log(`Created ${created.length} categories for ${groupName}`);
  }

  return created;
}
