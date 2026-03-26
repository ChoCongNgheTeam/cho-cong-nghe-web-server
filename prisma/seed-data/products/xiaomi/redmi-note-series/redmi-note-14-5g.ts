import { SeedProductInput } from "../../types";

export const redmiNote14_5G: SeedProductInput = {
  name: "Xiaomi Redmi Note 14 5G",
  slug: "xiaomi-redmi-note-14-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 14 5G – Kết nối nhanh, giải trí mạnh</h2>
    <p class="text-neutral-darker">
      Sở hữu kết nối 5G tiên tiến và RAM 8GB, <strong class="font-semibold text-primary">Redmi Note 14 5G</strong> đảm bảo tốc độ tải dữ liệu cực nhanh và khả năng đa nhiệm ổn định. Thiết kế mỏng nhẹ hiện đại cùng viên pin 5000mAh giúp bạn tự tin sử dụng suốt ngày dài.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-14-5g.jpg" alt="Redmi Note 14 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Phong cách tối giản, tốc độ vượt trội</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
