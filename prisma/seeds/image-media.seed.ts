import { PrismaClient, MediaType, MediaPosition } from "@prisma/client";
import { imageMediaSeeds } from "../seed-data/image-media";

const prisma = new PrismaClient();

export async function seedImageMedia() {
  console.log("🌱 Bắt đầu seeding image media (slider & banner)...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of imageMediaSeeds) {
    try {
      // Tạo mới luôn (không upsert)
      const media = await prisma.image_media.create({
        data: {
          type: data.type as MediaType,
          position: data.position as MediaPosition,
          title: data.title,
          imagePath: data.imagePath,
          imageUrl: null, // luôn để null như yêu cầu
          linkUrl: data.linkUrl,
          order: data.order,
          isActive: data.isActive ?? true,
        },
      });

      createdCount++;
      console.log(
        `  → Created: ${media.type} - ${media.position} (order ${media.order}) - ${media.title || "No title"}`,
      );
    } catch (err) {
      console.error(
        `Lỗi khi tạo media: ${data.type} - ${data.position} - order ${data.order}:`,
        err,
      );
      skippedCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Hoàn thành seeding image media:`);
  console.log(`   - Created: ${createdCount}`);
  console.log(`   - Skipped (lỗi): ${skippedCount}`);
  console.log("=".repeat(60) + "\n");

  return { created: createdCount, skipped: skippedCount };
}

// Chạy trực tiếp khi gọi file riêng lẻ
if (require.main === module) {
  seedImageMedia()
    .catch((e) => {
      console.error("Seed image media thất bại:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
