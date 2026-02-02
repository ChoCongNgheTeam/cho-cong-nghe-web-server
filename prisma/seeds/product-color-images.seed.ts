import { PrismaClient } from "@prisma/client";
import { variantImages } from "../seed-data/variants";

interface SeedProductColorImagesParams {
  products: Array<{ id: string; name: string; slug: string }>;
}

export async function seedProductColorImages(
  prisma: PrismaClient,
  { products }: SeedProductColorImagesParams,
) {
  console.log("🌱 Seeding product color images...");

  for (const product of products) {
    const colors = variantImages[product.slug];
    if (!colors) continue;

    for (const [color, images] of Object.entries(colors)) {
      for (const [index, imagePath] of images.entries()) {
        await prisma.product_color_images.upsert({
          where: {
            productId_color_imagePath: {
              productId: product.id,
              color,
              imagePath,
            },
          },
          update: {},
          create: {
            productId: product.id,
            color,
            imagePath,
            imageUrl: null,
            altText: `${product.name} ${color} - View ${index + 1}`,
            position: index + 1,
          },
        });
      }
    }
  }

  console.log("Seeded product color images");
}
