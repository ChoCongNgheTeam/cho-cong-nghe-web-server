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

/**
 * Attach attribute option to a variant
 */
async function attachAttributeOption(
  prisma: PrismaClient,
  productVariantId: string,
  attributeCode: string,
  value?: string,
) {
  if (!value) return;

  const attribute = await prisma.attributes.findUnique({
    where: { code: attributeCode },
  });

  if (!attribute) return;

  const option = await prisma.attributes_options.findFirst({
    where: {
      attributeId: attribute.id,
      value: { equals: value, mode: "insensitive" },
    },
  });

  if (!option) return;

  await prisma.variants_attributes.upsert({
    where: {
      productVariantId_attributeOptionId: {
        productVariantId,
        attributeOptionId: option.id,
      },
    },
    update: {},
    create: {
      productVariantId,
      attributeOptionId: option.id,
    },
  });
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

    for (const v of variantsForThisProduct) {
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
            isDefault: v.isDefault ?? false,
            isActive: true,
          },
        });

        // 🔗 Attach attributes
        await attachAttributeOption(prisma, variant.id, "color", v.color);
        await attachAttributeOption(prisma, variant.id, "storage", v.storage);
        // await attachAttributeOption(prisma, variant.id, "size", v.size);

        createdVariants.push(variant);
      } catch (err) {
        console.error(`❌ Error seeding variant ${code}:`, err);
      }
    }
  }

  console.log(`\n✅ Seeded ${createdVariants.length} variants\n`);
  return createdVariants;
}
