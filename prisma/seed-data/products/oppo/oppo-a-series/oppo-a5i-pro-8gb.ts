import { SeedProductInput } from "../../types";

export const oppoA5iPro: SeedProductInput = {
  name: "OPPO A5i Pro 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A5i Pro – Trải nghiệm mượt mà, bộ nhớ ấn tượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A5i Pro</strong> là bản nâng cấp đáng giá với RAM 8GB, giúp xử lý đa nhiệm mượt mà hơn bao giờ hết. Thiết kế sang trọng cùng màn hình tần số quét cao mang lại cảm giác vuốt chạm cực kỳ nhạy bén, phù hợp cho cả học tập và giải trí.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a5i-pro.jpg" alt="OPPO A5i Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Nâng tầm hiệu năng với dung lượng RAM lớn</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
