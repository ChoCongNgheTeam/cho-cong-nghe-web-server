import { PrismaClient, BlogStatus } from "@prisma/client";
import { blogSeeds } from "../seed-data/blogs";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

export async function seedBlogs(prisma: PrismaClient) {
  console.log("🌱 Bắt đầu seeding blogs...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of blogSeeds) {
    try {
      // Tìm author theo email (bạn có thể thay bằng cách khác nếu cần)
      const author = await prisma.users.findUnique({
        where: { email: data.authorEmail },
        select: { id: true, userName: true },
      });

      if (!author) {
        console.warn(
          `⚠️ Không tìm thấy author với email: ${data.authorEmail} → bỏ qua bài "${data.title}"`,
        );
        skippedCount++;
        continue;
      }

      // Tạo slug unique (nếu hàm generateUniqueSlug của bạn đã có sẵn)
      const finalSlug = await generateUniqueSlug(prisma.blogs, data.slug);

      const blog = await prisma.blogs.upsert({
        where: { slug: finalSlug },
        update: {
          title: data.title,
          content: data.content,
          imagePath: data.imagePath,
          status: data.status as BlogStatus,
          publishedAt: data.publishedAt,
          authorId: author.id,
          updatedAt: new Date(),
        },
        create: {
          title: data.title,
          slug: finalSlug,
          content: data.content,
          imagePath: data.imagePath,
          status: data.status as BlogStatus,
          publishedAt: data.publishedAt,
          authorId: author.id,
          viewCount: 0,
        },
      });

      createdCount++;
      console.log(
        `  → ${blog.status === BlogStatus.PUBLISHED ? "Published" : "Saved"}: ${blog.title} (slug: ${blog.slug})`,
      );
    } catch (err) {
      console.error(`⚠️  Error seeding "${data.title}":`, err);
      skippedCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Hoàn thành seeding blogs:`);
  console.log(`   - Created / Updated: ${createdCount}`);
  console.log(`   - Skipped: ${skippedCount}`);
  console.log("=".repeat(60) + "\n");

  return { created: createdCount, skipped: skippedCount };
}
