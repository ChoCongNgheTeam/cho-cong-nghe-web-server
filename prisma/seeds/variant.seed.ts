import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedVariantsParams {
  products: any[];
  attributes: any[];
}

const variantData = {
  "iPhone 13": [
    // --- 128 GB ---
    { storage: "128gb", color: "white", price: 13490000, isDefault: true },
    { storage: "128gb", color: "black", price: 13490000 },
    { storage: "128gb", color: "red", price: 13490000 },
    { storage: "128gb", color: "pink", price: 13490000 },

    // --- 256 GB ---
    { storage: "256gb", color: "black", price: 15990000 },
    { storage: "256gb", color: "white", price: 15990000 },
    { storage: "256gb", color: "red", price: 15990000 },
    { storage: "256gb", color: "pink", price: 15990000 },
    { storage: "256gb", color: "alpine-green", price: 16490000 },

    // --- 512 GB ---
    { storage: "512gb", color: "black", price: 18990000 },
  ],

  "Samsung Galaxy S24+": [
    { storage: "256gb", color: "black", price: 33990000, isDefault: true },
    { storage: "512gb", color: "gray", price: 38990000 }, // ⚠️ gray cần có trong attribute color
  ],

  "Xiaomi 14 Ultra": [{ storage: "256gb", color: "black", price: 21990000, isDefault: true }],
};

const variantImages: Record<string, Record<string, string[]>> = {
  "iPhone 13": {
    black: [
      "products/iphone-13/black/image-01.webp",
      "products/iphone-13/black/image-02.webp",
      "products/iphone-13/black/image-03.webp",
      "products/iphone-13/black/image-04.webp",
      "products/iphone-13/black/image-05.webp",
    ],
    white: [
      "products/iphone-13/white/image-01.webp",
      "products/iphone-13/white/image-02.webp",
      "products/iphone-13/white/image-03.webp",
      "products/iphone-13/white/image-04.webp",
      "products/iphone-13/white/image-05.webp",
    ],
    red: [
      "products/iphone-13/red/image-01.webp",
      "products/iphone-13/red/image-02.webp",
      "products/iphone-13/red/image-03.webp",
      "products/iphone-13/red/image-04.webp",
      "products/iphone-13/red/image-05.webp",
    ],
    pink: [
      "products/iphone-13/pink/image-01.webp",
      "products/iphone-13/pink/image-02.webp",
      "products/iphone-13/pink/image-03.webp",
      "products/iphone-13/pink/image-04.webp",
      "products/iphone-13/pink/image-05.webp",
    ],
    blue: [
      "products/iphone-13/blue/image-01.webp",
      "products/iphone-13/blue/image-02.webp",
      "products/iphone-13/blue/image-03.webp",
      "products/iphone-13/blue/image-04.webp",
      "products/iphone-13/blue/image-05.webp",
    ],
    "alpine-green": [
      "products/iphone-13/alpine-green/image-01.webp",
      "products/iphone-13/alpine-green/image-02.webp",
      "products/iphone-13/alpine-green/image-03.webp",
      "products/iphone-13/alpine-green/image-04.webp",
      "products/iphone-13/alpine-green/image-05.webp",
    ],
  },
};

export async function seedVariants({ products, attributes }: SeedVariantsParams) {
  console.log("Seeding product variants...");

  const colorAttr = attributes.find((a: any) => a.name === "color");
  const storageAttr = attributes.find((a: any) => a.name === "storage");

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
