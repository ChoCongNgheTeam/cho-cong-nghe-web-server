import { SeedProductInput } from "../../types";

export const galaxyA07: SeedProductInput = {
  name: "Samsung Galaxy A07",
  slug: "samsung-galaxy-a07",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A07 – Đơn giản, bền bỉ và đáng tin cậy</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A07</strong> tập trung vào những giá trị thực dụng nhất: pin khỏe, sóng ổn định và giao diện One UI dễ sử dụng. Phù hợp cho nhu cầu liên lạc và giải trí nhẹ nhàng hằng ngày.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a07.jpg" alt="Galaxy A07" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ đồng hành cùng bạn mỗi ngày</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
