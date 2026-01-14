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
    { storage: "256GB", color: "Xanh", price: 15990000 }, // Xanh dương (Blue)
    { storage: "256GB", color: "Xanh lá", price: 16490000 }, // Màu mới thường giá cao hơn chút hoặc bằng
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
      "https://example.com/iphone13-black-front.jpg",
      "https://example.com/iphone13-black-side.jpg",
      "https://example.com/iphone13-black-back.jpg",
    ],
    Trắng: [
      "https://example.com/iphone13-white-front.jpg",
      "https://example.com/iphone13-white-side.jpg",
      "https://example.com/iphone13-white-back.jpg",
    ],
    Đỏ: [
      "https://example.com/iphone13-red-front.jpg",
      "https://example.com/iphone13-red-side.jpg",
      "https://example.com/iphone13-red-back.jpg",
    ],
    Hồng: [
      "https://example.com/iphone13-pink-front.jpg",
      "https://example.com/iphone13-pink-side.jpg",
      "https://example.com/iphone13-pink-back.jpg",
    ],
    Xanh: [
      "https://example.com/iphone13-blue-front.jpg",
      "https://example.com/iphone13-blue-side.jpg",
      "https://example.com/iphone13-blue-back.jpg",
    ],
    "Xanh lá": [
      "https://example.com/iphone13-alpine-green-front.jpg",
      "https://example.com/iphone13-alpine-green-side.jpg",
      "https://example.com/iphone13-alpine-green-back.jpg",
    ],
    "Xanh rêu": [
      "https://example.com/iphone13-midnight-blue-front.jpg",
      "https://example.com/iphone13-midnight-blue-side.jpg",
      "https://example.com/iphone13-midnight-blue-back.jpg",
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
        for (const [imgIndex, url] of imagesForThisVariant.entries()) {
          await prisma.product_variant_images.create({
            data: {
              productVariantId: createdVariant.id,
              imageUrl: url,
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
            imageUrl: `https://placehold.co/800x800?text=${encodeURIComponent(
              product.name + " " + variant.color
            )}`,
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
