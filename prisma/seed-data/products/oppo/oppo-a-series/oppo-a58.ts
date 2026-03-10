// ================================================================
// oppo-a58.ts
// Gộp từ: oppo-a58-6gb.ts + oppo-a58-8gb.ts
// variantData key: "oppo-a58" → displayCard: true

import { SeedProductInput } from "../../types";

// ================================================================
export const oppoA58: SeedProductInput = {
  name: "OPPO A58",
  slug: "oppo-a58",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A58 – Giải trí đỉnh cao với loa kép cực đại</h2>
    <p class="text-neutral-darker">
      Với màn hình Sunlight FHD+ rực rỡ và hệ thống loa kép âm thanh nổi, <strong class="font-semibold text-primary">OPPO A58</strong> là chiếc smartphone giải trí tuyệt vời trong tầm giá. Có 2 phiên bản 6GB và 8GB, đáp ứng mọi nhu cầu.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a58.jpg" alt="OPPO A58" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Âm thanh sống động, màn hình sắc nét</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
