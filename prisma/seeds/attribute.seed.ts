import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const attributeData = [
  {
    name: "Color",
    options: ["Black", "White", "Silver", "Blue", "Red", "Gold", "Green"],
  },
  {
    name: "Size",
    options: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Storage",
    options: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  },
  {
    name: "RAM",
    options: ["4GB", "6GB", "8GB", "12GB", "16GB"],
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

    // Tạo options
    for (const value of attr.options) {
      await prisma.attributes_options.upsert({
        where: { attributeId_value: { attributeId: attribute.id, value } },
        update: {},
        create: { attributeId: attribute.id, value },
      });
    }

    createdAttributes.push(attribute);
  }

  console.log(`🚶‍➡️    Đã tạo ${createdAttributes.length} attributes với options`);
  return createdAttributes;
}
