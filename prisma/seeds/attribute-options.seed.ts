import { PrismaClient } from "@prisma/client";

const attributeOptionsData = [
  // COLOR
  { type: "color", value: "black", label: "Đen" },
  { type: "color", value: "white", label: "Trắng" },
  { type: "color", value: "red", label: "Đỏ" },
  { type: "color", value: "pink", label: "Hồng" },
  { type: "color", value: "blue", label: "Xanh dương" },
  { type: "color", value: "green", label: "Xanh lá" },
  { type: "color", value: "alpine-green", label: "Xanh rêu" },
  { type: "color", value: "gray", label: "Xám" },

  // STORAGE
  { type: "storage", value: "64gb", label: "64GB" },
  { type: "storage", value: "128gb", label: "128GB" },
  { type: "storage", value: "256gb", label: "256GB" },
  { type: "storage", value: "512gb", label: "512GB" },
  { type: "storage", value: "1tb", label: "1TB" },

  // SCREEN SIZE (TV)
  { type: "size", value: "43-inch", label: "43 inch" },
  { type: "size", value: "50-inch", label: "50 inch" },
  { type: "size", value: "55-inch", label: "55 inch" },
  { type: "size", value: "65-inch", label: "65 inch" },
  { type: "size", value: "75-inch", label: "75 inch" },
  { type: "size", value: "85-inch", label: "85 inch" },
];

export async function seedAttributeOptions(prisma: PrismaClient) {
  console.log("🌱 Seeding attribute options...");

  for (const option of attributeOptionsData) {
    await prisma.attributes_options.upsert({
      where: {
        type_value: {
          type: option.type,
          value: option.value,
        },
      },
      update: {
        label: option.label,
      },
      create: option,
    });
  }

  console.log(`Seeded ${attributeOptionsData.length} attribute options`);
}
