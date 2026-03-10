import { PrismaClient } from "@prisma/client";
import { allProducts } from "../seed-data/products";

interface SeedProductsParams {
  brands: any[];
  categories: any[];
}

export async function seedProducts(prisma: PrismaClient, { brands, categories }: SeedProductsParams) {
  console.log("🌱 Seeding products...");

  const createdProducts = [];

  for (const data of allProducts) {
    const brand = brands.find((b) => b.name === data.brandName);
    if (!brand) {
      console.warn(`⚠️ Brand "${data.brandName}" not found. Skipping... ${data.name}`);
      continue;
    }

    // ← THAY ĐỔI: dùng slug từ data thay vì generate từ name
    // Đảm bảo slug trong product file = key trong variantData
    const slug = data.slug;

    const mainCategoryName = data.categoryNames[0];
    const category = categories.find((c) => c.name === mainCategoryName);

    if (!category) {
      console.warn(`⚠️ Category "${mainCategoryName}" không tồn tại → bỏ qua ${data.name}`);
      continue;
    }

    const product = await prisma.products.upsert({
      where: { slug },
      update: {
        name: data.name,
        description: data.description,
        categoryId: category.id,
        brandId: brand.id,
        isFeatured: data.isFeatured ?? false,
      },
      create: {
        name: data.name,
        description: data.description,
        slug,
        brandId: brand.id,
        categoryId: category.id,
        isActive: true,
        isFeatured: data.isFeatured ?? false,
      },
    });

    createdProducts.push(product);
    console.log(`Seeded: ${product.name} (${product.slug})`);
  }

  console.log(`\n Seeded ${createdProducts.length} products\n`);
  return createdProducts;
}
