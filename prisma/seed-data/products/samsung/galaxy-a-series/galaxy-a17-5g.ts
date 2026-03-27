import { SeedProductInput } from "../../types";

export const galaxyA17_5G: SeedProductInput = {
  name: "Samsung Galaxy A17 5G",
  slug: "samsung-galaxy-a17-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A17 5G – Tốc độ mới, trải nghiệm mới</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A17 5G</strong> kết hợp sức mạnh mạng di động thế hệ mới với RAM 8GB mạnh mẽ. Lý tưởng cho việc livestream, xem phim chất lượng cao và xử lý công việc mượt mà mọi lúc.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a17-5g.jpg" alt="Galaxy A17 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Kết nối không giới hạn cùng Galaxy A17 5G</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
