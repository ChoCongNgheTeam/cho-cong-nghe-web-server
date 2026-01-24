import { PrismaClient } from "@prisma/client";
import { variantData, variantImages } from "../seed-data/variants";

const prisma = new PrismaClient();

interface SeedVariantsParams {
  products: Array<{ id: string; name: string; slug: string }>;
  attributes: Array<{ id: string; name: string }>;
}

export async function seedVariants({ products, attributes }: SeedVariantsParams) {
  console.log("🌱 Seeding product variants...");

  const colorAttr = attributes.find((a) => a.name.toLowerCase() === "color");
  const storageAttr = attributes.find((a) => a.name.toLowerCase() === "storage");

  if (!colorAttr || !storageAttr) {
    console.error("❌ Không tìm thấy attribute 'color' hoặc 'storage'");
    return [];
  }

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
            weight: 220, // có thể lấy từ data nếu sau này thêm field
          },
          create: {
            productId: product.id,
            code,
            price: v.price,
            weight: 220,
            isDefault: v.isDefault ?? false,
            isActive: true,
          },
        });

        // Attach attributes
        const colorOption = await prisma.attributes_options.findFirst({
          where: {
            attributeId: colorAttr.id,
            value: { equals: v.color, mode: "insensitive" },
          },
        });

        const storageOption = await prisma.attributes_options.findFirst({
          where: {
            attributeId: storageAttr.id,
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

        // Images
        const images = variantImages[product.name]?.[v.color] ?? [];

        if (images.length > 0) {
          for (const [imgIndex, imagePath] of images.entries()) {
            // Tạo mới, không cần upsert → nếu chạy seed nhiều lần sẽ tạo duplicate
            // (nếu bạn có unique constraint trên (productVariantId, imagePath) thì sẽ lỗi → xử lý ở Cách 2)
            await prisma.product_variant_images.create({
              data: {
                productVariantId: variant.id,
                imagePath,
                imageUrl: null,
                altText: `${product.name} ${v.color} - View ${imgIndex + 1}`,
                position: imgIndex + 1,
              },
            });
          }
        } else {
          // placeholder
          await prisma.product_variant_images.create({
            data: {
              productVariantId: variant.id,
              imagePath: "products/placeholder.png",
              altText: `${product.name} ${v.color} (placeholder)`,
              position: 1,
            },
          });
        }

        // Inventory
        await prisma.inventory.upsert({
          where: { variantId: variant.id },
          update: {
            quantity: 50 + index * 10,
            reservedQuantity: 0,
          },
          create: {
            variantId: variant.id,
            quantity: 50 + index * 10,
            reservedQuantity: 0,
          },
        });

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
