import { PrismaClient } from "@prisma/client";
import { generateUniqueSlug } from "@/utils/generate-unique-slug";

const prisma = new PrismaClient();

interface SeedProductsParams {
  brands: any[];
  categories: any[];
  highlights: any[];
}

const productData = [
  // --- APPLE ---
  {
    name: "iPhone 15",
    description: "Sự xuất hiện của Dynamic Island và cổng USB-C tiện lợi",
    brandName: "Apple",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "screen", value: "6.1 inch Super Retina XDR" },
      { key: "camera", value: "48MP Main" },
    ],
  },
  {
    name: "iPhone 14 Plus",
    description: "Màn hình lớn và thời lượng pin ấn tượng nhất",
    brandName: "Apple",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "battery", value: "Xem video đến 26 giờ" },
      { key: "chip", value: "A15 Bionic 5 nhân GPU" },
    ],
  },
  {
    name: "iPhone 13",
    description: "Lựa chọn hoàn hảo trong phân khúc cận cao cấp",
    brandName: "Apple",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "camera", value: "Hệ thống camera kép đặt chéo" },
      { key: "storage", value: "Từ 128GB tiêu chuẩn" },
    ],
  },
  {
    name: "iPhone SE 2022",
    description: "Sức mạnh của chip A15 bên trong thiết kế cổ điển",
    brandName: "Apple",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "chip", value: "A15 Bionic" },
      { key: "safety", value: "Touch ID bảo mật" },
    ],
  },
  {
    name: "iPhone 15 Pro",
    description: "Khung viền Titan nhẹ và bền bỉ hơn bao giờ hết",
    brandName: "Apple",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "chip", value: "A17 Pro" },
      { key: "action_button", value: "Nút tác vụ tùy chỉnh" },
    ],
  },

  // --- SAMSUNG ---
  {
    name: "Samsung Galaxy S24+",
    description: "Tích hợp quyền năng Galaxy AI vượt trội",
    brandName: "Samsung",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "ai", value: "Circle to Search, Live Translate" },
      { key: "screen", value: "QHD+ Dynamic AMOLED 2X" },
    ],
  },
  {
    name: "Samsung Galaxy Z Fold 5",
    description: "Chiếc điện thoại gập mở ra thế giới đa nhiệm",
    brandName: "Samsung",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "screen", value: "7.6 inch khi mở rộng" },
      { key: "productivity", value: "Hỗ trợ bút S Pen" },
    ],
  },
  {
    name: "Samsung Galaxy Z Flip 5",
    description: "Thiết kế gập vỏ sò thời thượng và màn hình phụ lớn",
    brandName: "Samsung",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "design", value: "Màn hình ngoài Flex Window" },
      { key: "camera", value: "Chụp ảnh FlexCam độc đáo" },
    ],
  },
  {
    name: "Samsung Galaxy A55 5G",
    description: "Camera AI sắc nét trong phân khúc tầm trung",
    brandName: "Samsung",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "security", value: "Samsung Knox Vault" },
      { key: "material", value: "Khung viền kim loại cao cấp" },
    ],
  },
  {
    name: "Samsung Galaxy M54",
    description: "Pin cực khủng 6000mAh cho trải nghiệm không gián đoạn",
    brandName: "Samsung",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "battery", value: "6000 mAh" },
      { key: "camera", value: "108MP OIS" },
    ],
  },

  // --- XIAOMI ---
  {
    name: "Xiaomi 14 Ultra",
    description: "Đỉnh cao nhiếp ảnh di động với ống kính Leica",
    brandName: "Xiaomi",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "lens", value: "Vario-Summilux Leica" },
      { key: "chip", value: "Snapdragon 8 Gen 3" },
    ],
  },
  {
    name: "Xiaomi 13T Pro",
    description: "Tuyệt tác Leica với khả năng sạc siêu nhanh 120W",
    brandName: "Xiaomi",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "charge", value: "120W HyperCharge" },
      { key: "waterproof", value: "Kháng nước IP68" },
    ],
  },
  {
    name: "Redmi Note 13 Pro 5G",
    description: "Màn hình 1.5K sắc nét và camera 200MP",
    brandName: "Xiaomi",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "camera", value: "200MP chống rung OIS" },
      { key: "screen", value: "AMOLED 120Hz" },
    ],
  },
  {
    name: "Redmi Note 12",
    description: "Sản phẩm quốc dân cân bằng mọi yếu tố",
    brandName: "Xiaomi",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "screen", value: "120Hz AMOLED" },
      { key: "battery", value: "Sạc nhanh 33W" },
    ],
  },
  {
    name: "Xiaomi Poco F6",
    description: "Quái vật hiệu năng chuyên game",
    brandName: "Xiaomi",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "chip", value: "Snapdragon 8s Gen 3" },
      { key: "cooling", value: "Tản nhiệt LiquidCool 4.0" },
    ],
  },

  // --- SONY ---
  {
    name: "Sony Xperia 1 V",
    description: "Màn hình 4K HDR OLED chuyên dụng cho điện ảnh",
    brandName: "Sony",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "camera", value: "Cảm biến Exmor T cho di động" },
      { key: "audio", value: "Loa Stereo toàn dải" },
    ],
  },
  {
    name: "Sony Xperia 5 V",
    description: "Nhỏ gọn nhưng mang sức mạnh của flagship",
    brandName: "Sony",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "design", value: "Kích thước cầm tay hoàn hảo" },
      { key: "editing", value: "Ứng dụng quay phim chuyên nghiệp" },
    ],
  },
  {
    name: "Sony Xperia 10 V",
    description: "Điện thoại 5G nhẹ nhất thế giới với pin 5000mAh",
    brandName: "Sony",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "weight", value: "Siêu nhẹ 159g" },
      { key: "audio", value: "High-Resolution Audio" },
    ],
  },
  {
    name: "Sony Xperia PRO-I",
    description: "Chiếc điện thoại có cảm biến máy ảnh 1 inch thực thụ",
    brandName: "Sony",
    categoryNames: ["Điện thoại"],
    isFeatured: true,
    highlights: [
      { key: "sensor", value: "1.0-type Exmor RS" },
      { key: "lens", value: "Zeiss Tessar T*" },
    ],
  },
  {
    name: "Sony Xperia 1 IV",
    description: "Khả năng zoom quang học thực thụ đầu tiên",
    brandName: "Sony",
    categoryNames: ["Điện thoại"],
    isFeatured: false,
    highlights: [
      { key: "zoom", value: "85-125mm optical zoom" },
      { key: "streaming", value: "Hỗ trợ livestream trực tiếp" },
    ],
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

    const categoryName = data.categoryNames?.[0];
    if (!categoryName) {
      throw new Error(`Product ${data.name} chưa có category`);
    }

    const category = categories.find((c: any) => c.name === categoryName);
    if (!category) {
      throw new Error(`Category ${categoryName} không tồn tại`);
    }

    const product = await prisma.products.upsert({
      where: { slug },
      update: {
        categoryId: category.id,
        brandId: brand.id,
        isFeatured: data.isFeatured || false,
      },
      create: {
        name: data.name,
        description: data.description || "",
        slug,
        brandId: brand.id,
        categoryId: category.id,
        isActive: true,
        isFeatured: data.isFeatured || false,
      },
    });

    // Gắn highlights (giữ nguyên vì là explicit table)
    if (data.highlights) {
      for (const [index, hl] of data.highlights.entries()) {
        const spec = highlights.find((s: any) => s.key === hl.key);
        if (!spec) continue;

        await prisma.product_highlights.upsert({
          where: {
            productId_specificationId: {
              productId: product.id,
              specificationId: spec.id,
            },
          },
          update: {
            sortOrder: index,
          },
          create: {
            productId: product.id,
            specificationId: spec.id,
            sortOrder: index,
          },
        });
      }
    }

    createdProducts.push(product);
  }

  console.log(`🚀 Đã tạo ${createdProducts.length} products`);
  return createdProducts;
}
