import { SeedProductInput } from "../../types";

export const galaxyA17_5G: SeedProductInput = {
  name: "Samsung Galaxy A17 5G 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A17 5G – Tốc độ mới, trải nghiệm mới</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A17 5G</strong> kết hợp sức mạnh của mạng di động thế hệ mới với bộ nhớ RAM 8GB mạnh mẽ. Đây là thiết bị lý tưởng cho việc livestream, xem phim chất lượng cao và xử lý công việc mượt mà mọi lúc mọi nơi.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a17-5g.jpg" alt="Galaxy A17 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Kết nối không giới hạn cùng Galaxy A17 5G</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
