// ================================================================
// oppo-a6t.ts
// Gộp từ: oppo-a6t-4gb.ts + oppo-a6t-6gb.ts
// variantData key: "oppo-a6t" → displayCard: true

import { SeedProductInput } from "../../types";

// ================================================================
export const oppoA6T: SeedProductInput = {
  name: "OPPO A6T",
  slug: "oppo-a6t",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A6T – Hiệu năng ổn định, kết nối thông minh</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A6T</strong> mang đến sự cân bằng hoàn hảo giữa hiệu suất và tiết kiệm năng lượng. Có 2 phiên bản 4GB và 6GB, hệ thống ColorOS tối ưu giúp máy vận hành ổn định với khả năng thu sóng mạnh mẽ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a6t.jpg" alt="OPPO A6T" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Người bạn đồng hành tin cậy cho công việc hằng ngày</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
