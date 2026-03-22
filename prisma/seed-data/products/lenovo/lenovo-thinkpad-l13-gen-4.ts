import { SeedProductInput } from "../types";

export const lenovoThinkPadL13Gen4: SeedProductInput = {
  name: "Laptop Lenovo ThinkPad L13 Gen 4",
  slug: "lenovo-thinkpad-l13-gen-4",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">ThinkPad L13 Gen 4 – Hiệu năng ổn định cho doanh nghiệp</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">ThinkPad L13 Gen 4</strong> là sự kết hợp giữa tính di động cao và hiệu suất mạnh mẽ. Với thiết kế mỏng nhẹ nhưng vẫn đạt độ bền chuẩn quân đội, đây là chiếc laptop lý tưởng cho những người thường xuyên di chuyển và làm việc từ xa.
    </p>
  `,
  brandName: "Lenovo",
  categoryNames: ["Lenovo ThinkPad"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
