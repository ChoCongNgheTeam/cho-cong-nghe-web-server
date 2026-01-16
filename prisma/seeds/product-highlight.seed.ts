import { PrismaClient } from "@prisma/client";
import { allProducts } from "../seed-data/products";

const prisma = new PrismaClient();

export async function seedProductHighlights() {
  console.log("🌟 Seeding product highlights...");

  for (const data of allProducts) {
    if (!data.highlights?.length) continue;

    const product = await prisma.products.findFirst({
      where: { name: data.name },
    });

    if (!product) {
      console.warn(`⚠️ Không tìm thấy product: ${data.name}`);
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

  console.log("✅ Product highlights seeded");
}
