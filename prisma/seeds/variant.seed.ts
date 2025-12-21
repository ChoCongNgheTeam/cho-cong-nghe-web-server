import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedVariantsParams {
  products: any[];
  attributes: any[];
}

const variantData = {
  "iPhone 15 Pro Max": [
    { storage: "256GB", color: "Black", price: 34990000, isDefault: true },
    { storage: "256GB", color: "White", price: 34990000 },
    { storage: "512GB", color: "Black", price: 39990000 },
  ],
  "Samsung Galaxy S24 Ultra": [
    { storage: "256GB", color: "Black", price: 33990000, isDefault: true },
    { storage: "512GB", color: "Gray", price: 38990000 },
  ],
  "Xiaomi 14": [{ storage: "256GB", color: "Black", price: 21990000, isDefault: true }],
};

const sampleImages = [
  "https://example.com/iphone15-black-1.jpg",
  "https://example.com/iphone15-black-2.jpg",
  "https://example.com/iphone15-black-3.jpg",
];

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
      for (const [imgIndex, url] of sampleImages.entries()) {
        await prisma.product_variant_images.create({
          data: {
            productVariantId: createdVariant.id,
            imageUrl: url.replace("iphone15", product.slug),
            altText: `${product.name} - ${variant.color}`,
            position: imgIndex,
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
