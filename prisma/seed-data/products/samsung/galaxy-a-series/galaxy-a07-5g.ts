import { SeedProductInput } from "../../types";

export const galaxyA07_5G: SeedProductInput = {
  name: "Samsung Galaxy A07 5G",
  slug: "samsung-galaxy-a07-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A07 5G – 5G cho mọi nhà</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A07 5G</strong> giúp người dùng dễ dàng tiếp cận công nghệ 5G với mức giá cực kỳ tiết kiệm. Pin dung lượng lớn đảm bảo liên lạc thông suốt cả ngày dài.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a07-5g.jpg" alt="Galaxy A07 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sự lựa chọn thông minh và kinh tế</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
