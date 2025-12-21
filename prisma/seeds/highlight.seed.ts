import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const highlightData = [
  { key: "battery", title: "Pin", icon: "/icons/battery.svg" },
  { key: "camera", title: "Camera", icon: "/icons/camera.svg" },
  { key: "screen", title: "Màn hình", icon: "/icons/screen.svg" },
  { key: "chip", title: "Chip xử lý", icon: "/icons/cpu.svg" },
  { key: "warranty", title: "Bảo hành", description: "Chính hãng 12 tháng" },
  { key: "waterproof", title: "Chống nước", icon: "/icons/water.svg" },
];

export async function seedHighlights() {
  console.log("Seeding highlights...");

  const highlights = [];
  for (const data of highlightData) {
    const highlight = await prisma.highlights.upsert({
      where: { key: data.key },
      update: {},
      create: data,
    });
    highlights.push(highlight);
  }

  console.log(`🚶‍➡️    Đã tạo ${highlights.length} highlights`);
  return highlights;
}
