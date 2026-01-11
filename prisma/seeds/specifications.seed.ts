import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const specifications = [
  {
    key: "chip",
    name: "Chip",
    unit: null,
    icon: "cpu",
  },
  {
    key: "camera",
    name: "Camera",
    unit: "MP",
    icon: "camera",
  },
  {
    key: "screen",
    name: "Màn hình",
    unit: "inch",
    icon: "screen",
  },
  {
    key: "battery",
    name: "Pin",
    unit: "mAh",
    icon: "battery",
  },
  {
    key: "ram",
    name: "RAM",
    unit: "GB",
    icon: "ram",
  },
  {
    key: "storage",
    name: "Bộ nhớ trong",
    unit: "GB",
    icon: "storage",
  },
];

export async function seedSpecifications() {
  console.log("Seeding specifications...");

  const results = [];

  for (const spec of specifications) {
    const created = await prisma.specifications.upsert({
      where: { key: spec.key },
      update: {
        name: spec.name,
        unit: spec.unit,
        icon: spec.icon,
      },
      create: {
        key: spec.key,
        name: spec.name,
        unit: spec.unit,
        icon: spec.icon,
      },
    });

    results.push(created);
  }

  console.log(`✅ Đã seed ${results.length} specifications`);
  return results;
}
