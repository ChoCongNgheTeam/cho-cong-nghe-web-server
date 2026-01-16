import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";
import { allProducts } from "../seed-data/products";

const prisma = new PrismaClient();

interface SeedProductsParams {
  brands: any[];
  categories: any[];
}

export async function seedProducts({ brands, categories }: SeedProductsParams) {
  console.log("🌱 Seeding products...");

  const createdProducts = [];

  for (const data of allProducts) {
    const brand = brands.find((b) => b.name === data.brandName);
    if (!brand) {
      console.warn(`⚠️ Brand "${data.brandName}" không tồn tại → bỏ qua ${data.name}`);
      continue;
    }

    const slug = await generateUniqueSlug(prisma.products, data.name);

    // Lấy category chính (hiện tại bạn chỉ dùng 1, nên lấy phần tử đầu)
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
    console.log(`  → Created/Upserted: ${product.name}`);
  }

  console.log(`\n🚀 Hoàn thành! Đã xử lý ${createdProducts.length} sản phẩm\n`);
  return createdProducts;
}
