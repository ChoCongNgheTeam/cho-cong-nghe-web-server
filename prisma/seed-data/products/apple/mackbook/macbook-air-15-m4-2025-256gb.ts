import { SeedProductInput } from "../../types";

export const macbookAir15M4_256: SeedProductInput = {
  name: "Macbook Air 15 M4 2025 10CPU/10GPU/16GB/256GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Air 15 M4 – Tuyệt tác mỏng nhẹ thế hệ mới</h2>
    <p class="text-neutral-darker">
      Sở hữu chip <strong class="font-semibold text-primary">Apple M4</strong> mạnh mẽ trong một thân hình siêu mỏng, MacBook Air 15 inch mang lại hiệu suất vượt trội cho cả công việc và giải trí. Hệ thống âm thanh 6 loa với Spatial Audio mang đến trải nghiệm nghe nhìn rạp hát ngay tại nhà.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mba-15-m4-design.jpg" alt="Thiết kế MacBook Air 15 M4" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sức mạnh tối tân ẩn bên trong thiết kế không quạt yên tĩnh</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 15 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
