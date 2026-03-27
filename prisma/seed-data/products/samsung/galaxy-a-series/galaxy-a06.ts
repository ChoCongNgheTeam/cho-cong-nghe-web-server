import { SeedProductInput } from "../../types";

export const galaxyA06: SeedProductInput = {
  name: "Samsung Galaxy A06",
  slug: "samsung-galaxy-a06",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A06 – Pin cực lớn, giải trí cực vui</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A06</strong> là lựa chọn hàng đầu cho những ai ưu tiên thời lượng sử dụng pin. Thiết kế tối giản nhưng sang trọng cùng camera chụp ảnh rõ nét trong điều kiện đủ sáng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a06.jpg" alt="Galaxy A06" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thời lượng pin ấn tượng cho cả ngày năng động</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
