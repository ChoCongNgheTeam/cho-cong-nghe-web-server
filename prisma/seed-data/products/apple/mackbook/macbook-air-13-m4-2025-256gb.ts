import { SeedProductInput } from "../../types";

export const macbookAir13M4_256: SeedProductInput = {
  name: "Macbook Air 13 M4 2025 10CPU/8GPU/16GB/256GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      MacBook Air 13 M4 2025 – Hiệu năng AI vượt trội
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Air M4</strong> mang đến sức mạnh xử lý 10 nhân CPU thế hệ mới, tối ưu cho các tác vụ trí tuệ nhân tạo và đa nhiệm. Thiết kế mỏng nhẹ không quạt giúp máy vận hành yên tĩnh tuyệt đối trong khi vẫn đảm bảo thời lượng pin lên đến 18 giờ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/macbook-air-m4.jpg" alt="MacBook Air 13 M4" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Siêu mỏng nhẹ và mạnh mẽ với chip Apple M4</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 13 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
