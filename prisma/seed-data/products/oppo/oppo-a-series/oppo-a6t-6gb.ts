import { SeedProductInput } from "../../types";

export const oppoA6T_6GB: SeedProductInput = {
  name: "OPPO A6T 6GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A6T – Hiệu năng ổn định, kết nối thông minh</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A6T</strong> phiên bản 6GB mang đến sự cân bằng hoàn hảo giữa hiệu suất và tiết kiệm năng lượng. Hệ thống ColorOS tối ưu giúp máy vận hành ổn định, đi kèm với khả năng thu sóng mạnh mẽ, đảm bảo liên lạc luôn thông suốt.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a6t.jpg" alt="OPPO A6T" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Người bạn đồng hành tin cậy cho công việc hằng ngày</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
