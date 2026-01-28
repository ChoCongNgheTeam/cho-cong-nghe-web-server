import { SeedProductInput } from "../types";

export const macbookPro14M5_16_512: SeedProductInput = {
  name: "Macbook Pro 14 M5 2025 10CPU/10GPU/16GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Macbook Pro 14 M5 2025 – Tương lai của máy tính xách tay</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro M5</strong> mang đến bước nhảy vọt về hiệu năng AI và khả năng tiết kiệm năng lượng vượt trội. Màn hình thế hệ mới với độ tương phản cực cao và thời lượng pin ấn tượng giúp bạn làm việc không giới hạn suốt cả ngày.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m5.jpg" alt="MacBook Pro 14 M5" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Chip M5 kiến trúc mới dẫn đầu thị trường</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
