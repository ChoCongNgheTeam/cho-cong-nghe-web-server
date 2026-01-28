import { PrismaClient } from "@prisma/client";
import { allProducts } from "../seed-data/products";

export async function seedProductHighlights(prisma: PrismaClient) {
  console.log("🌱 Seeding product highlights...");

  for (const data of allProducts) {
    if (!data.highlights?.length) continue;

    const product = await prisma.products.findFirst({
      where: { name: data.name },
    });

    if (!product) {
      console.warn(`⚠️ Product not found for product: ${data.name}`);
      continue;
    }

    for (const hl of data.highlights) {
      const spec = await prisma.specifications.findUnique({
        where: { key: hl.key },
      });

      if (!spec) continue;

      await prisma.product_specifications.updateMany({
        where: {
          productId: product.id,
          specificationId: spec.id,
        },
        data: {
          isHighlight: true,
        },
      });
    }
  }

  console.log("Seeded product highlights");
}
