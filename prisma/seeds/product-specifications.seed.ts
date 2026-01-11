import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProductSpecificationSeed {
  productSlug: string;
  specifications: {
    key: string;
    value: string;
  }[];
}

const productSpecificationsData: ProductSpecificationSeed[] = [
  {
    productSlug: "iphone-15",
    specifications: [
      { key: "screen", value: "6.1" },
      { key: "camera", value: "48" },
      { key: "chip", value: "A16 Bionic" },
      { key: "battery", value: "3349" },
      { key: "ram", value: "6" },
      { key: "storage", value: "128" },
    ],
  },
];

export async function seedProductSpecifications() {
  console.log("Seeding product specifications...");

  for (const item of productSpecificationsData) {
    const product = await prisma.products.findUnique({
      where: { slug: item.productSlug },
    });

    if (!product) {
      console.warn(`⚠ Product not found: ${item.productSlug}`);
      continue;
    }

    for (let i = 0; i < item.specifications.length; i++) {
      const specItem = item.specifications[i];

      const specification = await prisma.specifications.findUnique({
        where: { key: specItem.key },
      });

      if (!specification) {
        console.warn(`⚠ Specification not found: ${specItem.key}`);
        continue;
      }

      await prisma.product_specifications.upsert({
        where: {
          productId_specificationId: {
            productId: product.id,
            specificationId: specification.id,
          },
        },
        update: {
          value: specItem.value,
          sortOrder: i,
        },
        create: {
          productId: product.id,
          specificationId: specification.id,
          value: specItem.value,
          sortOrder: i,
        },
      });
    }
  }

  console.log("✅ Product specifications seeded");
}
