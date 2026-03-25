import { SeedProductInput } from "../types";
export const sonyPs5Slim: SeedProductInput = {
  name: "Máy chơi game Sony PlayStation 5 Slim",
  slug: "sony-playstation-5-slim",
  description: `<h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">PS5 Slim – Trải nghiệm Gaming đỉnh cao</h2><p class="text-neutral-darker">Thiết kế mỏng nhẹ hơn nhưng vẫn giữ nguyên sức mạnh xử lý 4K, ổ cứng SSD tốc độ cao 1TB giúp tải game trong tích tắc.</p>`,
  brandName: "Sony",
  categoryNames: ["Thiết bị chơi game"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_size" }, { key: "rom_capacity" }, { key: "battery_life" }],
};
