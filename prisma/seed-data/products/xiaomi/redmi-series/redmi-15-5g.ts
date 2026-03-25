import { SeedProductInput } from "../../types";

export const redmi15_5G: SeedProductInput = {
  name: "Xiaomi Redmi 15 5G",
  slug: "xiaomi-redmi-15-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi 15 5G – Phổ cập 5G với hiệu năng ấn tượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Redmi 15 5G</strong> là bước tiến lớn trong phân khúc giá rẻ, mang tốc độ mạng 5G và RAM 8GB đến với mọi người dùng. Thiết kế mặt lưng kính sang trọng cùng vi xử lý thế hệ mới giúp máy xử lý mượt mà các tác vụ hằng ngày và giải trí ổn định.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-15-5g.jpg" alt="Redmi 15 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng vượt trội, kết nối siêu tốc trong tầm giá</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
