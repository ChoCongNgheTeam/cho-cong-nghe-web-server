import { PrismaClient } from "@prisma/client";
import { variantImages } from "../seed-data/variants";

const prisma = new PrismaClient();

interface SeedProductColorImagesParams {
  products: Array<{ id: string; name: string; slug: string }>;
}

export async function seedProductColorImages({ products }: SeedProductColorImagesParams) {
  console.log("🌱 Seeding product color images...");

  for (const product of products) {
    const colors = variantImages[product.name];
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

  console.log("✅ Done seeding product color images");
}
