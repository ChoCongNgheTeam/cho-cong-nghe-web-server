import { PrismaClient } from "@prisma/client";
import { allPageSeeds } from "../seed-data/pages";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

export async function seedPages(prisma: PrismaClient) {
  console.log("🌱 Bắt đầu seeding pages & policies...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of allPageSeeds) {
    try {
      // Dùng hàm tạo slug unique của bạn để đảm bảo an toàn tuyệt đối
      const finalSlug = await generateUniqueSlug(prisma.pages, data.slug);

      const page = await prisma.pages.upsert({
        where: { slug: finalSlug },
        update: {
          title: data.title,
          content: data.content,
          type: data.type,
          policyType: data.policyType,
          isPublished: data.isPublished ?? true,
          priority: data.priority ?? 0,
          // Cập nhật thêm trường SEO (nếu bạn đã thêm vào schema)
          // metaTitle: data.metaTitle,
          // metaDescription: data.metaDescription,
          updatedAt: new Date(),
        },
        create: {
          title: data.title,
          slug: finalSlug,
          content: data.content,
          type: data.type,
          policyType: data.policyType,
          isPublished: data.isPublished ?? true,
          priority: data.priority ?? 0,
          // metaTitle: data.metaTitle,
          // metaDescription: data.metaDescription,
        },
      });

      createdCount++;
      console.log(
        `  → ${page.isPublished ? "Hiện" : "Ẩn"}: ${page.title} (Type: ${page.type})`
      );
    } catch (err) {
      console.error(`⚠️  Error seeding page "${data.title}":`, err);
      skippedCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Hoàn thành seeding pages:`);
  console.log(`   - Created / Updated: ${createdCount}`);
  console.log(`   - Skipped: ${skippedCount}`);
  console.log("=".repeat(60) + "\n");

  return { created: createdCount, skipped: skippedCount };
}