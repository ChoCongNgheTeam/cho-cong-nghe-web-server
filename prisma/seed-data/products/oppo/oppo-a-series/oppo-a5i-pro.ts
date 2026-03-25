import { SeedProductInput } from "../../types";

// oppo-a5i-pro: 1 RAM duy nhất (8GB), slug: "oppo-a5i-pro"
export const oppoA5iPro: SeedProductInput = {
  name: "OPPO A5i Pro",
  slug: "oppo-a5i-pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A5i Pro – Trải nghiệm mượt mà, bộ nhớ ấn tượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A5i Pro</strong> là bản nâng cấp đáng giá với RAM 8GB, giúp xử lý đa nhiệm mượt mà. Thiết kế sang trọng cùng màn hình tần số quét cao mang lại cảm giác vuốt chạm cực kỳ nhạy bén.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a5i-pro.jpg" alt="OPPO A5i Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Nâng tầm hiệu năng với dung lượng RAM lớn</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
