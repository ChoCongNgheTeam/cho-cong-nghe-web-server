import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedVariantsParams {
  products: any[];
  attributes: any[];
}

const variantData = {
  "iPhone 13": [
    // --- Phiên bản 128 GB ---
    { storage: "128GB", color: "Trắng", price: 13490000, isDefault: true },
    { storage: "128GB", color: "Đen", price: 13490000 },
    { storage: "128GB", color: "Đỏ", price: 13490000 },
    { storage: "128GB", color: "Hồng", price: 13490000 },

    // --- Phiên bản 256 GB ---
    { storage: "256GB", color: "Đen", price: 15990000 },
    { storage: "256GB", color: "Trắng", price: 15990000 },
    { storage: "256GB", color: "Đỏ", price: 15990000 },
    { storage: "256GB", color: "Hồng", price: 15990000 },
    { storage: "256GB", color: "Xanh rêu", price: 16490000 },

    // --- Phiên bản 512 GB ---
    { storage: "512GB", color: "Đen", price: 18990000 },
  ],
  "Samsung Galaxy S24+": [
    { storage: "256GB", color: "Black", price: 33990000, isDefault: true },
    { storage: "512GB", color: "Gray", price: 38990000 },
  ],
  "Xiaomi 14 Ultra": [{ storage: "256GB", color: "Black", price: 21990000, isDefault: true }],
};

const variantImages: Record<string, Record<string, string[]>> = {
  "iPhone 13": {
    Đen: [
      "products/iphone-13/black/front.webp",
      "products/iphone-13/black/side.webp",
      "products/iphone-13/black/back.webp",
    ],
    Trắng: [
      "products/iphone-13/white/front.webp",
      "products/iphone-13/white/side.webp",
      "products/iphone-13/white/back.webp",
    ],
    Đỏ: [
      "products/iphone-13/red/front.webp",
      "products/iphone-13/red/side.webp",
      "products/iphone-13/red/back.webp",
    ],
    Hồng: [
      "products/iphone-13/pink/front.webp",
      "products/iphone-13/pink/side.webp",
      "products/iphone-13/pink/back.webp",
    ],
    "Xanh dương": [
      "products/iphone-13/blue/front.webp",
      "products/iphone-13/blue/side.webp",
      "products/iphone-13/blue/back.webp",
    ],
    "Xanh rêu": [
      "products/iphone-13/alpine-green/front.webp",
      "products/iphone-13/alpine-green/side.webp",
      "products/iphone-13/alpine-green/back.webp",
    ],
  },
};

export async function seedVariants({ products, attributes }: SeedVariantsParams) {
  console.log("Seeding product variants...");

  const colorAttr = attributes.find((a: any) => a.name === "Color");
  const storageAttr = attributes.find((a: any) => a.name === "Storage");

  const createdVariants: any[] = [];

  for (const product of products) {
    const variantsForProduct = variantData[product.name as keyof typeof variantData];
    if (!variantsForProduct) continue;

    for (const [index, variant] of variantsForProduct.entries()) {
      const code = `${product.slug.toUpperCase()}-${variant.storage}-${variant.color}`.replace(
        / /g,
        ""
      );

      const createdVariant = await prisma.products_variants.create({
        data: {
          productId: product.id,
          code,
          price: variant.price,
          weight: 220, // gram
          isDefault: variant.isDefault || false,
          isActive: true,
        },
      });

      // Gắn attributes
      const colorOption = await prisma.attributes_options.findFirst({
        where: { attributeId: colorAttr.id, value: variant.color },
      });
      const storageOption = await prisma.attributes_options.findFirst({
        where: { attributeId: storageAttr.id, value: variant.storage },
      });

      if (colorOption) {
        await prisma.variants_attributes.create({
          data: {
            productVariantId: createdVariant.id,
            attributeOptionId: colorOption.id,
          },
        });
      }
      if (storageOption) {
        await prisma.variants_attributes.create({
          data: {
            productVariantId: createdVariant.id,
            attributeOptionId: storageOption.id,
          },
        });
      }

      // Tạo images
      const imagesForThisVariant = variantImages[product.name]?.[variant.color];

      if (imagesForThisVariant && imagesForThisVariant.length > 0) {
        for (const [imgIndex, imagePath] of imagesForThisVariant.entries()) {
          await prisma.product_variant_images.create({
            data: {
              productVariantId: createdVariant.id,
              imagePath,
              imageUrl: null,
              altText: `${product.name} ${variant.color} - View ${imgIndex + 1}`,
              position: imgIndex + 1, // position bắt đầu từ 1 thường đẹp hơn
            },
          });
        }
      } else {
        // Fallback nếu không tìm thấy ảnh cho màu này (dùng placeholder)
        console.warn(`Không tìm thấy ảnh cho ${product.name} - ${variant.color}`);
        await prisma.product_variant_images.create({
          data: {
            productVariantId: createdVariant.id,
            imagePath: "products/placeholder.png",
            imageUrl: null,
            altText: `${product.name} ${variant.color} (placeholder)`,
            position: 1,
          },
        });
      }

      // Tạo inventory
      await prisma.inventory.create({
        data: {
          variantId: createdVariant.id,
          quantity: 50 + index * 10,
          reservedQuantity: 0,
        },
      });

      createdVariants.push(createdVariant);
    }
  }

  console.log(`🚶‍➡️    Đã tạo ${createdVariants.length} variants`);
  return createdVariants;
}
