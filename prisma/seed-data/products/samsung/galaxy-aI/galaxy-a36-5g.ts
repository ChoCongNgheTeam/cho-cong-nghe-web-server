import { SeedProductInput } from "../../types";

export const galaxyA36: SeedProductInput = {
  name: "Samsung Galaxy A36 5G",
  slug: "samsung-galaxy-a36-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A36 5G – Kết nối tốc độ, trải nghiệm mượt mà</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A36 5G</strong> mang lại tốc độ 5G siêu nhanh trong một thiết kế tối giản, sang trọng. Được tối ưu hóa cho giải trí đa phương tiện với loa kép âm thanh nổi và kháng nước bụi chuẩn IP67.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a36.jpg" alt="Galaxy A36 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Giải trí không gián đoạn với hiệu năng ổn định</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
