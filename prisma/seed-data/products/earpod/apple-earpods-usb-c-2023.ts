import { SeedProductInput } from "../types";

export const appleEarPodsUSBC: SeedProductInput = {
  name: "Apple EarPods USB-C (MYQY3ZA/A)",
  slug: "apple-earpods-usb-c",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Apple EarPods USB-C – Âm thanh thuần khiết, kết nối hiện đại</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">EarPods USB-C</strong> tương thích hoàn hảo với iPhone 15/16 trở lên, iPad và MacBook. Tích hợp cụm điều khiển âm lượng và micro, hỗ trợ nghe nhạc Lossless qua kết nối kỹ thuật số.
    </p>
  `,
  brandName: "Apple",
  categoryNames: ["Tai nghe nhét tai"],
  isFeatured: false,
  highlights: [{ key: "battery_capacity" }, { key: "bluetooth_version" }, { key: "water_resistance" }],
};
