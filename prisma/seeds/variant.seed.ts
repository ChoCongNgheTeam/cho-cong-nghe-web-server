import { PrismaClient } from "@prisma/client";
import { variantData, variantImages } from "../seed-data/variants";

const prisma = new PrismaClient();

interface SeedVariantsParams {
  products: Array<{ id: string; name: string; slug: string }>;
}

export async function seedVariants({ products }: SeedVariantsParams) {
  console.log("🌱 Seeding product variants...");

  const createdVariants = [];

  for (const product of products) {
    const variantsForThisProduct = variantData[product.name];
    if (!variantsForThisProduct || variantsForThisProduct.length === 0) {
      console.log(`  → Không có variant data cho sản phẩm: ${product.name}`);
      continue;
    }

    console.log(
      `  Processing variants for: ${product.name} (${variantsForThisProduct.length} variants)`,
    );

    for (const [index, v] of variantsForThisProduct.entries()) {
      const code =
        `${product.slug.toUpperCase()}-${v.storage.toUpperCase()}-${v.color.toUpperCase()}`.replace(
          /\s+/g,
          "",
        );

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
            update: {},
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
            update: {},
            create: {
              productVariantId: variant.id,
              attributeOptionId: storageOption.id,
            },
          });
        }

        // Inventory
        // await prisma.inventory.upsert({
        //   where: { variantId: variant.id },
        //   update: {
        //     quantity: 50 + index * 10,
        //     reservedQuantity: 0,
        //   },
        //   create: {
        //     variantId: variant.id,
        //     quantity: 50 + index * 10,
        //     reservedQuantity: 0,
        //   },
        // });

        createdVariants.push(variant);
        console.log(`    → Created/Upserted variant: ${code}`);
      } catch (err) {
        console.error(`Lỗi khi xử lý variant ${code}:`, err);
      }
    }
  }

  console.log(`\n✅ Hoàn thành! Đã xử lý ${createdVariants.length} variants\n`);
  return createdVariants;
}
