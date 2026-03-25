import { SeedProductInput } from "../../types";

// oppo-a6-pro: 1 RAM duy nhất (8GB), slug: "oppo-a6-pro"
export const oppoA6Pro: SeedProductInput = {
  name: "OPPO A6 Pro",
  slug: "oppo-a6-pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A6 Pro – Nâng tầm trải nghiệm phân khúc phổ thông</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A6 Pro</strong> mang đến sự kết hợp hoàn hảo giữa RAM 8GB và thiết kế hiện đại. Viên pin lớn và khả năng tối ưu hóa hệ điều hành giúp sử dụng mượt mà trong thời gian dài.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a6-pro.jpg" alt="OPPO A6 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng Pro, giá thành phổ thông</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
