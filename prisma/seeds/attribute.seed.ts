import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const attributeData = [
  {
    name: "color",
    options: [
      { value: "black", label: "Đen" },
      { value: "white", label: "Trắng" },
      { value: "red", label: "Đỏ" },
      { value: "pink", label: "Hồng" },
      { value: "blue", label: "Xanh dương" },
      { value: "green", label: "Xanh lá" },
      { value: "alpine-green", label: "Xanh rêu" },
      { value: "gray", label: "Xám" },
    ],
  },
  {
    name: "size",
    options: [
      { value: "xs", label: "XS" },
      { value: "s", label: "S" },
      { value: "m", label: "M" },
      { value: "l", label: "L" },
      { value: "xl", label: "XL" },
      { value: "xxl", label: "XXL" },
    ],
  },
  {
    name: "storage",
    options: [
      { value: "64gb", label: "64GB" },
      { value: "128gb", label: "128GB" },
      { value: "256gb", label: "256GB" },
      { value: "512gb", label: "512GB" },
      { value: "1tb", label: "1TB" },
    ],
  },
  {
    name: "ram",
    options: [
      { value: "4gb", label: "4GB" },
      { value: "6gb", label: "6GB" },
      { value: "8gb", label: "8GB" },
      { value: "12gb", label: "12GB" },
      { value: "16gb", label: "16GB" },
    ],
  },
];

export async function seedAttributes() {
  console.log("Seeding attributes & options...");

  const createdAttributes = [];

  for (const attr of attributeData) {
    const attribute = await prisma.attributes.upsert({
      where: { name: attr.name },
      update: {},
      create: { name: attr.name },
    });

    for (const option of attr.options) {
      await prisma.attributes_options.upsert({
        where: {
          attributeId_value: {
            attributeId: attribute.id,
            value: option.value,
          },
        },
        update: {
          label: option.label,
        },
        create: {
          attributeId: attribute.id,
          value: option.value,
          label: option.label,
        },
      });
    }

    createdAttributes.push(attribute);
  }

  console.log(`🚶‍➡️ Đã tạo ${createdAttributes.length} attributes với options`);
  return createdAttributes;
}
