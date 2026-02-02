import { PrismaClient } from "@prisma/client";
import { variantData } from "../seed-data/variants";

interface SeedVariantsParams {
  products: Array<{ id: string; name: string; slug: string }>;
}

function buildVariantCode(productSlug: string, v: any) {
  return [productSlug.toUpperCase(), v.storage?.toUpperCase(), v.color?.toUpperCase()]
    .filter(Boolean)
    .join("-")
    .replace(/\s+/g, "");
}

export async function seedVariants(prisma: PrismaClient, { products }: SeedVariantsParams) {
  console.log("🌱 Seeding product variants...");

  const createdVariants = [];

  for (const product of products) {
    const variantsForThisProduct = variantData[product.slug];
    if (!variantsForThisProduct || variantsForThisProduct.length === 0) {
      console.log(`⚠️ Product has no variants: ${product.name}`);
      continue;
    }

    console.log(
      `  Processing variants for: ${product.name} (${variantsForThisProduct.length} variants)`,
    );

    for (const [index, v] of variantsForThisProduct.entries()) {
      const code = buildVariantCode(product.slug, v);

      try {
        const variant = await prisma.products_variants.upsert({
          where: { code },
          update: {
            price: v.price,
            isDefault: v.isDefault ?? false,
            isActive: true,
          },
          create: {
            productId: product.id,
            code,
            price: v.price,
            // quantity: 10,
            isDefault: v.isDefault ?? false,
            isActive: true,
          },
        });

        // Attach attributes
        const colorOption = await prisma.attributes_options.findFirst({
          where: {
            type: "color",
            value: { equals: v.color, mode: "insensitive" },
          },
        });

        const storageOption = await prisma.attributes_options.findFirst({
          where: {
            type: "storage",
            value: { equals: v.storage, mode: "insensitive" },
          },
        });

        if (colorOption) {
          await prisma.variants_attributes.upsert({
            where: {
              productVariantId_attributeOptionId: {
                productVariantId: variant.id,
                attributeOptionId: colorOption.id,
              },
            },
            update: {
              attributeOptionId: colorOption.id,
            },
            create: {
              productVariantId: variant.id,
              attributeOptionId: colorOption.id,
            },
          });
        }

        if (storageOption) {
          await prisma.variants_attributes.upsert({
            where: {
              productVariantId_attributeOptionId: {
                productVariantId: variant.id,
                attributeOptionId: storageOption.id,
              },
            },
            update: {
              attributeOptionId: storageOption.id,
            },
            create: {
              productVariantId: variant.id,
              attributeOptionId: storageOption.id,
            },
          });
        }

        createdVariants.push(variant);
      } catch (err) {
        console.error(`Error seeding variant ${code}:`, err);
      }
    }
  }

  console.log(`\n Seeded ${createdVariants.length} variants\n`);
  return createdVariants;
}
