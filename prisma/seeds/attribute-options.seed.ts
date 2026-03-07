import { PrismaClient } from "@prisma/client";

const attributeOptionsData = {
  color: [
    { value: "black", label: "Đen" },
    { value: "white", label: "Trắng" },
    { value: "red", label: "Đỏ" },
    { value: "pink", label: "Hồng" },
    { value: "blue", label: "Xanh dương" },
    { value: "green", label: "Xanh lá" },
    { value: "alpine-green", label: "Xanh rêu" },
    { value: "gray", label: "Xám" },
  ],
  storage: [
    { value: "64gb", label: "64GB" },
    { value: "128gb", label: "128GB" },
    { value: "256gb", label: "256GB" },
    { value: "512gb", label: "512GB" },
    { value: "1tb", label: "1TB" },
  ],
  size: [
    { value: "43-inch", label: "43 inch" },
    { value: "50-inch", label: "50 inch" },
    { value: "55-inch", label: "55 inch" },
    { value: "65-inch", label: "65 inch" },
    { value: "75-inch", label: "75 inch" },
    { value: "85-inch", label: "85 inch" },
  ],
};

export async function seedAttributesAndOptions(prisma: PrismaClient) {
  console.log("🌱 Seeding attributes & options...");

  for (const [code, options] of Object.entries(attributeOptionsData)) {
    // 1upsert attribute
    const attribute = await prisma.attributes.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: code === "color" ? "Màu sắc" : code === "storage" ? "Bộ nhớ" : "Kích thước",
      },
    });

    //  upsert options
    for (const opt of options) {
      await prisma.attributes_options.upsert({
        where: {
          attributeId_value: {
            attributeId: attribute.id,
            value: opt.value,
          },
        },
        update: {
          label: opt.label,
        },
        create: {
          attributeId: attribute.id,
          value: opt.value,
          label: opt.label,
        },
      });
    }
  }

  console.log(" Seeded attributes & options");
}
