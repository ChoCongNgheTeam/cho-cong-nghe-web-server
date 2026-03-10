// ================================================================
// oppo-a5i.ts
// Gộp từ: oppo-a5i-4gb.ts + oppo-a5i-6gb.ts
// variantData key: "oppo-a5i" → displayCard: true

import { SeedProductInput } from "../../types";

// ================================================================
export const oppoA5i: SeedProductInput = {
  name: "OPPO A5i",
  slug: "oppo-a5i",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A5i – Sắc màu rực rỡ, pin khỏe vượt trội</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A5i</strong> sở hữu màn hình rực rỡ với độ sáng cao, giúp hiển thị tốt ngay cả dưới ánh nắng gắt. Có 2 phiên bản 4GB và 6GB, phù hợp cho mọi nhu cầu và ngân sách.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a5i.jpg" alt="OPPO A5i" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Năng động với màu sắc trẻ trung</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
