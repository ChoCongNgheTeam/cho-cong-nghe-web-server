import { SeedProductInput } from "../../types";

export const redmi13X: SeedProductInput = {
  name: "Xiaomi Redmi 13x",
  slug: "xiaomi-redmi-13x",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi 13x – Sự lựa chọn tinh tế cho hiệu năng ổn định</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Redmi 13x</strong> sở hữu RAM 8GB mạnh mẽ giúp đa nhiệm mượt mà, vượt xa các đối thủ cùng tầm giá. Thiết kế vuông vức, mỏng nhẹ cùng camera 50MP sắc nét giúp bạn bắt trọn mọi khoảnh khắc với độ chi tiết cao.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-13x.jpg" alt="Redmi 13x" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Gọn nhẹ, thời trang và hiệu năng ấn tượng</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
