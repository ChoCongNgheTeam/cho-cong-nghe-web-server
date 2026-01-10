import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

const prisma = new PrismaClient();

interface SeedProductsParams {
  brands: any[];
  categories: any[];
  highlights: any[];
}

const productData = [
  {
    name: "iPhone 15 Pro Max",
    description: "Flagship mới nhất của Apple với chip A17 Pro",
    brandName: "Apple",
    categoryNames: ["Điện thoại", "iPhone"],
    isFeatured: true,
    highlights: [
      { key: "chip", value: "A17 Pro" },
      { key: "camera", value: "48MP chính + tele 5x" },
      { key: "screen", value: "6.7 inch Super Retina XDR" },
      { key: "battery", value: "Lên đến 29 giờ xem video" },
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Đỉnh cao Android với bút S Pen",
    brandName: "Samsung",
    categoryNames: ["Điện thoại", "Galaxy"],
    isFeatured: true,
    highlights: [
      { key: "chip", value: "Snapdragon 8 Gen 3" },
      { key: "camera", value: "200MP chính" },
      { key: "screen", value: "6.8 inch Dynamic AMOLED 2X" },
    ],
  },
  {
    name: "Xiaomi 14",
    description: "Hiệu năng mạnh mẽ, giá hợp lý",
    brandName: "Xiaomi",
    categoryNames: ["Điện thoại"],
  },
];

export async function seedProducts({ brands, categories, highlights }: SeedProductsParams) {
  console.log("Seeding products...");

  const createdProducts = [];

  for (const data of productData) {
    const brand = brands.find((b: any) => b.name === data.brandName);
    if (!brand) {
      throw new Error(`Brand ${data.brandName} không tồn tại`);
    }

    const slug = await generateUniqueSlug(prisma.products, data.name);

    // Lấy danh sách category IDs để connect
    const categoryConnect = (data.categoryNames || [])
      .map((catName) => {
        const category = categories.find((c: any) => c.name === catName);
        return category ? { id: category.id } : null;
      })
      .filter(Boolean);

    const product = await prisma.products.upsert({
      where: { slug },
      update: {
        categories: {
          set: categoryConnect as { id: string }[],
        },
      },
      create: {
        name: data.name,
        description: data.description || "",
        slug,
        brandId: brand.id,
        isActive: true,
        isFeatured: data.isFeatured || false,
        categories: {
          connect: categoryConnect as { id: string }[],
        },
      },
    });

    // Gắn highlights (giữ nguyên vì là explicit table)
    if (data.highlights) {
      for (const hl of data.highlights) {
        const highlight = highlights.find((h: any) => h.key === hl.key);
        if (!highlight) continue;

        await prisma.product_highlights.upsert({
          where: {
            productId_highlightId: {
              productId: product.id,
              highlightId: highlight.id,
            },
          },
          update: {
            value: hl.value,
          },
          create: {
            productId: product.id,
            highlightId: highlight.id,
            value: hl.value,
          },
        });
      }
    }

    createdProducts.push(product);
  }

  console.log(`🚀 Đã tạo ${createdProducts.length} products`);
  return createdProducts;
}
