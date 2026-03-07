import { PrismaClient, MediaType, MediaPosition } from "@prisma/client";
import { imageMediaSeeds } from "../seed-data/image-media";

export async function seedImageMedia(prisma: PrismaClient) {
  console.log("🌱seeding image media (slider & banner)...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of imageMediaSeeds) {
    try {
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

  console.log(`Seeded image media:`);
  console.log(`   - Created: ${createdCount}`);
  console.log(`   - Skipped (lỗi): ${skippedCount}`);

  return { created: createdCount, skipped: skippedCount };
}
