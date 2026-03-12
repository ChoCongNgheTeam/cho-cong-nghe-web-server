import { SeedProductInput } from "../../types";

export const galaxyZFold7: SeedProductInput = {
  name: "Samsung Galaxy Z Fold7 5G",
  slug: "samsung-galaxy-z-fold7-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy Z Fold7 – Đỉnh cao đa nhiệm với Galaxy AI thế hệ mới</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy Z Fold7</strong> mở ra kỷ nguyên mới với thiết kế mỏng nhẹ kỷ lục và màn hình gập không nếp nhăn. Galaxy AI hỗ trợ dịch thuật trực tiếp và ghi chú chuyên nghiệp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/z-fold7.jpg" alt="Galaxy Z Fold7" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Trải nghiệm màn hình cực đại cùng công nghệ gập tiên tiến nhất</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
