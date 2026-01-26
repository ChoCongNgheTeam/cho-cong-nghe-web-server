import { PrismaClient, BlogStatus } from "@prisma/client";
import { blogSeeds } from "../seed-data/blogs";
import { generateUniqueSlug } from "@/utils/generate-unique-slug"; // nếu bạn đã có hàm này

const prisma = new PrismaClient();

export async function seedBlogs() {
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
          thumbnail: data.thumbnail,
          status: data.status as BlogStatus,
          publishedAt: data.publishedAt,
          authorId: author.id,
          updatedAt: new Date(),
        },
        create: {
          title: data.title,
          slug: finalSlug,
          content: data.content,
          thumbnail: data.thumbnail,
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
      console.error(`Lỗi khi seed bài viết "${data.title}":`, err);
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

// Chạy trực tiếp khi gọi file riêng lẻ (ts-node seeds/seed-blogs.ts)
if (require.main === module) {
  seedBlogs()
    .catch((e) => {
      console.error("Seed blogs thất bại:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
